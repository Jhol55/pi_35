'use server';

import { createAdminClient } from '../lib/supabase/admin';

// Confirm user email automatically after signup
export async function confirmUserEmail(userId) {
  try {
    const adminClient = createAdminClient();
    
    // Update user to confirm email
    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true
      }
    );

    if (error) {
      console.error('Error confirming email:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in confirmUserEmail:', error);
    return { error: error.message || 'Erro ao confirmar email' };
  }
}

