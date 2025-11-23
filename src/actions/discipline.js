'use server';

import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getDisciplines() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('discipline')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { success: true, disciplines: data || [] };
}

export async function getDisciplineById(disciplineId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('discipline')
    .select('*, prerequisite(*)')
    .eq('id', disciplineId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, discipline: data };
}

export async function createDiscipline(disciplineData) {
  const supabase = await createClient();

  // Check if code already exists
  const { data: existing } = await supabase
    .from('discipline')
    .select('id')
    .eq('code', disciplineData.code)
    .single();

  if (existing) {
    return { error: 'Discipline code already exists' };
  }

  const { data, error } = await supabase
    .from('discipline')
    .insert({
      name: disciplineData.name,
      code: disciplineData.code,
      workload: disciplineData.workload,
      total_slots: disciplineData.total_slots || 0,
      available_slots: disciplineData.available_slots || disciplineData.total_slots || 0,
      course: disciplineData.course
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/disciplines');
  return { success: true, discipline: data };
}

export async function updateDiscipline(disciplineId, disciplineData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('discipline')
    .update(disciplineData)
    .eq('id', disciplineId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/disciplines');
  return { success: true };
}

export async function addPrerequisite(disciplineId, requiredDisciplineId) {
  const supabase = await createClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from('prerequisite')
    .select('id')
    .eq('discipline_id', disciplineId)
    .eq('required_discipline_id', requiredDisciplineId)
    .single();

  if (existing) {
    return { error: 'Prerequisite already exists' };
  }

  const { data, error } = await supabase
    .from('prerequisite')
    .insert({
      discipline_id: disciplineId,
      required_discipline_id: requiredDisciplineId
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/disciplines');
  return { success: true, prerequisite: data };
}

