import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase';
import type { AdminSession } from '@/types/admin';

export async function getAdminSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await getAdminSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (!user) return null;

  // Buscar dados do admin
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!admin || !admin.is_active) return null;

  return {
    admin,
    token: session?.access_token || '',
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function updateAdminLastLogin(adminId: string): Promise<void> {
  const supabase = await getAdminSupabaseClient();
  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminId);
}

export async function hashPassword(password: string): Promise<string> {
  // Em produção, usar bcrypt ou argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
