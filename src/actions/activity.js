'use server';

import { createClient } from '../lib/supabase/server';

export async function getModules() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('module')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  // For each module, count total activities
  if (data && data.length > 0) {
    const modulesWithCounts = await Promise.all(
      data.map(async (module) => {
        // Get lessons for this module
        const { data: lessons } = await supabase
          .from('lesson')
          .select('id')
          .eq('module_id', module.id)
          .eq('active', true);

        if (lessons && lessons.length > 0) {
          const lessonIds = lessons.map(l => l.id);
          
          // Count activities in these lessons
          const { data: activities } = await supabase
            .from('activity')
            .select('id')
            .in('lesson_id', lessonIds)
            .eq('active', true);

          return {
            ...module,
            totalActivities: activities?.length || 0
          };
        }

        return {
          ...module,
          totalActivities: 0
        };
      })
    );

    return { success: true, modules: modulesWithCounts };
  }

  return { success: true, modules: data || [] };
}

export async function getModuleById(moduleId) {
  const supabase = await createClient();

  // Get module
  const { data: module, error: moduleError } = await supabase
    .from('module')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (moduleError) {
    return { error: moduleError.message };
  }

  // Get lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lesson')
    .select('*')
    .eq('module_id', moduleId)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (lessonsError) {
    return { error: lessonsError.message };
  }

  // Get activities for each lesson
  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map(l => l.id);
    const { data: activities, error: activitiesError } = await supabase
      .from('activity')
      .select('*')
      .in('lesson_id', lessonIds)
      .eq('active', true)
      .order('order_index', { ascending: true });

    if (!activitiesError && activities) {
      lessons.forEach(lesson => {
        lesson.activity = activities.filter(a => a.lesson_id === lesson.id);
      });
    }
  }

  return { success: true, module: { ...module, lesson: lessons || [] } };
}

export async function getActivityById(activityId) {
  const supabase = await createClient();

  const { data: activity, error: activityError } = await supabase
    .from('activity')
    .select('*, lesson(module(*))')
    .eq('id', activityId)
    .single();

  if (activityError) {
    return { error: activityError.message };
  }

  const { data: items, error: itemsError } = await supabase
    .from('activity_item')
    .select('*')
    .eq('activity_id', activityId)
    .order('order_index', { ascending: true });

  if (itemsError) {
    return { error: itemsError.message };
  }

  return { success: true, activity: { ...activity, items: items || [] } };
}

export async function getActivitiesByModule(moduleId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activity')
    .select('*, lesson!inner(module_id)')
    .eq('lesson.module_id', moduleId)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { success: true, activities: data || [] };
}

export async function getActivitiesByLesson(lessonId, userId = null) {
  const supabase = await createClient();

  // Get activities for the lesson
  const { data: activities, error: activitiesError } = await supabase
    .from('activity')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (activitiesError) {
    return { error: activitiesError.message };
  }

  // If userId is provided, also get progress for each activity
  if (userId && activities && activities.length > 0) {
    const activityIds = activities.map(a => a.id);
    const { data: progressData } = await supabase
      .from('user_activity_progress')
      .select('*')
      .eq('user_id', userId)
      .in('activity_id', activityIds);

    // Map progress to activities
    if (progressData) {
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.activity_id] = p;
      });

      activities.forEach(activity => {
        activity.progress = progressMap[activity.id] || null;
      });
    }
  }

  return { success: true, activities: activities || [] };
}

