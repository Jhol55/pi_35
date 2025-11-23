'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeScreen } from '../../../components/pages/home';
import { getModules, getModuleById } from '../../../actions/activity';
import { getUserProgress, getTodayProgress } from '../../../actions/progress';
import { useUser } from '../../../contexts/UserContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: userLoading, logout } = useUser();
  const [modules, setModules] = useState([]);
  const [todayProgress, setTodayProgress] = useState({ activitiesCompleted: 0, studyTimeMinutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      loadData();
    }
  }, [user, userLoading]);

  // Listen for user updates (e.g., after completing activity)
  useEffect(() => {
    if (!user?.id) return;

    const handleUserUpdate = () => {
      loadData();
    };

    window.addEventListener('user-updated', handleUserUpdate);

    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Load modules
    const modulesResult = await getModules();
    if (modulesResult.success) {
      const modulesData = modulesResult.modules;
      
      // Load user progress for each module
      const progressResult = await getUserProgress(user.id);
      
      const progressMap = {};
      
      if (progressResult.success && progressResult.modules) {
        progressResult.modules.forEach(p => {
          progressMap[p.module_id] = p;
        });
      }

      // Merge modules with progress
      const modulesWithProgress = modulesData.map(module => {
        const progress = progressMap[module.id];
        // Use totalActivities from module data if progress doesn't exist
        const totalActivities = progress?.total_activities || module.totalActivities || 0;
        
        return {
          ...module,
          progress: progress?.progress_percentage || 0,
          lessons: progress?.total_lessons || 0,
          activities: totalActivities
        };
      });

      setModules(modulesWithProgress);
    }

    // Load today's progress
    const todayResult = await getTodayProgress(user.id);
    if (todayResult.success) {
      setTodayProgress({
        activitiesCompleted: todayResult.activitiesCompleted,
        studyTimeMinutes: todayResult.studyTimeMinutes
      });
    }

    setLoading(false);
  };

  const handleNavigate = async (screen, moduleId = null) => {
    if (screen === 'activity' && moduleId) {
      // Get first activity from module
      const moduleResult = await getModuleById(moduleId);
      if (moduleResult.success && moduleResult.module.lesson) {
        const firstLesson = moduleResult.module.lesson[0];
        if (firstLesson && firstLesson.activity && firstLesson.activity.length > 0) {
          const firstActivity = firstLesson.activity[0];
          router.push(`/activity?id=${firstActivity.id}`);
          return;
        }
      }
      router.push('/activity');
    } else if (screen === 'activity') {
      router.push('/activity');
    } else if (screen === 'support') {
      router.push('/support');
    } else if (screen === 'progress') {
      router.push('/progress');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <HomeScreen
      userProfile={user}
      onNavigate={handleNavigate}
      modules={modules}
      loading={loading}
      todayProgress={todayProgress}
      getModuleById={getModuleById}
      onLogout={handleLogout}
    />
  );
}
