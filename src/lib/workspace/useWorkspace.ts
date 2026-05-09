import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { loadLocalWorkspace, saveLocalWorkspace, mergeWorkspaceData } from "./local";
import { saveWorkspaceToSupabase, loadWorkspaceFromSupabase } from "./client";
import type { WorkspaceData } from "./types";
import { emptyWorkspace, nowISO } from "./types";

export type UseWorkspaceResult = {
  files: Record<string, string>;
  activeFile: string | null;
  openTabs: string[];
  completed: boolean;
  hasLoaded: boolean;
  hasSaved: boolean;
  setFile: (path: string, content: string) => void;
  setActiveFile: (path: string | null) => void;
  setOpenTabs: (tabs: string[]) => void;
  resetFiles: (initialFiles: Record<string, string>) => void;
  markCompleted: () => void;
};

export function useWorkspace(
  courseSlug: string,
  lessonSlug: string,
  enabled: boolean,
): UseWorkspaceResult {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const syncId = `${courseSlug}:${lessonSlug}`;

  const [workspace, setWorkspace] = useState<WorkspaceData>(emptyWorkspace);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(workspace);
  dataRef.current = workspace;

  useEffect(() => {
    if (!enabled) {
      setWorkspace(emptyWorkspace());
      setHasLoaded(true);
      return;
    }

    let cancelled = false;

    async function load() {
      let data: WorkspaceData | null = null;

      if (userId && userId !== "guest") {
        data = await loadWorkspaceFromSupabase(userId, courseSlug, lessonSlug);
      }

      const local = loadLocalWorkspace(userId, courseSlug, lessonSlug);
      data = mergeWorkspaceData(local, data);

      if (!cancelled) {
        setWorkspace(data ?? emptyWorkspace());
        setHasLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [enabled, userId, courseSlug, lessonSlug]);

  const persist = useCallback(
    (data: WorkspaceData, immediate?: boolean) => {
      saveLocalWorkspace(userId, courseSlug, lessonSlug, data);

      if (userId && userId !== "guest" && !hasSaved) {
        setHasSaved(true);
      }

      if (userId && userId !== "guest") {
        if (timerRef.current) clearTimeout(timerRef.current);
        const fn = () => {
          saveWorkspaceToSupabase(userId, courseSlug, lessonSlug, dataRef.current);
        };
        if (immediate) {
          fn();
        } else {
          timerRef.current = setTimeout(fn, 1500);
        }
      }
    },
    [userId, courseSlug, lessonSlug, hasSaved],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [syncId]);

  const setFile = useCallback(
    (path: string, content: string) => {
      setWorkspace((prev) => {
        const next = {
          ...prev,
          files: { ...prev.files, [path]: content },
          updatedAt: nowISO(),
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const setActiveFile = useCallback(
    (path: string | null) => {
      setWorkspace((prev) => {
        const next = { ...prev, activeFile: path, updatedAt: nowISO() };
        persist(next, true);
        return next;
      });
    },
    [persist],
  );

  const setOpenTabs = useCallback(
    (tabs: string[]) => {
      setWorkspace((prev) => {
        const next = { ...prev, openTabs: tabs, updatedAt: nowISO() };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const resetFiles = useCallback(
    (initialFiles: Record<string, string>) => {
      setWorkspace((prev) => {
        const next = {
          ...prev,
          files: { ...initialFiles },
          updatedAt: nowISO(),
        };
        persist(next, true);
        return next;
      });
    },
    [persist],
  );

  const markCompleted = useCallback(() => {
    setWorkspace((prev) => {
      const next = { ...prev, completed: true, updatedAt: nowISO() };
      persist(next, true);
      return next;
    });
  }, [persist]);

  return {
    files: workspace.files,
    activeFile: workspace.activeFile,
    openTabs: workspace.openTabs,
    completed: workspace.completed,
    hasLoaded,
    hasSaved,
    setFile,
    setActiveFile,
    setOpenTabs,
    resetFiles,
    markCompleted,
  };
}
