'use server';

import { createClient } from '../lib/supabase/server';
import { createAdminClient } from '../lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveActivityProgress(userId, activityId, score, maxScore, completed = false, selectedItems = []) {
  // Use admin client to bypass RLS for server actions
  const supabase = createAdminClient();
  
  // Also get the regular client to verify user session
  const regularClient = await createClient();
  const { data: { user: authUser } } = await regularClient.auth.getUser();
  
  // Verify that userId matches authenticated user
  if (authUser && authUser.id !== userId) {
    return { error: 'Não autorizado' };
  }

  const progressPercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Get or create progress record
  const { data: existing, error: existingError } = await supabase
    .from('user_activity_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_id', activityId)
    .maybeSingle(); // Use maybeSingle to avoid error if no record exists

  // Calculate best score
  const currentBestScore = existing?.best_score || 0;
  const newBestScore = Math.max(currentBestScore, score);
  
  const progressData = {
    score: Math.max(existing?.score || 0, score),
    best_score: newBestScore,
    max_score: maxScore,
    progress_percentage: Math.max(existing?.progress_percentage || 0, progressPercentage),
    completed: completed || existing?.completed || false, // Update completed status - if new completion, mark as completed
    selected_items: selectedItems.length > 0 ? selectedItems : (existing?.selected_items || []), // Save selected items
    attempts: (existing?.attempts || 0) + 1,
    last_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Set completed_at if activity is being completed for the first time
  if (completed && !existing?.completed_at) {
    progressData.completed_at = new Date().toISOString();
  }

  let result;
  if (existing && !existingError) {
    // Update existing record
    result = await supabase
      .from('user_activity_progress')
      .update(progressData)
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    // Create new record
    result = await supabase
      .from('user_activity_progress')
      .insert({
        user_id: userId,
        activity_id: activityId,
        ...progressData
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error saving activity progress:', result.error);
    return { error: result.error.message };
  }

  // Update user points if activity is completed
  if (completed) {
    // Award points based on the actual score achieved
    // Score is calculated as: (correct answers * 10) - (incorrect answers * 5)
    const pointsToAward = Math.max(0, score); // Use the score directly as points
    
    if (pointsToAward > 0 && (!existing || !existing.completed)) {
      // Get current user points
      const { data: user } = await supabase
        .from('user')
        .select('points, badges')
        .eq('id', userId)
        .single();

      if (user) {
        // Update points and calculate level
        const newPoints = (user.points || 0) + pointsToAward;
        const newLevel = Math.floor(newPoints / 100) + 1;

        const { error: updateError } = await supabase
          .from('user')
          .update({
            points: newPoints,
            level: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user points:', updateError);
        }
      }
    }
  }

  // Update module progress
  await updateModuleProgress(userId, activityId);

  // Check and award badges
  let awardedBadges = [];
  if (completed) {
    awardedBadges = await checkAndAwardBadges(userId, activityId, score);
  }

  revalidatePath('/home');
  revalidatePath('/activity');
  return { success: true, progress: result.data, badges: awardedBadges };
}

async function checkAndAwardBadges(userId, activityId, score) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient();
  
  const awardedBadges = []; // Track newly awarded badges

  try {
    // Get all available badges
    const { data: badges, error: badgesError } = await supabase
      .from('badge')
      .select('*');

    if (badgesError || !badges || badges.length === 0) {
      return awardedBadges;
    }

    // Get user's current stats (including the activity just completed)
    const { data: userProgress, error: progressError } = await supabase
      .from('user_activity_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return;
    }
    
    const activitiesCompleted = userProgress?.length || 0;

    // Get user's earned badges
    const { data: userBadges, error: badgesFetchError } = await supabase
      .from('user_badge')
      .select('badge_id')
      .eq('user_id', userId);
    
    if (badgesFetchError) {
      console.error('Error fetching user badges:', badgesFetchError);
      return;
    }
    
    const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];

    for (const badge of badges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;
      const criteria = badge.criteria ? (typeof badge.criteria === 'string' ? JSON.parse(badge.criteria) : badge.criteria) : {};

      // Check "First Activity" badge
      if (criteria.activities_completed && activitiesCompleted >= criteria.activities_completed) {
        earned = true;
      }

      // Check "Score" based badges
      if (criteria.min_score && score >= criteria.min_score) {
        // Get activity title to check context
        const { data: activityData } = await supabase
          .from('activity')
          .select('title')
          .eq('id', activityId)
          .single();
        
        const activityTitle = (activityData?.title || '');
        
        // Check if badge has specific activity_id
        if (criteria.activity_id) {
          if (criteria.activity_id === activityId) {
            earned = true;
          }
        } 
        // Check if badge has specific activity_title
        else if (criteria.activity_title) {
          if (activityTitle === criteria.activity_title) {
            earned = true;
          }
        }
        // Generic badge for any high score
        else {
          earned = true;
        }
      }

      // Check module completion badge
      if (criteria.module_progress && criteria.module_progress === 100) {
        // This would need module progress check - implement if needed
      }

      if (earned) {
        const { error: insertError } = await supabase
          .from('user_badge')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            earned_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error awarding badge:', insertError);
        } else {
          awardedBadges.push({
            name: badge.name,
            description: badge.description,
            icon: badge.icon
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error);
  }
  
  return awardedBadges;
}

async function updateModuleProgress(userId, activityId) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient();

  // Get activity's module
  const { data: activity } = await supabase
    .from('activity')
    .select('lesson(module_id)')
    .eq('id', activityId)
    .single();

  if (!activity?.lesson) return;

  const moduleId = activity.lesson.module_id;

  // Get all lessons in module
  const { data: lessons } = await supabase
    .from('lesson')
    .select('id')
    .eq('module_id', moduleId)
    .eq('active', true)
    .order('order_index', { ascending: true });

  if (!lessons || lessons.length === 0) return;

  const lessonIds = lessons.map(l => l.id);

  // Get all activities in module
  const { data: activities } = await supabase
    .from('activity')
    .select('id, lesson_id')
    .in('lesson_id', lessonIds)
    .eq('active', true);

  if (!activities || activities.length === 0) return;

  const activityIds = activities.map(a => a.id);

  // Get user's progress for all activities in module
  const { data: progress } = await supabase
    .from('user_activity_progress')
    .select('activity_id, completed')
    .eq('user_id', userId)
    .in('activity_id', activityIds);

  // Count completed activities
  const completedActivityIds = new Set(
    progress?.filter(p => p.completed).map(p => p.activity_id) || []
  );

  // Calculate progress based on completed activities (not lessons)
  const totalActivities = activities.length;
  const completedActivitiesCount = completedActivityIds.size;
  const progressPercentage = totalActivities > 0 
    ? Math.round((completedActivitiesCount / totalActivities) * 100) 
    : 0;
  
  // Also calculate lessons completed for tracking
  const lessonsCompleted = new Set();
  const lessonsWithActivities = new Set();
  
  lessons.forEach(lesson => {
    const lessonActivities = activities.filter(a => a.lesson_id === lesson.id);
    if (lessonActivities.length > 0) {
      lessonsWithActivities.add(lesson.id);
      const allCompleted = lessonActivities.every(a => completedActivityIds.has(a.id));
      if (allCompleted) {
        lessonsCompleted.add(lesson.id);
      }
    }
  });

  const totalLessons = lessonsWithActivities.size;
  const completedLessonsCount = lessonsCompleted.size;

  // Get or create module progress
  const { data: existing } = await supabase
    .from('user_module_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle();

  const moduleProgressData = {
    progress_percentage: progressPercentage,
    lessons_completed: completedLessonsCount,
    total_lessons: totalLessons,
    total_activities: activities.length, // Total number of activities in module
    last_accessed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (existing) {
    const { error: updateError } = await supabase
      .from('user_module_progress')
      .update(moduleProgressData)
      .eq('id', existing.id);
    
    if (updateError) {
      console.error('Error updating module progress:', updateError);
    }
  } else {
    const { error: insertError } = await supabase
      .from('user_module_progress')
      .insert({
        user_id: userId,
        module_id: moduleId,
        ...moduleProgressData
      });
    
    if (insertError) {
      console.error('Error inserting module progress:', insertError);
    }
  }
}

export async function getUserModuleProgress(userId, moduleId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_module_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    return { error: error.message };
  }

  return { success: true, progress: data || null };
}

export async function getUserActivityProgress(userId, activityId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_activity_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_id', activityId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }

  return { success: true, progress: data || null };
}

export async function getUserProgress(userId) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient();

  const { data: modules, error: modulesError } = await supabase
    .from('user_module_progress')
    .select('*, module(*)')
    .eq('user_id', userId);

  if (modulesError) {
    console.error('❌ Error fetching user progress:', modulesError);
    return { error: modulesError.message };
  }

  return { success: true, modules: modules || [] };
}

export async function saveStudySession(userId, activityId, durationMinutes) {
  const supabase = createAdminClient();
  
  try {
    const endedAt = new Date();
    const startedAt = new Date(endedAt.getTime() - (durationMinutes * 60 * 1000));
    
    const { data, error } = await supabase
      .from('study_session')
      .insert({
        user_id: userId,
        activity_id: activityId,
        duration_minutes: durationMinutes,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving study session:', error);
      return { error: error.message };
    }
    
    return { success: true, session: data };
  } catch (error) {
    console.error('Error in saveStudySession:', error);
    return { error: error.message };
  }
}

export async function getTodayProgress(userId) {
  // Use admin client to bypass RLS
  const supabase = createAdminClient();
  
  try {
    // Get today's date range (start and end of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStart = today.toISOString();
    const todayEnd = tomorrow.toISOString();
    
    // Get activities completed today
    const { data: todayActivities, error: activitiesError } = await supabase
      .from('user_activity_progress')
      .select('id, completed_at, attempts')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', todayStart)
      .lt('completed_at', todayEnd);
    
    if (activitiesError) {
      console.error('Error fetching today activities:', activitiesError);
    }
    
    const activitiesCompletedToday = todayActivities?.length || 0;
    
    // Get real study time from study sessions
    const { data: todaySessions, error: sessionsError } = await supabase
      .from('study_session')
      .select('duration_minutes')
      .eq('user_id', userId)
      .gte('started_at', todayStart)
      .lt('started_at', todayEnd);
    
    if (sessionsError) {
      console.error('Error fetching today study sessions:', sessionsError);
    }
    
    // Sum all study time from sessions
    const realStudyTime = todaySessions?.reduce((total, session) => total + (session.duration_minutes || 0), 0) || 0;
    
    return {
      success: true,
      activitiesCompleted: activitiesCompletedToday,
      studyTimeMinutes: realStudyTime
    };
  } catch (error) {
    console.error('Error in getTodayProgress:', error);
    return {
      success: true,
      activitiesCompleted: 0,
      studyTimeMinutes: 0
    };
  }
}
