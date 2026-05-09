import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { loadLocalCompletion, saveLocalCompletion } from "./local";
import {
  loadCompletionFromSupabase,
  syncCompletionToSupabase,
} from "./client";
import type { CompletionEntry } from "./types";
import { nowISO } from "./types";

type CompletionState = {
  completedLessons: Set<string>;
  completedCount: number;
  progressPercent: number;
  isComplete: (lessonSlug: string) => boolean;
  toggleComplete: (lessonSlug: string) => void;
};

export function useCompletion(
  courseSlug: string,
  totalLessons: number,
  enabled: boolean,
): CompletionState {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [entries, setEntries] = useState<CompletionEntry[]>(() => {
    return loadLocalCompletion(userId);
  });
  const [synced, setSynced] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !userId || userId === "guest") return;
    if (synced) return;

    loadCompletionFromSupabase(userId, courseSlug).then((remote) => {
      if (remote && remote.length > 0) {
        const localSet = new Set(
          entries
            .filter((e) => e.courseSlug === courseSlug)
            .map((e) => e.lessonSlug),
        );
        const merged = new Set([...localSet, ...remote]);
        const mergedEntries: CompletionEntry[] = [
          ...entries.filter((e) => e.courseSlug !== courseSlug),
          ...Array.from(merged).map((slug) => ({
            courseSlug,
            lessonSlug: slug,
            completedAt: nowISO(),
          })),
        ];
        setEntries(mergedEntries);
        saveLocalCompletion(userId, mergedEntries);
      } else if (entries.length > 0) {
        syncCompletionToSupabase(userId, courseSlug, entries);
      }
      setSynced(true);
    });
  }, [enabled, userId, courseSlug]);

  const completedLessons = new Set(
    entries
      .filter((e) => e.courseSlug === courseSlug)
      .map((e) => e.lessonSlug),
  );

  const syncToServer = useCallback(
    (updated: CompletionEntry[]) => {
      if (!userId || userId === "guest") return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        syncCompletionToSupabase(userId, courseSlug, updated);
      }, 1000);
    },
    [userId, courseSlug],
  );

  const toggleComplete = useCallback(
    (lessonSlug: string) => {
      setEntries((prev) => {
        const existing = prev.findIndex(
          (e) => e.courseSlug === courseSlug && e.lessonSlug === lessonSlug,
        );
        let next: CompletionEntry[];
        if (existing >= 0) {
          next = prev.filter((_, i) => i !== existing);
        } else {
          next = [
            ...prev,
            { courseSlug, lessonSlug, completedAt: nowISO() },
          ];
        }
        saveLocalCompletion(userId, next);
        syncToServer(next);
        return next;
      });
    },
    [userId, courseSlug, syncToServer],
  );

  const isComplete = useCallback(
    (lessonSlug: string) => completedLessons.has(lessonSlug),
    [completedLessons],
  );

  const completedCount = completedLessons.size;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    completedLessons,
    completedCount,
    progressPercent,
    isComplete,
    toggleComplete,
  };
}
