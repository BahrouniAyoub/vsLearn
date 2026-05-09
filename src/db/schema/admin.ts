import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./common";
import { auditActionEnum } from "./enums";
import { users } from "./users";

export const adminUsers = pgTable(
  "admin_users",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    grantedById: uuid("granted_by_id").references(() => users.id, { onDelete: "set null" }),
    permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    userIdx: uniqueIndex("admin_users_user_id_idx").on(table.userId),
    grantedByIdx: index("admin_users_granted_by_id_idx").on(table.grantedById),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    actorIdx: index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  }),
);

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, {
    fields: [adminUsers.userId],
    references: [users.id],
    relationName: "admin_user",
  }),
  grantedBy: one(users, {
    fields: [adminUsers.grantedById],
    references: [users.id],
    relationName: "admin_granter",
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorUserId], references: [users.id] }),
}));
