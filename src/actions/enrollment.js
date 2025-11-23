'use server';

import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function enrollStudent(studentId, disciplineIds) {
  const supabase = await createClient();

  try {
    const results = [];
    const errors = [];

    for (const disciplineId of disciplineIds) {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollment')
        .select('id')
        .eq('student_id', studentId)
        .eq('discipline_id', disciplineId)
        .single();

      if (existing) {
        errors.push({ disciplineId, error: 'Já matriculado nesta disciplina' });
        continue;
      }

      // Check prerequisites
      const { data: prerequisites } = await supabase
        .from('prerequisite')
        .select('required_discipline_id')
        .eq('discipline_id', disciplineId);

      if (prerequisites && prerequisites.length > 0) {
        const requiredIds = prerequisites.map(p => p.required_discipline_id);
        
        // Check if student has completed all prerequisites
        const { data: completedPrereqs } = await supabase
          .from('academic_history')
          .select('discipline_id')
          .eq('student_id', studentId)
          .eq('status', 'approved')
          .in('discipline_id', requiredIds);

        const completedIds = completedPrereqs?.map(c => c.discipline_id) || [];
        const missingPrereqs = requiredIds.filter(id => !completedIds.includes(id));

        if (missingPrereqs.length > 0) {
          errors.push({ disciplineId, error: 'Prerequisites not met', missingPrereqs });
          continue;
        }
      }

      // Check available slots
      const { data: discipline } = await supabase
        .from('discipline')
        .select('available_slots')
        .eq('id', disciplineId)
        .single();

      if (!discipline || discipline.available_slots <= 0) {
        errors.push({ disciplineId, error: 'Não há vagas disponíveis' });
        continue;
      }

      // Create enrollment
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollment')
        .insert({
          student_id: studentId,
          discipline_id: disciplineId,
          status: 'active',
          enrollment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (enrollError) {
        errors.push({ disciplineId, error: enrollError.message });
        continue;
      }

      // Decrement available slots
      await supabase
        .from('discipline')
        .update({ available_slots: discipline.available_slots - 1 })
        .eq('id', disciplineId);

      results.push(enrollment);
    }

    revalidatePath('/admin/enrollments');
    return { success: results.length > 0, enrollments: results, errors };
  } catch (error) {
    return { error: error.message || 'Falha ao matricular estudante' };
  }
}

export async function getEnrollments(studentId = null) {
  const supabase = await createClient();

  let query = supabase
    .from('enrollment')
    .select('*, student(*, person(*)), discipline(*)')
    .order('enrollment_date', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { success: true, enrollments: data };
}

export async function updateEnrollmentStatus(enrollmentId, status, grade = null) {
  const supabase = await createClient();

  const updateData = { status };
  if (grade !== null) {
    updateData.grade = grade;
  }

  const { error } = await supabase
    .from('enrollment')
    .update(updateData)
    .eq('id', enrollmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/enrollments');
  return { success: true };
}

export async function cancelEnrollment(enrollmentId) {
  const supabase = await createClient();

  // Get enrollment to restore slot
  const { data: enrollment } = await supabase
    .from('enrollment')
    .select('discipline_id')
    .eq('id', enrollmentId)
    .single();

  if (enrollment) {
    // Increment available slots
    const { data: discipline } = await supabase
      .from('discipline')
      .select('available_slots')
      .eq('id', enrollment.discipline_id)
      .single();

    if (discipline) {
      await supabase
        .from('discipline')
        .update({ available_slots: discipline.available_slots + 1 })
        .eq('id', enrollment.discipline_id);
    }
  }

  // Update enrollment status
  const { error } = await supabase
    .from('enrollment')
    .update({ status: 'cancelled' })
    .eq('id', enrollmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/enrollments');
  return { success: true };
}

