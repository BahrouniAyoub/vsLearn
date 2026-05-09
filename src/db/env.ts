import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export function parseDatabaseEnv(env: unknown): DatabaseEnv {
  return databaseEnvSchema.parse(env);
}
