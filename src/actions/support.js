'use server';

import { createClient } from '../lib/supabase/server';

export async function sendSupportMessage(data) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('support_message')
    .insert({
      name: data.name,
      email: data.email,
      message: data.message,
      user_id: data.userId || null,
      status: 'pending'
    });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
