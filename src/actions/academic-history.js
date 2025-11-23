'use server';

import { createClient } from '../lib/supabase/server';

export async function getAcademicHistory(studentId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academic_history')
    .select('*, discipline(*)')
    .eq('student_id', studentId)
    .order('year', { ascending: false })
    .order('period', { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { success: true, history: data || [] };
}

export async function generateAcademicHistoryPDF(studentId) {
  const supabase = await createClient();

  // Get student info
  const { data: student } = await supabase
    .from('student')
    .select('*, person(*)')
    .eq('id', studentId)
    .single();

  if (!student) {
    return { error: 'Estudante não encontrado' };
  }

  // Get academic history
  const { data: history } = await supabase
    .from('academic_history')
    .select('*, discipline(*)')
    .eq('student_id', studentId)
    .order('year', { ascending: false })
    .order('period', { ascending: false });

  if (!history || history.length === 0) {
    return { error: 'Nenhum histórico acadêmico encontrado' };
  }

  // Return data for PDF generation (PDF generation will be handled in the component)
  return {
    success: true,
    student: {
      name: student.person.name,
      enrollmentNumber: student.enrollment_number,
      course: student.course
    },
    history: history
  };
}

export async function createAcademicHistoryRecord(recordData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academic_history')
    .insert({
      student_id: recordData.student_id,
      discipline_id: recordData.discipline_id,
      final_grade: recordData.final_grade,
      status: recordData.status,
      period: recordData.period,
      year: recordData.year
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, record: data };
}

