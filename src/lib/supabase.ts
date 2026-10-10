import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const url = customUrl || import.meta.env.VITE_SUPABASE_URL;
  const key = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance || customUrl || customKey) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
};
