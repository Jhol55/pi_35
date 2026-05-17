'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';

const UserContext = createContext(null);

const PROFILE_NOT_FOUND_ERROR =
  'Perfil não encontrado. Entre em contato ou crie conta novamente.';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData();
      } else {
        setUser(null);
      }
    });

    const handleUserUpdate = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await loadUserData();
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
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (authUser) {
        await loadUserData();
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

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/profile');

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Error loading user data:', body.error || res.statusText);
        setUser(null);
        return { data: null, error: body.error || true, status: res.status };
      }

      const { user: profile } = await res.json();
      setUser(profile);
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      return { data: null, error };
    }
  };

  const ensureSession = async () => {
    await supabase.auth.getSession();
  };

  const translateError = (errorMessage) => {
    if (!errorMessage) return 'Erro desconhecido';

    const errorLower = errorMessage.toLowerCase();

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
        const errorLower = error.message?.toLowerCase() || '';
        if (
          errorLower.includes('email not confirmed') ||
          errorLower.includes('email_not_confirmed')
        ) {
          try {
            const confirmRes = await fetch('/api/auth/confirm-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });

            if (confirmRes.ok) {
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              if (!retryError && retryData.user) {
                await ensureSession();
                const { error: profileError, status } = await loadUserData();
                if (profileError) {
                  return {
                    error:
                      typeof profileError === 'string'
                        ? profileError
                        : PROFILE_NOT_FOUND_ERROR,
                    status,
                  };
                }
                return { success: true, user: retryData.user };
              }
            }
          } catch (confirmError) {
            console.error('Error auto-confirming email:', confirmError);
          }
        }
        return { error: translateError(error.message) };
      }

      if (data.user) {
        await ensureSession();
        const { data: userData, error: profileError, status } = await loadUserData();
        if (profileError) {
          return {
            error:
              typeof profileError === 'string' ? profileError : PROFILE_NOT_FOUND_ERROR,
            status,
          };
        }
        return { success: true, user: userData };
      }

      return { error: 'Falha no login' };
    } catch (error) {
      return { error: translateError(error.message) || 'Falha no login' };
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        return { error: signupData.error || 'Falha no cadastro' };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { error: translateError(authError.message) };
      }

      if (authData.user) {
        await ensureSession();
        const { data: userData, error: profileError, status } = await loadUserData();
        if (profileError) {
          return {
            error:
              typeof profileError === 'string' ? profileError : PROFILE_NOT_FOUND_ERROR,
            status,
          };
        }
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
          updated_at: new Date().toISOString(),
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
