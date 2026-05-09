export type {
  ProjectSubmission,
  ProjectStatus,
  TestRunResult,
  ProjectSummary,
} from "./types";
export { PROJECT_PREFIX, storageKey, nowISO, generateSlug } from "./types";

export {
  createProject,
  saveDraft,
  submitProject,
  publishProject,
  unpublishProject,
  updateProjectStatus,
  getUserProjects,
  getLessonProject,
  getProjectByUserSlug,
  getProjectById,
  getAllPublished,
  findPublishedBySlug,
  getCourseProjectLessons,
} from "./service";

export { useProjects } from "./useProjects";
export type { UseProjectsResult } from "./useProjects";

export {
  syncProjectToSupabase,
  loadProjectsFromSupabase,
  fetchPublishedProjectsFromSupabase,
} from "./client";
