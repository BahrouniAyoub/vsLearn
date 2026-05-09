import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { ProjectSubmission, ProjectStatus } from "./types";
import {
  getUserProjects,
  getLessonProject,
  getProjectByUserSlug,
  createProject,
  saveDraft,
  submitProject,
  publishProject,
  unpublishProject,
  updateProjectStatus,
  getAllPublished,
} from "./service";
import { loadProjectsFromSupabase } from "./client";
import type { ChallengeTestConfig } from "@/lib/challenges";

export type UseProjectsResult = {
  projects: ProjectSubmission[];
  isLoading: boolean;
  getProjectForLesson: (courseSlug: string, lessonSlug: string) => ProjectSubmission | null;
  getProjectBySlug: (slug: string) => ProjectSubmission | null;
  startProject: (courseSlug: string, courseTitle: string, lessonSlug: string, lessonTitle: string) => ProjectSubmission;
  updateDraft: (project: ProjectSubmission, updates: Partial<ProjectSubmission>) => ProjectSubmission;
  submit: (project: ProjectSubmission, config?: ChallengeTestConfig | null) => { project: ProjectSubmission; testResults: import("./types").TestRunResult | null };
  setPublished: (project: ProjectSubmission, published: boolean) => ProjectSubmission;
  setStatus: (project: ProjectSubmission, status: ProjectStatus, notes?: string) => ProjectSubmission;
};

export function useProjects(): UseProjectsResult {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "user";
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const local = getUserProjects(userId);
    setProjects(local);

    if (userId !== "guest") {
      loadProjectsFromSupabase(userId).then((remote) => {
        setProjects((prev) => {
          const merged = [...prev];
          for (const r of remote) {
            if (!merged.find((p) => p.id === r.id)) merged.push(r);
          }
          return merged;
        });
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [userId]);

  const touch = useCallback(() => setProjects((prev) => [...prev]), []);

  const getProjectForLesson = useCallback(
    (courseSlug: string, lessonSlug: string) => getLessonProject(userId, courseSlug, lessonSlug),
    [userId],
  );

  const getProjectBySlugFn = useCallback(
    (slug: string) => getProjectByUserSlug(userId, slug),
    [userId],
  );

  const startProject = useCallback(
    (courseSlug: string, courseTitle: string, lessonSlug: string, lessonTitle: string) => {
      const existing = getLessonProject(userId, courseSlug, lessonSlug);
      if (existing && existing.status === "draft") return existing;

      const project = createProject(userId, username, courseSlug, courseTitle, lessonSlug, lessonTitle);
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [userId, username],
  );

  const updateDraft = useCallback(
    (project: ProjectSubmission, updates: Partial<ProjectSubmission>) => {
      const updated = saveDraft(userId, project, updates);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    [userId],
  );

  const submit = useCallback(
    (project: ProjectSubmission, config?: ChallengeTestConfig | null) => {
      const result = submitProject(userId, project, config);
      setProjects((prev) => prev.map((p) => (p.id === result.project.id ? result.project : p)));
      return result;
    },
    [userId],
  );

  const setPublished = useCallback(
    (project: ProjectSubmission, published: boolean) => {
      const updated = published ? publishProject(userId, project) : unpublishProject(userId, project);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    [userId],
  );

  const setStatus = useCallback(
    (project: ProjectSubmission, status: ProjectStatus, notes?: string) => {
      const updated = updateProjectStatus(userId, project, status, notes);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    },
    [userId],
  );

  return {
    projects,
    isLoading: !loaded,
    getProjectForLesson,
    getProjectBySlug: getProjectBySlugFn,
    startProject,
    updateDraft,
    submit,
    setPublished,
    setStatus,
  };
}
