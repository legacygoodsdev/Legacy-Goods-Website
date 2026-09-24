import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://puicnjvmndrfzvjzgbdb.supabase.co';
const supabaseAnonKey = 'sb_publishable_jAV1lvkehtWyoSIN9OlNmg_ueKWPsd3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
