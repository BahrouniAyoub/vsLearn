import type { ProjectSubmission, ProjectStatus, TestRunResult } from "./types";
import { generateSlug, nowISO } from "./types";
import {
  getProjects,
  getProject,
  getProjectBySlug,
  getProjectByLesson,
  saveProject,
  getPublishedProjects,
} from "./local";
import { syncProjectToSupabase, loadProjectsFromSupabase } from "./client";
import { runChallengeTests } from "@/lib/challenges";
import type { ChallengeTestConfig } from "@/lib/challenges";
import { getCourseContent } from "@/lib/content";

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createProject(
  userId: string,
  username: string,
  courseSlug: string,
  courseTitle: string,
  lessonSlug: string,
  lessonTitle: string,
): ProjectSubmission {
  const now = nowISO();
  const id = generateId();
  const slug = `${generateSlug(lessonTitle)}-${id.slice(0, 6)}`;

  return {
    id,
    userId,
    username,
    courseSlug,
    courseTitle,
    lessonSlug,
    lessonTitle,
    slug,
    title: lessonTitle,
    description: "",
    status: "draft",
    files: [],
    repoUrl: null,
    demoUrl: null,
    thumbnailUrl: null,
    isPublished: false,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    testResults: null,
    reviewerNotes: null,
  };
}

export function saveDraft(
  userId: string,
  project: ProjectSubmission,
  updates: Partial<ProjectSubmission>,
): ProjectSubmission {
  const updated = { ...project, ...updates, status: "draft" as ProjectStatus, updatedAt: nowISO() };
  saveProject(userId, updated);
  if (userId !== "guest") syncProjectToSupabase(userId, updated);
  return updated;
}

export function submitProject(
  userId: string,
  project: ProjectSubmission,
  config?: ChallengeTestConfig | null,
): { project: ProjectSubmission; testResults: TestRunResult | null } {
  const now = nowISO();
  let testResults: TestRunResult | null = null;

  if (config) {
    const suite = runChallengeTests({ files: project.files, config });
    const details = suite.groups.flatMap((g) =>
      g.results.map((r) => ({ name: r.name, passed: r.status === "pass", message: r.message }))
    );
    testResults = {
      passed: suite.summary.passed,
      failed: suite.summary.failed + suite.summary.errors,
      total: suite.summary.total,
      details,
    };
  }

  const newStatus: ProjectStatus =
    testResults && testResults.failed === 0 && testResults.total > 0
      ? "passed"
      : "submitted";

  const updated: ProjectSubmission = {
    ...project,
    status: newStatus,
    testResults,
    submittedAt: now,
    updatedAt: now,
  };

  saveProject(userId, updated);
  if (userId !== "guest") syncProjectToSupabase(userId, updated);
  return { project: updated, testResults };
}

export function publishProject(userId: string, project: ProjectSubmission): ProjectSubmission {
  const updated = { ...project, isPublished: true, updatedAt: nowISO() };
  saveProject(userId, updated);
  if (userId !== "guest") syncProjectToSupabase(userId, updated);
  return updated;
}

export function unpublishProject(userId: string, project: ProjectSubmission): ProjectSubmission {
  const updated = { ...project, isPublished: false, updatedAt: nowISO() };
  saveProject(userId, updated);
  if (userId !== "guest") syncProjectToSupabase(userId, updated);
  return updated;
}

export function updateProjectStatus(
  userId: string,
  project: ProjectSubmission,
  status: ProjectStatus,
  reviewerNotes?: string,
): ProjectSubmission {
  const updated = { ...project, status, reviewerNotes: reviewerNotes ?? null, updatedAt: nowISO() };
  saveProject(userId, updated);
  if (userId !== "guest") syncProjectToSupabase(userId, updated);
  return updated;
}

export function getUserProjects(userId: string): ProjectSubmission[] {
  return getProjects(userId);
}

export function getLessonProject(userId: string, courseSlug: string, lessonSlug: string): ProjectSubmission | null {
  return getProjectByLesson(userId, courseSlug, lessonSlug);
}

export function getProjectByUserSlug(userId: string, slug: string): ProjectSubmission | null {
  return getProjectBySlug(userId, slug);
}

export function getProjectById(userId: string, projectId: string): ProjectSubmission | null {
  return getProject(userId, projectId);
}

export function getAllPublished(): ProjectSubmission[] {
  return getPublishedProjects();
}

export function findPublishedBySlug(slug: string): ProjectSubmission | null {
  const local = getPublishedProjects();
  return local.find((p) => p.slug === slug) ?? null;
}

export function getCourseProjectLessons(courseSlug: string): { slug: string; title: string }[] {
  const content = getCourseContent(courseSlug);
  if (!content) return [];
  return content.modules
    .flatMap((m) => m.lessons)
    .filter((l) => l.frontmatter.type === "project")
    .map((l) => ({ slug: l.slug, title: l.frontmatter.title }));
}
