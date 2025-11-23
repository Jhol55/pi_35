'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SupportScreen } from '../../../components/pages/support';
import { useUser } from '../../../contexts/UserContext';

export default function SupportPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleNavigate = (screen) => {
    if (screen === 'home') {
      router.push('/home');
    }
  };

  return (
    <SupportScreen
      onNavigate={handleNavigate}
      userProfile={user}
    />
  );
}
