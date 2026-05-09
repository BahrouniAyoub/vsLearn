export { useProgress } from "./useProgress";
export type { UseProgressResult } from "./useProgress";

export type {
  LessonProgress,
  LessonStatus,
  CourseProgressSummary,
  UserProgressData,
  StreakInfo,
  XpEvent,
  TimeSession,
} from "./types";
export {
  emptyLessonProgress,
  defaultUserProgress,
  computeCourseSummary,
  nowISO,
  todayDate,
  daysBetween,
} from "./types";

export { levelForXp, xpForNextLevel, xpProgressInLevel, calculateXp, createXpEvent } from "./xp";
export { computeStreak, recordActivity, streakLabel } from "./streak";
export { useCourseProgress } from "./useCourseProgress";
