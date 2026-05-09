import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { parsePublicSupabaseEnv } from "./env";

let browserClient: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const env = parsePublicSupabaseEnv(import.meta.env);
  browserClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}
