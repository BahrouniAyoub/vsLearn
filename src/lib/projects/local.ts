import type { ProjectSubmission } from "./types";
import { PROJECT_PREFIX, storageKey } from "./types";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function allKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
  } catch {}
  return keys;
}

export function getProjects(userId: string): ProjectSubmission[] {
  const prefix = storageKey(PROJECT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<ProjectSubmission | null>(k, null))
    .filter((p): p is ProjectSubmission => p !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProject(userId: string, projectId: string): ProjectSubmission | null {
  const key = storageKey(PROJECT_PREFIX, userId, projectId);
  return loadJSON<ProjectSubmission | null>(key, null);
}

export function getProjectBySlug(userId: string, slug: string): ProjectSubmission | null {
  const prefix = storageKey(PROJECT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<ProjectSubmission | null>(k, null))
    .filter((p): p is ProjectSubmission => p !== null)
    .find((p) => p.slug === slug) ?? null;
}

export function getProjectByLesson(userId: string, courseSlug: string, lessonSlug: string): ProjectSubmission | null {
  const prefix = storageKey(PROJECT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<ProjectSubmission | null>(k, null))
    .filter((p): p is ProjectSubmission => p !== null)
    .find((p) => p.courseSlug === courseSlug && p.lessonSlug === lessonSlug) ?? null;
}

export function saveProject(userId: string, project: ProjectSubmission) {
  const key = storageKey(PROJECT_PREFIX, userId, project.id);
  saveJSON(key, project);
}

export function getPublishedProjects(): ProjectSubmission[] {
  return allKeys()
    .filter((k) => k.startsWith(PROJECT_PREFIX))
    .flatMap((k) => {
      const p = loadJSON<ProjectSubmission | null>(k, null);
      return p && p.isPublished && p.status === "passed" ? [p] : [];
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUserProjects(userId: string): ProjectSubmission[] {
  return getProjects(userId);
}
