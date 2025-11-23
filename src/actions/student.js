'use server';

import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function registerStudent(studentData) {
  const supabase = await createClient();

  try {
    // Validate CPF format (basic validation)
    if (studentData.cpf_cnpj && !/^\d{11}$/.test(studentData.cpf_cnpj.replace(/\D/g, ''))) {
      return { error: 'Formato de CPF inválido' };
    }

    // Check if CPF already exists
    const { data: existingPerson } = await supabase
      .from('person')
      .select('id')
      .eq('cpf_cnpj', studentData.cpf_cnpj)
      .single();

    if (existingPerson) {
      return { error: 'CPF já cadastrado' };
    }

    // Check if email already exists
    if (studentData.email) {
      const { data: existingEmail } = await supabase
        .from('person')
        .select('id')
        .eq('email', studentData.email)
        .single();

      if (existingEmail) {
        return { error: 'Email já cadastrado' };
      }
    }

    // Create person record
    const { data: person, error: personError } = await supabase
      .from('person')
      .insert({
        name: studentData.name,
        cpf_cnpj: studentData.cpf_cnpj,
        address: studentData.address,
        email: studentData.email,
        phone: studentData.phone,
        birth_date: studentData.birth_date
      })
      .select()
      .single();

    if (personError) {
      return { error: personError.message };
    }

    // Generate enrollment number
    const enrollmentNumber = `ENR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('student')
      .insert({
        person_id: person.id,
        enrollment_number: enrollmentNumber,
        course: studentData.course
      })
      .select()
      .single();

    if (studentError) {
      // Rollback: delete person if student creation fails
      await supabase.from('person').delete().eq('id', person.id);
      return { error: studentError.message };
    }

    revalidatePath('/admin/students');
    return { success: true, student: { ...student, person } };
  } catch (error) {
    return { error: error.message || 'Falha ao cadastrar estudante' };
  }
}

export async function getStudents() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('student')
    .select('*, person(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, students: data };
}

export async function getStudentById(studentId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('student')
    .select('*, person(*)')
    .eq('id', studentId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, student: data };
}

export async function updateStudent(studentId, studentData) {
  const supabase = await createClient();

  try {
    // Get student to find person_id
    const { data: student } = await supabase
      .from('student')
      .select('person_id')
      .eq('id', studentId)
      .single();

    if (!student) {
      return { error: 'Estudante não encontrado' };
    }

    // Update person
    const { error: personError } = await supabase
      .from('person')
      .update({
        name: studentData.name,
        address: studentData.address,
        email: studentData.email,
        phone: studentData.phone,
        birth_date: studentData.birth_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', student.person_id);

    if (personError) {
      return { error: personError.message };
    }

    // Update student
    const { error: studentError } = await supabase
      .from('student')
      .update({
        course: studentData.course,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId);

    if (studentError) {
      return { error: studentError.message };
    }

    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    return { error: error.message || 'Falha ao atualizar estudante' };
  }
}

export async function deleteStudent(studentId) {
  const supabase = await createClient();

  // Get student to find person_id (cascade will delete person)
  const { error } = await supabase
    .from('student')
    .delete()
    .eq('id', studentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/students');
  return { success: true };
}

