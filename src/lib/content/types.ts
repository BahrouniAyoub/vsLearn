import type { z } from "zod";

import type {
  challengeSchema,
  challengeTestSchema,
  challengeValidationSchema,
  contentFileSchema,
  courseMetadataSchema,
  lessonFrontmatterSchema,
  moduleMetadataSchema,
} from "./schemas";

export type CourseMetadata = z.infer<typeof courseMetadataSchema>;
export type ModuleMetadata = z.infer<typeof moduleMetadataSchema>;
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type ChallengeTest = z.infer<typeof challengeTestSchema>;
export type ChallengeValidation = z.infer<typeof challengeValidationSchema>;
export type ContentFile = z.infer<typeof contentFileSchema>;

export type ParsedMdxLesson = {
  frontmatter: LessonFrontmatter;
  body: string;
  raw: string;
};

export type CourseModule = Omit<ModuleMetadata, "lessons"> & {
  courseSlug: string;
  lessons: CourseLesson[];
};

export type CourseLesson = ParsedMdxLesson & {
  courseSlug: string;
  moduleSlug: string;
  slug: string;
  challenge: Challenge | null;
  starterFiles: ContentFile[];
  solutionFiles: ContentFile[];
  testFiles: ContentFile[];
};

export type CourseContent = Omit<CourseMetadata, "modules"> & {
  modules: CourseModule[];
};
