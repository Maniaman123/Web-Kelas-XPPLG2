import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl            = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    '❌ SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di file .env'
  );
}

/**
 * Supabase Admin Client (Service Role)
 * ─────────────────────────────────────
 * Digunakan di sisi server untuk operasi CRUD.
 * Service Role Key mem-bypass Row Level Security (RLS).
 * ⚠️  JANGAN expose key ini ke frontend!
 */
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
});

export default supabase;
