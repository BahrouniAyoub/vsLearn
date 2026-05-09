import { createClient } from "@supabase/supabase-js";

import { parseServerSupabaseEnv, parseServiceRoleSupabaseEnv, type ServerSupabaseEnv } from "./env";
import { getSupabaseAuthHeaders } from "./helpers";

type SupabaseServerClientOptions = {
  env?: ServerSupabaseEnv;
  request?: Request;
};

type SupabaseServiceRoleClientOptions = {
  env?: ServerSupabaseEnv;
};

function readProcessEnv(): Partial<ServerSupabaseEnv> {
  if (typeof process === "undefined") return {};

  return {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function getDefaultServerEnv() {
  return {
    ...readProcessEnv(),
    ...import.meta.env,
  };
}

export function getSupabaseServerClient(options: SupabaseServerClientOptions = {}) {
  const env = parseServerSupabaseEnv(options.env ?? getDefaultServerEnv());

  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: getSupabaseAuthHeaders(options.request),
    },
  });
}

export function getSupabaseServiceRoleClient(options: SupabaseServiceRoleClientOptions = {}) {
  const env = parseServiceRoleSupabaseEnv(options.env ?? getDefaultServerEnv());

  return createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
