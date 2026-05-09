export type ProjectStatus = "draft" | "submitted" | "passed" | "needs_changes";

export type ProjectSubmission = {
  id: string;
  userId: string;
  username: string;
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
  files: { path: string; content: string; language: string }[];
  repoUrl: string | null;
  demoUrl: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  testResults: TestRunResult | null;
  reviewerNotes: string | null;
};

export type TestRunResult = {
  passed: number;
  failed: number;
  total: number;
  details: { name: string; passed: boolean; message?: string }[];
};

export type ProjectSummary = Pick<
  ProjectSubmission,
  "id" | "slug" | "title" | "description" | "status" | "courseTitle" | "lessonTitle" | "createdAt" | "submittedAt" | "thumbnailUrl" | "username"
> & { ownerName: string };

export const PROJECT_PREFIX = "vslearn_project_v2";

export function storageKey(prefix: string, userId: string, ...parts: string[]): string {
  return [prefix, userId, ...parts].join("_");
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
