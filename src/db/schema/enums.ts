import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["student", "instructor", "admin"]);
export const profileVisibilityEnum = pgEnum("profile_visibility", ["public", "private"]);
export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["text", "video", "quiz", "coding", "project"]);
export const fileLanguageEnum = pgEnum("file_language", [
  "html",
  "css",
  "javascript",
  "typescript",
  "tsx",
  "json",
  "markdown",
  "sql",
]);
export const testRunnerEnum = pgEnum("test_runner", ["none", "node", "vitest", "playwright"]);
export const submissionStatusEnum = pgEnum("submission_status", [
  "queued",
  "running",
  "passed",
  "failed",
  "error",
]);
export const progressStatusEnum = pgEnum("progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);
export const certificateStatusEnum = pgEnum("certificate_status", ["issued", "revoked"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "system",
  "course",
  "comment",
  "certificate",
  "admin",
]);
export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "archive",
  "login",
  "role_change",
]);
