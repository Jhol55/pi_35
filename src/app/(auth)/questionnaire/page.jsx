'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterestQuestionnaire } from '../../../components/pages/interest-questionnaire';
import { useUser } from '../../../contexts/UserContext';

export default function QuestionnairePage() {
  const router = useRouter();
  const { user, loading, updateUser } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (!loading && user && user.interests && user.interests.length > 0) {
      // User already completed questionnaire
      router.push('/home');
    }
  }, [user, loading]);

  const handleComplete = async (screen) => {
    if (screen === 'home') {
      router.push('/home');
    }
  };

  const handleUpdateProfile = async (updates) => {
    const updateData = {};
    
    if (updates.interests) {
      updateData.interests = updates.interests;
    }
    
    if (updates.learning_style) {
      updateData.learning_style = updates.learning_style;
    }
    
    if (Object.keys(updateData).length > 0) {
      await updateUser(updateData);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <InterestQuestionnaire
      onComplete={handleComplete}
      setUserProfile={handleUpdateProfile}
    />
  );
}

