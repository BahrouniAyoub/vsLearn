import type { LessonProgress, UserProgressData, XpEvent } from "./types";
import { storageKey, defaultUserProgress, emptyLessonProgress, PROGRESS_PREFIX, XP_PREFIX, STREAK_PREFIX } from "./types";

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

export function getLessonProgress(userId: string, courseSlug: string, lessonSlug: string): LessonProgress {
  const key = storageKey(PROGRESS_PREFIX, userId, courseSlug, lessonSlug);
  return loadJSON(key, emptyLessonProgress(courseSlug, lessonSlug));
}

export function saveLessonProgress(userId: string, progress: LessonProgress) {
  const key = storageKey(PROGRESS_PREFIX, userId, progress.courseSlug, progress.lessonSlug);
  saveJSON(key, progress);
}

export function getAllCourseProgress(userId: string, courseSlug: string): LessonProgress[] {
  const prefix = storageKey(PROGRESS_PREFIX, userId, courseSlug);
  const results: LessonProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            results.push(JSON.parse(raw));
          } catch {}
        }
      }
    }
  } catch {}
  return results;
}

export function getUserProgress(userId: string): UserProgressData {
  const key = storageKey(PROGRESS_PREFIX, userId, "user");
  return loadJSON(key, defaultUserProgress());
}

export function saveUserProgress(userId: string, data: UserProgressData) {
  const key = storageKey(PROGRESS_PREFIX, userId, "user");
  saveJSON(key, data);
}

export function getXpEvents(userId: string): XpEvent[] {
  const key = storageKey(XP_PREFIX, userId);
  return loadJSON<XpEvent[]>(key, []);
}

export function saveXpEvents(userId: string, events: XpEvent[]) {
  const key = storageKey(XP_PREFIX, userId);
  saveJSON(key, events);
}

export function addXpEvent(userId: string, event: XpEvent) {
  const events = getXpEvents(userId);
  events.push(event);
  saveXpEvents(userId, events);
}

export function getActivityDates(userId: string): string[] {
  const key = storageKey(STREAK_PREFIX, userId);
  return loadJSON<string[]>(key, []);
}

export function saveActivityDates(userId: string, dates: string[]) {
  const key = storageKey(STREAK_PREFIX, userId);
  saveJSON(key, dates);
}
