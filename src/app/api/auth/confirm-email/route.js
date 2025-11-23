import { confirmUserEmail } from '../../../../actions/auth-confirm';
import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

export async function POST(request) {
  try {
    const { userId, email } = await request.json();

    // If email provided, find user by email first
    let targetUserId = userId;
    
    if (!targetUserId && email) {
      const adminClient = createAdminClient();
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
      
      if (!listError && users?.users) {
        const user = users.users.find(u => u.email === email);
        if (user) {
          targetUserId = user.id;
        }
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    const result = await confirmUserEmail(targetUserId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Erro ao confirmar email' },
      { status: 500 }
    );
  }
}

