import { useCallback, useState } from "react";
import { useAuth } from "./auth";

function storageKey(userId: string) {
  return `vslearn_progress_${userId}`;
}

function loadProgress(userId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProgress(userId: string, completed: string[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(completed));
}

export function useCourseProgress(courseSlug: string, totalLessons: number) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [version, setVersion] = useState(0);

  const toggleComplete = useCallback(
    (lessonKey: string) => {
      const fullKey = `${courseSlug}:${lessonKey}`;
      const all = loadProgress(userId);
      const idx = all.indexOf(fullKey);
      if (idx === -1) {
        all.push(fullKey);
      } else {
        all.splice(idx, 1);
      }
      saveProgress(userId, all);
      setVersion((v) => v + 1);
    },
    [userId, courseSlug],
  );

  const isComplete = useCallback(
    (lessonKey: string) => {
      const all = loadProgress(userId);
      return all.includes(`${courseSlug}:${lessonKey}`);
    },
    [userId, courseSlug, version],
  );

  const completedCount = (() => {
    const all = loadProgress(userId);
    return all.filter((k) => k.startsWith(`${courseSlug}:`)).length;
  })();

  const progressPercent = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return {
    toggleComplete,
    isComplete,
    completedCount,
    progressPercent,
  };
}
