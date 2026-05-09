import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { parseDatabaseEnv } from "./env";
import * as schema from "./schema";

let client: postgres.Sql | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDatabaseUrl() {
  const env = parseDatabaseEnv({ DATABASE_URL: process.env.DATABASE_URL });
  return env.DATABASE_URL;
}

export function getDb() {
  if (!client) {
    client = postgres(getDatabaseUrl(), { prepare: false });
  }

  if (!db) {
    db = drizzle(client, { schema });
  }

  return db;
}
