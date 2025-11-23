'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
      }
    });

    // Listen for user updates (e.g., after completing activity)
    const handleUserUpdate = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error('Error handling user update:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('user-updated', handleUserUpdate);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('user-updated', handleUserUpdate);
      }
    };
  }, []); // Remove user?.id dependency to avoid re-registering listener

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    }
  };

  // Translate Supabase error messages to Portuguese
  const translateError = (errorMessage) => {
    if (!errorMessage) return 'Erro desconhecido';
    
    const errorLower = errorMessage.toLowerCase();
    
    // Common Supabase auth errors
    if (errorLower.includes('email not confirmed') || errorLower.includes('email_not_confirmed')) {
      return 'Email não confirmado';
    }
    if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid_credentials')) {
      return 'Email ou senha incorretos';
    }
    if (errorLower.includes('user not found')) {
      return 'Usuário não encontrado';
    }
    if (errorLower.includes('email already registered') || errorLower.includes('user already registered')) {
      return 'Este email já está cadastrado';
    }
    if (errorLower.includes('password')) {
      return 'Erro na senha. Verifique se ela tem pelo menos 6 caracteres';
    }
    if (errorLower.includes('email')) {
      return 'Email inválido';
    }
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet';
    }
    
    return errorMessage;
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If error is email not confirmed, try to confirm it automatically via API
        const errorLower = error.message?.toLowerCase() || '';
        if (errorLower.includes('email not confirmed') || 
            errorLower.includes('email_not_confirmed')) {
          try {
            // Call API to confirm email (will use service role)
            const confirmRes = await fetch('/api/auth/confirm-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            
            if (confirmRes.ok) {
              // Try login again after confirmation
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (!retryError && retryData.user) {
                await loadUserData(retryData.user.id);
                return { success: true, user: retryData.user };
              }
            }
          } catch (confirmError) {
            // If auto-confirm fails, continue with original error
            console.error('Error auto-confirming email:', confirmError);
          }
        }
        return { error: translateError(error.message) };
      }

      if (data.user) {
        await loadUserData(data.user.id);
        return { success: true, user: data.user };
      }

      return { error: 'Falha no login' };
    } catch (error) {
      return { error: translateError(error.message) || 'Falha no login' };
    }
  };

  const signUp = async (name, email, password) => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        }
      });

      if (authError) {
        return { error: translateError(authError.message) };
      }

      if (authData.user) {
        // Auto-confirm email using server action
        const confirmResponse = await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authData.user.id })
        });

        // Create user record in database
        const { data: userData, error: userError } = await supabase
          .from('user')
          .insert({
            id: authData.user.id,
            name,
            email,
            user_type: 'learner',
            points: 0,
            level: 1,
            badges: [],
            interests: []
          })
          .select()
          .single();

        if (userError) {
          return { error: translateError(userError.message) };
        }

        // Reload user data after confirmation
        await loadUserData(authData.user.id);
        
        return { success: true, user: userData };
      }

      return { error: 'Falha no cadastro' };
    } catch (error) {
      return { error: translateError(error.message) || 'Falha no cadastro' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (updates) => {
    if (!user) return { error: 'Usuário não encontrado' };

    try {
      const { data, error } = await supabase
        .from('user')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error: translateError(error.message) };
      }

      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      return { error: translateError(error.message) || 'Erro ao atualizar usuário' };
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, signUp, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
