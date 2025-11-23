'use server';

import { createClient } from '../lib/supabase/server';

export async function getUserBadges(userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_badge')
    .select('*, badge(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    return { error: error.message, badges: [] };
  }

  return { success: true, badges: data || [] };
}

