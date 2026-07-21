import { createClient } from '@supabase/supabase-js';

// Get credentials from environment or localStorage
export function getSupabaseCredentials() {
  const urlEnv = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const keyEnv = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  const urlLocal = localStorage.getItem('cleanpay_supabase_url') || '';
  const keyLocal = localStorage.getItem('cleanpay_supabase_anon_key') || '';
  
  return {
    url: urlEnv || urlLocal || '',
    key: keyEnv || keyLocal || '',
    isConfigured: !!(urlEnv && keyEnv) || !!(urlLocal && keyLocal),
    isFromEnv: !!(urlEnv && keyEnv)
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (!url || !key) {
    localStorage.removeItem('cleanpay_supabase_url');
    localStorage.removeItem('cleanpay_supabase_anon_key');
  } else {
    localStorage.setItem('cleanpay_supabase_url', url.trim());
    localStorage.setItem('cleanpay_supabase_anon_key', key.trim());
  }
}

// Lazy initializer for Supabase client
let supabaseClientInstance: any = null;

export function getSupabaseClient() {
  const { url, key, isConfigured } = getSupabaseCredentials();
  
  if (!isConfigured) {
    return null;
  }
  
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  
  return supabaseClientInstance;
}

// Reset instance when credentials change
export function resetSupabaseClient() {
  supabaseClientInstance = null;
}
