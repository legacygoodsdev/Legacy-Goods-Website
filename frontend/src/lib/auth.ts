import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  admin_identifier: string | null;
  display_name: string | null;
  created_at: string;
}

export async function getCurrentUserProfile(user?: User | null): Promise<Profile | null> {
  const currentUser = user ?? (await supabase.auth.getUser()).data.user;
  if (!currentUser) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, admin_identifier, display_name, created_at')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export function isAdminProfile(profile: Profile | null | undefined): boolean {
  return profile?.role === 'admin';
}

export async function getActiveRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile();
  return profile?.role ?? null;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  if (!profile || !isAdminProfile(profile)) {
    throw new Error('Admin access required');
  }
  return profile;
}
