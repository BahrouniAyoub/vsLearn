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
import {
  courseLevelEnum,
  courseStatusEnum,
  fileLanguageEnum,
  lessonTypeEnum,
  testRunnerEnum,
} from "./enums";
import { users } from "./users";

export const courses = pgTable(
  "courses",
  {
    id: primaryId(),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 120 }).notNull(),
    level: courseLevelEnum("level").notNull(),
    status: courseStatusEnum("status").default("draft").notNull(),
    icon: varchar("icon", { length: 24 }),
    color: varchar("color", { length: 24 }),
    estimatedHours: integer("estimated_hours").default(0).notNull(),
    priceCents: integer("price_cents").default(0).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex("courses_slug_idx").on(table.slug),
    statusIdx: index("courses_status_idx").on(table.status),
    categoryIdx: index("courses_category_idx").on(table.category),
    authorIdx: index("courses_author_id_idx").on(table.authorId),
  }),
);

export const modules = pgTable(
  "modules",
  {
    id: primaryId(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    courseIdx: index("modules_course_id_idx").on(table.courseId),
    courseSortIdx: index("modules_course_sort_idx").on(table.courseId, table.sortOrder),
    courseSlugIdx: uniqueIndex("modules_course_slug_idx").on(table.courseId, table.slug),
  }),
);

export const lessons = pgTable(
  "lessons",
  {
    id: primaryId(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    type: lessonTypeEnum("type").notNull(),
    content: text("content").notNull(),
    durationMinutes: integer("duration_minutes").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => ({
    moduleIdx: index("lessons_module_id_idx").on(table.moduleId),
    moduleSortIdx: index("lessons_module_sort_idx").on(table.moduleId, table.sortOrder),
    moduleSlugIdx: uniqueIndex("lessons_module_slug_idx").on(table.moduleId, table.slug),
    typeIdx: index("lessons_type_idx").on(table.type),
  }),
);

export const lessonFiles = pgTable(
  "lesson_files",
  {
    id: primaryId(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    path: varchar("path", { length: 400 }).notNull(),
    language: fileLanguageEnum("language").notNull(),
    starterCode: text("starter_code").default("").notNull(),
    solutionCode: text("solution_code"),
    isEntry: boolean("is_entry").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps,
  },
  (table) => ({
    lessonIdx: index("lesson_files_lesson_id_idx").on(table.lessonId),
    lessonPathIdx: uniqueIndex("lesson_files_lesson_path_idx").on(table.lessonId, table.path),
  }),
);

export const lessonTests = pgTable(
  "lesson_tests",
  {
    id: primaryId(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 240 }).notNull(),
    runner: testRunnerEnum("runner").default("node").notNull(),
    testCode: text("test_code").notNull(),
    expectedOutput: text("expected_output"),
    timeoutMs: integer("timeout_ms").default(5000).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isHidden: boolean("is_hidden").default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    lessonIdx: index("lesson_tests_lesson_id_idx").on(table.lessonId),
    lessonSortIdx: index("lesson_tests_lesson_sort_idx").on(table.lessonId, table.sortOrder),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: primaryId(),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    description: text("description").notNull(),
    brief: text("brief").notNull(),
    rubric: jsonb("rubric").$type<Record<string, unknown>>().default({}).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    ...timestamps,
  },
  (table) => ({
    courseIdx: index("projects_course_id_idx").on(table.courseId),
    lessonIdx: index("projects_lesson_id_idx").on(table.lessonId),
    slugIdx: uniqueIndex("projects_slug_idx").on(table.slug),
  }),
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  author: one(users, { fields: [courses.authorId], references: [users.id] }),
  modules: many(modules),
  projects: many(projects),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
  files: many(lessonFiles),
  tests: many(lessonTests),
  projects: many(projects),
}));

export const lessonFilesRelations = relations(lessonFiles, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonFiles.lessonId], references: [lessons.id] }),
}));

export const lessonTestsRelations = relations(lessonTests, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonTests.lessonId], references: [lessons.id] }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  course: one(courses, { fields: [projects.courseId], references: [courses.id] }),
  lesson: one(lessons, { fields: [projects.lessonId], references: [lessons.id] }),
}));
