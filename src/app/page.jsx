'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginScreen } from '../components/pages/login';
import { useUser } from '../contexts/UserContext';

export default function Page() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect to home or questionnaire
      if (user.interests && user.interests.length > 0) {
        router.push('/home');
      } else {
        router.push('/questionnaire');
}
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return <LoginScreen />;
}