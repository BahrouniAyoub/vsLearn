import type { WorkspaceData, CompletionEntry } from "./types";
import { emptyWorkspace, nowISO } from "./types";

const WORKSPACE_PREFIX = "vslearn_ws_";
const COMPLETION_PREFIX = "vslearn_complete_";
const LAST_LESSON_PREFIX = "vslearn_last_";

function storageKey(userId: string, ...parts: string[]): string {
  return [WORKSPACE_PREFIX, userId, ...parts].join(":");
}

export function loadLocalWorkspace(userId: string, courseSlug: string, lessonSlug: string): WorkspaceData | null {
  try {
    const raw = localStorage.getItem(storageKey(userId, courseSlug, lessonSlug));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalWorkspace(userId: string, courseSlug: string, lessonSlug: string, data: WorkspaceData): void {
  try {
    localStorage.setItem(storageKey(userId, courseSlug, lessonSlug), JSON.stringify({ ...data, updatedAt: nowISO() }));
  } catch {
    // storage full or unavailable
  }
}

export function removeLocalWorkspace(userId: string, courseSlug: string, lessonSlug: string): void {
  try {
    localStorage.removeItem(storageKey(userId, courseSlug, lessonSlug));
  } catch {
    // ignore
  }
}

export function loadLocalCompletion(userId: string): CompletionEntry[] {
  try {
    const raw = localStorage.getItem(`${COMPLETION_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCompletion(userId: string, entries: CompletionEntry[]): void {
  try {
    localStorage.setItem(`${COMPLETION_PREFIX}${userId}`, JSON.stringify(entries));
  } catch {
    // storage full or unavailable
  }
}

export function loadLocalLastLesson(userId: string, courseSlug: string): string | null {
  try {
    return localStorage.getItem(`${LAST_LESSON_PREFIX}${userId}:${courseSlug}`);
  } catch {
    return null;
  }
}

export function saveLocalLastLesson(userId: string, courseSlug: string, lessonSlug: string): void {
  try {
    localStorage.setItem(`${LAST_LESSON_PREFIX}${userId}:${courseSlug}`, lessonSlug);
  } catch {
    // ignore
  }
}

export function mergeWorkspaceData(
  existing: WorkspaceData | null,
  fresh: WorkspaceData | null,
): WorkspaceData {
  if (!fresh && !existing) return emptyWorkspace();
  if (!fresh) return existing!;
  if (!existing) return fresh;

  const existingTime = new Date(existing.updatedAt).getTime();
  const freshTime = new Date(fresh.updatedAt).getTime();

  if (freshTime >= existingTime) {
    return { ...fresh, files: { ...existing.files, ...fresh.files } };
  }
  return { ...existing, files: { ...fresh.files, ...existing.files } };
}
