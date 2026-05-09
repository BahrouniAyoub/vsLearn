import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
});

const serverSupabaseEnvSchema = publicSupabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const serviceRoleSupabaseEnvSchema = publicSupabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

export type PublicSupabaseEnv = z.infer<typeof publicSupabaseEnvSchema>;
export type ServerSupabaseEnv = z.infer<typeof serverSupabaseEnvSchema>;

function formatEnvError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
}

export function parsePublicSupabaseEnv(env: unknown): PublicSupabaseEnv {
  const parsed = publicSupabaseEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid Supabase public environment: ${formatEnvError(parsed.error)}`);
  }
  return parsed.data;
}

export function parseServerSupabaseEnv(env: unknown): ServerSupabaseEnv {
  const parsed = serverSupabaseEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid Supabase server environment: ${formatEnvError(parsed.error)}`);
  }
  return parsed.data;
}

export function parseServiceRoleSupabaseEnv(env: unknown): Required<ServerSupabaseEnv> {
  const parsed = serviceRoleSupabaseEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid Supabase service role environment: ${formatEnvError(parsed.error)}`);
  }
  return parsed.data;
}
