'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivityScreen } from '../../../components/pages/activity';
import { getActivityById, getActivitiesByLesson, getModuleById } from '../../../actions/activity';
import { saveActivityProgress, getUserActivityProgress, saveStudySession } from '../../../actions/progress';
import { useUser } from '../../../contexts/UserContext';

export default function ActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading, logout } = useUser();
  const [activity, setActivity] = useState(null);
  const [existingProgress, setExistingProgress] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const loadedActivityIdRef = useRef(null); // Track which activity is currently loaded

  // Check authentication
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // Load activity only when activityId changes, not when user updates
  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      return; // Will be handled by auth check above
    }

    const activityId = searchParams.get('id') || searchParams.get('activityId');
    
    if (!activityId) {
      router.push('/home');
      return;
    }

    // Only reload if activityId actually changed
    if (loadedActivityIdRef.current !== activityId) {
      loadedActivityIdRef.current = activityId;
      loadActivity(activityId);
    }
  }, [searchParams, userLoading]); // Removed 'user' from dependencies

  const loadActivity = async (activityId) => {
    setLoading(true);
    
    // Load activity data
    const result = await getActivityById(activityId);
    if (result.success) {
      setActivity(result.activity);
      
      // Load existing progress if user is logged in
      if (user) {
        const progressResult = await getUserActivityProgress(user.id, activityId);
        if (progressResult.success) {
          setExistingProgress(progressResult.progress);
        }
      }
      
      // Load all activities from the entire module for navigation
      if (result.activity.lesson) {
        const moduleId = result.activity.lesson.module_id || result.activity.lesson.module?.id;
        if (moduleId) {
          // Get all lessons in the module
          const moduleResult = await getModuleById(moduleId);
          if (moduleResult.success && moduleResult.module.lesson) {
            // Collect all activities from all lessons
            const allModuleActivities = [];
            moduleResult.module.lesson.forEach(lesson => {
              if (lesson.activity && lesson.activity.length > 0) {
                lesson.activity.forEach(activity => {
                  allModuleActivities.push(activity);
                });
              }
            });
            
            // Sort by lesson order_index and activity order_index
            allModuleActivities.sort((a, b) => {
              const lessonA = moduleResult.module.lesson.find(l => l.id === a.lesson_id);
              const lessonB = moduleResult.module.lesson.find(l => l.id === b.lesson_id);
              if (lessonA?.order_index !== lessonB?.order_index) {
                return (lessonA?.order_index || 0) - (lessonB?.order_index || 0);
              }
              return (a.order_index || 0) - (b.order_index || 0);
            });
            
            setAllActivities(allModuleActivities);
            // Find current activity index
            const index = allModuleActivities.findIndex(a => a.id === activityId);
            setCurrentActivityIndex(index >= 0 ? index : -1);
          }
        } else {
          // Fallback: load activities from same lesson only
          const activitiesResult = await getActivitiesByLesson(result.activity.lesson_id, user?.id);
          if (activitiesResult.success) {
            setAllActivities(activitiesResult.activities);
            const index = activitiesResult.activities.findIndex(a => a.id === activityId);
            setCurrentActivityIndex(index >= 0 ? index : -1);
          }
        }
      }
    } else {
      // Activity not found, redirect to home
      router.push('/home');
    }
    setLoading(false);
  };

  const handleNavigate = (screen, activityId = null) => {
    if (screen === 'home') {
      router.push('/home');
    } else if (screen === 'activity' && activityId) {
      router.push(`/activity?id=${activityId}`);
    } else if (screen === 'previous' && currentActivityIndex > 0) {
      const prevActivity = allActivities[currentActivityIndex - 1];
      if (prevActivity) {
        router.push(`/activity?id=${prevActivity.id}`);
      }
    } else if (screen === 'next' && currentActivityIndex >= 0 && currentActivityIndex < allActivities.length - 1) {
      const nextActivity = allActivities[currentActivityIndex + 1];
      if (nextActivity) {
        router.push(`/activity?id=${nextActivity.id}`);
      }
    }
  };

  const handleUpdateProfile = async (updates) => {
    if (!user || !activity) {
      return;
    }
    
    try {
      // Use provided maxScore or calculate from activity items
      const maxScore = updates.maxScore || (activity.items?.length * 10) || 30;
      const score = updates.points || 0;
      // Use provided completed status, or consider complete if >= 50%
      const completed = updates.completed !== undefined ? updates.completed : (score >= (maxScore * 0.5));
      
      // Get selected items from updates if provided
      const selectedItems = updates.selectedItems || [];
      const studyDuration = updates.studyDuration || 0;
      
      // Save study session if duration > 0
      if (studyDuration > 0) {
        await saveStudySession(user.id, activity.id, studyDuration);
      }
      
      // Save progress to database
      const result = await saveActivityProgress(
        user.id,
        activity.id,
        score,
        maxScore,
        completed,
        selectedItems
      );
      
      if (result.error) {
        console.error('Error saving progress:', result.error);
      } else {
        // Return badges to the activity screen
        if (updates.onBadgesAwarded && result.badges && result.badges.length > 0) {
          updates.onBadgesAwarded(result.badges);
        }
        // Reload user data to get updated points and badges
        // Use a small delay to avoid triggering activity reload
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('user-updated'));
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error in handleUpdateProfile:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando atividade...</p>
      </div>
    );
  }

  if (!user || !activity) {
    return null;
  }

  return (
    <ActivityScreen
      userProfile={user}
      onNavigate={handleNavigate}
      updateUserProfile={handleUpdateProfile}
      activity={activity}
      existingProgress={existingProgress}
      allActivities={allActivities}
      currentActivityIndex={currentActivityIndex}
      onLogout={handleLogout}
    />
  );
}
