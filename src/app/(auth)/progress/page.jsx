'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressScreen } from '../../../components/pages/progress';
import { getModules, getModuleById } from '../../../actions/activity';
import { getUserProgress } from '../../../actions/progress';
import { getUserBadges } from '../../../actions/badge';
import { useUser } from '../../../contexts/UserContext';

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: userLoading, logout } = useUser();
  const [modules, setModules] = useState([]);
  const [badges, setBadges] = useState([]);
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
      const modulesWithProgress = modulesData.map(module => ({
        ...module,
        progress: progressMap[module.id]?.progress_percentage || 0,
        lessons: progressMap[module.id]?.total_lessons || 0
      }));

      setModules(modulesWithProgress);
    }

    // Load user badges
    const badgesResult = await getUserBadges(user.id);
    if (badgesResult.success) {
      const badgeList = badgesResult.badges.map(ub => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        description: ub.badge.description,
        earnedAt: ub.earned_at
      }));
      setBadges(badgeList);
    }

    setLoading(false);
  };

  const handleNavigate = async (screen) => {
    if (screen === 'home') {
      router.push('/home');
    } else if (screen === 'activity') {
      // Try to find first module with activities
      if (modules.length > 0) {
        const moduleId = modules[0].id;
        const moduleResult = await getModuleById(moduleId);
        if (moduleResult.success && moduleResult.module.lesson) {
          const firstLesson = moduleResult.module.lesson[0];
          if (firstLesson && firstLesson.activity && firstLesson.activity.length > 0) {
            const firstActivity = firstLesson.activity[0];
            router.push(`/activity?id=${firstActivity.id}`);
            return;
          }
        }
      }
      router.push('/activity');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando progresso...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ProgressScreen
      userProfile={user}
      modules={modules}
      badges={badges}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
