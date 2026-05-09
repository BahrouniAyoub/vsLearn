import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./common";
import { courses, lessons } from "./content";
import { notificationTypeEnum } from "./enums";
import { users } from "./users";

export const comments = pgTable(
  "comments",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isResolved: boolean("is_resolved").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("comments_user_id_idx").on(table.userId),
    courseIdx: index("comments_course_id_idx").on(table.courseId),
    lessonIdx: index("comments_lesson_id_idx").on(table.lessonId),
    parentIdx: index("comments_parent_id_idx").on(table.parentId),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").default("system").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("notifications_user_id_idx").on(table.userId),
    readIdx: index("notifications_read_at_idx").on(table.readAt),
    userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  course: one(courses, { fields: [comments.courseId], references: [courses.id] }),
  lesson: one(lessons, { fields: [comments.lessonId], references: [lessons.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_thread",
  }),
  replies: many(comments, { relationName: "comment_thread" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
