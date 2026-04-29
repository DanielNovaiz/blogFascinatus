import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from './supabase';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url) throw new Error('ERRO: NEXT_PUBLIC_SUPABASE_URL está ausente!');

// Use service role key if available, otherwise use regular client
export const supabaseAdmin = serviceKey
  ? createClient(url, serviceKey, {
      auth: {
        persistSession: false,
      },
    })
  : supabaseClient;