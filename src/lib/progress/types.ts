export type LessonStatus = "not_started" | "in_progress" | "completed";

export type LessonProgress = {
  courseSlug: string;
  lessonSlug: string;
  status: LessonStatus;
  attempts: number;
  bestScore: number | null;
  timeSpent: number;
  xpEarned: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
};

export type CourseProgressSummary = {
  courseSlug: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentComplete: number;
  xpEarned: number;
  timeSpent: number;
};

export type UserProgressData = {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalTimeSpent: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  modulesCompleted: number;
};

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  activeToday: boolean;
  atRisk: boolean;
};

export type XpEvent = {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
  category: "lesson" | "challenge" | "streak" | "quiz" | "course";
};

export type TimeSession = {
  startTime: number;
  accumulated: number;
};

export const PROGRESS_PREFIX = "vslearn_progress_v2";
export const XP_PREFIX = "vslearn_xp_v2";
export const STREAK_PREFIX = "vslearn_streak_v2";
export const TIME_PREFIX = "vslearn_time_v2";

export function storageKey(prefix: string, userId: string, ...parts: string[]): string {
  return [prefix, userId, ...parts].join("_");
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a).setHours(0, 0, 0, 0);
  const db = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((da - db) / 86400000);
}

export function defaultUserProgress(): UserProgressData {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    totalTimeSpent: 0,
    lessonsCompleted: 0,
    coursesCompleted: 0,
    modulesCompleted: 0,
  };
}

export function emptyLessonProgress(courseSlug: string, lessonSlug: string): LessonProgress {
  return {
    courseSlug,
    lessonSlug,
    status: "not_started",
    attempts: 0,
    bestScore: null,
    timeSpent: 0,
    xpEarned: 0,
    startedAt: null,
    completedAt: null,
    lastAccessedAt: nowISO(),
  };
}

export function computeCourseSummary(
  lessons: LessonProgress[],
  courseSlug: string,
  totalLessons: number,
): CourseProgressSummary {
  const completed = lessons.filter((l) => l.status === "completed");
  const inProgress = lessons.filter((l) => l.status === "in_progress");
  return {
    courseSlug,
    totalLessons,
    completedLessons: completed.length,
    inProgressLessons: inProgress.length,
    percentComplete: totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0,
    xpEarned: completed.reduce((sum, l) => sum + l.xpEarned, 0),
    timeSpent: lessons.reduce((sum, l) => sum + l.timeSpent, 0),
  };
}
