import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

function translateSignupError(message) {
  if (!message) return 'Falha no cadastro';
  const lower = message.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Este email já está cadastrado';
  }
  if (lower.includes('password')) {
    return 'Erro na senha. Verifique se ela tem pelo menos 6 caracteres';
  }
  if (lower.includes('email')) {
    return 'Email inválido';
  }
  return message;
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    });

    if (authError) {
      return NextResponse.json(
        { error: translateSignupError(authError.message) },
        { status: 400 }
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      );
    }

    const { error: profileError } = await adminClient.from('user').insert({
      id: userId,
      name: name.trim(),
      email: email.trim(),
      user_type: 'learner',
      points: 0,
      level: 1,
      badges: [],
      interests: [],
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: translateSignupError(profileError.message) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
