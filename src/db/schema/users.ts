import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./common";
import { profileVisibilityEnum, userRoleEnum } from "./enums";

export const users = pgTable(
  "users",
  {
    id: primaryId(),
    email: varchar("email", { length: 320 }).notNull(),
    role: userRoleEnum("role").default("student").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export const profiles = pgTable(
  "profiles",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    username: varchar("username", { length: 80 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    websiteUrl: text("website_url"),
    location: varchar("location", { length: 160 }),
    visibility: profileVisibilityEnum("visibility").default("public").notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: uniqueIndex("profiles_user_id_idx").on(table.userId),
    usernameIdx: uniqueIndex("profiles_username_idx").on(table.username),
    visibilityIdx: index("profiles_visibility_idx").on(table.visibility),
  }),
);

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));
