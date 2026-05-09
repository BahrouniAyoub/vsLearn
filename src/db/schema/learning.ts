import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { primaryId, timestamps } from "./common";
import { courses, lessons, projects } from "./content";
import { certificateStatusEnum, progressStatusEnum, submissionStatusEnum } from "./enums";
import { users } from "./users";

export const submissions = pgTable(
  "submissions",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    status: submissionStatusEnum("status").default("queued").notNull(),
    submittedCode: jsonb("submitted_code").$type<Record<string, string>>().default({}).notNull(),
    testResults: jsonb("test_results").$type<Record<string, unknown>>().default({}).notNull(),
    score: integer("score").default(0).notNull(),
    durationMs: integer("duration_ms"),
    errorMessage: text("error_message"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("submissions_user_id_idx").on(table.userId),
    lessonIdx: index("submissions_lesson_id_idx").on(table.lessonId),
    projectIdx: index("submissions_project_id_idx").on(table.projectId),
    statusIdx: index("submissions_status_idx").on(table.status),
    userSubmittedIdx: index("submissions_user_submitted_idx").on(table.userId, table.submittedAt),
  }),
);

export const progress = pgTable(
  "progress",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").default("not_started").notNull(),
    percentComplete: integer("percent_complete").default(0).notNull(),
    bestScore: integer("best_score"),
    attempts: integer("attempts").default(0).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("progress_user_id_idx").on(table.userId),
    courseIdx: index("progress_course_id_idx").on(table.courseId),
    lessonIdx: index("progress_lesson_id_idx").on(table.lessonId),
    statusIdx: index("progress_status_idx").on(table.status),
    uniqueUserCourseLessonIdx: uniqueIndex("progress_user_course_lesson_idx").on(
      table.userId,
      table.courseId,
      table.lessonId,
    ),
  }),
);

export const certificates = pgTable(
  "certificates",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    certificateNumber: varchar("certificate_number", { length: 80 }).notNull(),
    verificationCode: varchar("verification_code", { length: 120 }).notNull(),
    status: certificateStatusEnum("status").default("issued").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedReason: text("revoked_reason"),
    pdfUrl: text("pdf_url"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("certificates_user_id_idx").on(table.userId),
    courseIdx: index("certificates_course_id_idx").on(table.courseId),
    numberIdx: uniqueIndex("certificates_number_idx").on(table.certificateNumber),
    verificationIdx: uniqueIndex("certificates_verification_code_idx").on(table.verificationCode),
    userCourseIdx: uniqueIndex("certificates_user_course_idx").on(table.userId, table.courseId),
  }),
);

export const badges = pgTable(
  "badges",
  {
    id: primaryId(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull(),
    icon: varchar("icon", { length: 24 }),
    criteria: jsonb("criteria").$type<Record<string, unknown>>().default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex("badges_slug_idx").on(table.slug),
    activeIdx: index("badges_is_active_idx").on(table.isActive),
  }),
);

export const userBadges = pgTable(
  "user_badges",
  {
    id: primaryId(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("user_badges_user_id_idx").on(table.userId),
    badgeIdx: index("user_badges_badge_id_idx").on(table.badgeId),
    userBadgeIdx: uniqueIndex("user_badges_user_badge_idx").on(table.userId, table.badgeId),
  }),
);

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [submissions.lessonId], references: [lessons.id] }),
  project: one(projects, { fields: [submissions.projectId], references: [projects.id] }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, { fields: [progress.userId], references: [users.id] }),
  course: one(courses, { fields: [progress.courseId], references: [courses.id] }),
  lesson: one(lessons, { fields: [progress.lessonId], references: [lessons.id] }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, { fields: [certificates.userId], references: [users.id] }),
  course: one(courses, { fields: [certificates.courseId], references: [courses.id] }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));
