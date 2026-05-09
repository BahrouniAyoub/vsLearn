import { timestamp, uuid } from "drizzle-orm/pg-core";

export function primaryId() {
  return uuid("id").defaultRandom().primaryKey();
}

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};
