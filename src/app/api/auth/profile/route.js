import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createAdminClient } from '../../../../lib/supabase/admin';

const PROFILE_MISMATCH_WITH_PROGRESS =
  'Conta com dados inconsistentes. Remova o usuário em Authentication e na tabela user, depois cadastre-se novamente.';

async function countRelatedRows(adminClient, userId) {
  const tables = ['user_activity_progress', 'user_module_progress', 'user_badge'];

  for (const table of tables) {
    const { count, error } = await adminClient
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    if (count > 0) {
      return count;
    }
  }

  return 0;
}

async function relinkProfileByEmail(adminClient, authUser, profileByEmail) {
  const relatedCount = await countRelatedRows(adminClient, profileByEmail.id);

  if (relatedCount > 0) {
    return { error: PROFILE_MISMATCH_WITH_PROGRESS };
  }

  const { error: deleteError } = await adminClient
    .from('user')
    .delete()
    .eq('id', profileByEmail.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  const { data: newProfile, error: insertError } = await adminClient
    .from('user')
    .insert({
      id: authUser.id,
      name: profileByEmail.name,
      email: profileByEmail.email,
      user_type: profileByEmail.user_type || 'learner',
      active: profileByEmail.active ?? true,
      points: profileByEmail.points ?? 0,
      level: profileByEmail.level ?? 1,
      badges: profileByEmail.badges ?? [],
      interests: profileByEmail.interests ?? [],
      learning_style: profileByEmail.learning_style ?? null,
      person_id: profileByEmail.person_id ?? null,
    })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  return { user: newProfile };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    const { data: profileById, error: profileByIdError } = await adminClient
      .from('user')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileByIdError) {
      return NextResponse.json({ error: profileByIdError.message }, { status: 500 });
    }

    if (profileById) {
      return NextResponse.json({ user: profileById });
    }

    if (!authUser.email) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const { data: profileByEmail, error: profileByEmailError } = await adminClient
      .from('user')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();

    if (profileByEmailError) {
      return NextResponse.json({ error: profileByEmailError.message }, { status: 500 });
    }

    if (!profileByEmail) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (profileByEmail.id !== authUser.id) {
      const relinkResult = await relinkProfileByEmail(adminClient, authUser, profileByEmail);

      if (relinkResult.error) {
        return NextResponse.json({ error: relinkResult.error }, { status: 409 });
      }

      return NextResponse.json({ user: relinkResult.user });
    }

    return NextResponse.json({ user: profileByEmail });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar perfil' },
      { status: 500 }
    );
  }
}
