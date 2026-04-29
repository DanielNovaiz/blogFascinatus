import 'server-only';

import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  try {
    const cookieStore = await cookies();

    return _createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Pode falhar em alguns ciclos de renderização, o caller mantém fallback.
            }
          },
        },
      }
    );
  } catch (error) {
    throw new Error(
      `Falha ao inicializar cliente Supabase no servidor: ${
        error instanceof Error ? error.message : 'erro desconhecido'
      }`
    );
  }
}
