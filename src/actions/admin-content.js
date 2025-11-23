'use server';

import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- MODULES ---

export async function createModule(data) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('module')
    .insert({
      title: data.title,
      description: data.description,
      code: data.code,
      order_index: data.order_index,
      discipline_id: data.discipline_id || null,
      active: data.active !== undefined ? data.active : true
    });

  if (error) return { error: error.message };
  revalidatePath('/admin/modules');
  revalidatePath('/home');
  return { success: true };
}

export async function updateModule(id, data) {
  const supabase = await createClient();

  // Ensure discipline_id is included if provided
  const updateData = { ...data };
  if (data.discipline_id !== undefined) {
    updateData.discipline_id = data.discipline_id || null;
  }

  const { error } = await supabase
    .from('module')
    .update(updateData)
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/modules');
  revalidatePath('/home');
  return { success: true };
}

export async function deleteModule(id) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('module')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/admin/modules');
  revalidatePath('/home');
  return { success: true };
}

export async function getModulesAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('module')
    .select('*, discipline(id, name, code)')
    .order('order_index', { ascending: true });

  if (error) return { error: error.message };
  return { success: true, modules: data };
}

// --- LESSONS ---

export async function getLessonsByModuleId(moduleId) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lesson')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });

  if (error) return { error: error.message };
  return { success: true, lessons: data };
}

export async function createLesson(data) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('lesson')
    .insert({
      module_id: data.module_id,
      title: data.title,
      description: data.description,
      order_index: data.order_index,
      active: true
    });

  if (error) return { error: error.message };
  revalidatePath(`/admin/modules/${data.module_id}`);
  return { success: true };
}

export async function deleteLesson(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('lesson').delete().eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

// --- ACTIVITIES ---

export async function getActivitiesByLessonId(lessonId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (error) return { error: error.message };
  return { success: true, activities: data };
}

export async function createActivity(data) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('activity')
    .insert(data); // data should match schema

  if (error) return { error: error.message };
  return { success: true };
}
