import { z } from "zod";

export const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const courseStatusSchema = z.enum(["draft", "published", "archived"]);
export const lessonTypeSchema = z.enum(["text", "video", "quiz", "coding", "project"]);
export const challengeRunnerSchema = z.enum(["static", "node", "vitest", "playwright"]);

export const courseMetadataSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  level: courseLevelSchema,
  status: courseStatusSchema.default("draft"),
  icon: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  estimatedHours: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  modules: z.array(z.string().min(1)).default([]),
});

export const moduleMetadataSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  lessons: z.array(z.string().min(1)).default([]),
});

export const lessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  type: lessonTypeSchema.default("text"),
  durationMinutes: z.number().int().positive().default(5),
  summary: z.string().optional(),
});

export const challengeTestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  runner: challengeRunnerSchema,
  file: z.string().min(1),
  timeoutMs: z.number().int().positive().default(5000),
  isHidden: z.boolean().default(false),
});

export const challengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  entryFile: z.string().min(1),
  starterFiles: z.array(z.string()).default([]),
  solutionFiles: z.array(z.string()).default([]),
  tests: z.array(challengeTestSchema).default([]),
});

export const contentFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  language: z.string().min(1),
});
