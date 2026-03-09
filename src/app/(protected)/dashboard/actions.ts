'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function checkSubscriptionStatus(): Promise<{ status: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: null };
  }

  const { data } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single<{ subscription_status: string | null }>();

  return { status: data?.subscription_status ?? null };
}

export async function deleteDebates(ids: string[]): Promise<{ error?: string }> {
  if (!ids.length) return {};

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Delete only debates owned by this user
  const { error } = await supabase
    .from('debates')
    .delete()
    .eq('user_id', user.id)
    .in('id', ids);

  if (error) {
    return { error: 'Failed to delete debates' };
  }

  revalidatePath('/dashboard');
  return {};
}
