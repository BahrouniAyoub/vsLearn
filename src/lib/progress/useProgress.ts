import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { LessonProgress, UserProgressData, StreakInfo, CourseProgressSummary, XpEvent } from "./types";
import { nowISO, computeCourseSummary, defaultUserProgress, emptyLessonProgress } from "./types";
import {
  getLessonProgress as getLocalLessonProgress,
  saveLessonProgress as saveLocalLessonProgress,
  getAllCourseProgress,
  getUserProgress,
  saveUserProgress,
  getXpEvents,
  saveXpEvents,
  addXpEvent as addLocalXpEvent,
  getActivityDates,
  saveActivityDates,
} from "./local";
import {
  syncLessonProgressToSupabase,
  loadLessonProgressFromSupabase,
  syncUserStatsToSupabase,
  loadUserStatsFromSupabase,
  syncXpEventsToSupabase,
  syncActivityDateToSupabase,
} from "./client";
import { computeStreak, recordActivity } from "./streak";
import { levelForXp, calculateXp, createXpEvent } from "./xp";

export type UseProgressResult = {
  userStats: UserProgressData;
  streak: StreakInfo;
  xpEvents: XpEvent[];

  getLessonProgress: (courseSlug: string, lessonSlug: string) => LessonProgress;
  startLesson: (courseSlug: string, lessonSlug: string) => void;
  recordAttempt: (courseSlug: string, lessonSlug: string, score?: number, totalTests?: number) => void;
  completeLesson: (courseSlug: string, lessonSlug: string, score?: number, totalTests?: number) => void;
  completeModule: (courseSlug: string, moduleSlug: string) => void;
  completeCourse: (courseSlug: string) => void;
  recordTime: (seconds: number) => void;
  getCourseSummary: (courseSlug: string, totalLessons: number) => CourseProgressSummary;
  isLoading: boolean;
};

export function useProgress(): UseProgressResult {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [loaded, setLoaded] = useState(false);
  const lessonProgressRef = useRef<Record<string, LessonProgress>>({});
  const [userStats, setUserStats] = useState<UserProgressData>(defaultUserProgress());
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);
  const [activityDates, setActivityDates] = useState<string[]>([]);
  const [, forceUpdate] = useState(0);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loaded) return;

    const localStats = getUserProgress(userId);
    const localEvents = getXpEvents(userId);
    const localDates = getActivityDates(userId);

    setUserStats(localStats);
    setXpEvents(localEvents);
    setActivityDates(localDates);

    if (userId !== "guest") {
      loadUserStatsFromSupabase(userId).then((remote) => {
        if (remote) {
          setUserStats((prev) => {
            const merged = { ...prev };
            if (remote.xp > prev.xp) merged.xp = remote.xp;
            if (remote.longestStreak > prev.longestStreak) merged.longestStreak = remote.longestStreak;
            if (remote.lessonsCompleted > prev.lessonsCompleted) merged.lessonsCompleted = remote.lessonsCompleted;
            if (remote.totalTimeSpent > prev.totalTimeSpent) merged.totalTimeSpent = remote.totalTimeSpent;
            if (remote.lastActivityDate > prev.lastActivityDate) merged.lastActivityDate = remote.lastActivityDate;
            merged.level = levelForXp(merged.xp);
            return merged;
          });
        }
      });
    }

    setLoaded(true);
  }, [userId, loaded]);

  const touch = useCallback(() => forceUpdate((v) => v + 1), []);

  const syncTimer = useCallback(
    (fn: () => void) => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(fn, 2000);
    },
    [],
  );

  const getLessonProgress = useCallback(
    (courseSlug: string, lessonSlug: string): LessonProgress => {
      const key = `${courseSlug}:${lessonSlug}`;
      if (lessonProgressRef.current[key]) return lessonProgressRef.current[key];
      const local = getLocalLessonProgress(userId, courseSlug, lessonSlug);
      lessonProgressRef.current[key] = local;
      return local;
    },
    [userId],
  );

  const persistLessonProgress = useCallback(
    (progress: LessonProgress) => {
      const key = `${progress.courseSlug}:${progress.lessonSlug}`;
      lessonProgressRef.current[key] = progress;
      saveLocalLessonProgress(userId, progress);
      touch();

      if (userId !== "guest") {
        syncTimer(() => syncLessonProgressToSupabase(userId, progress));
      }
    },
    [userId, syncTimer, touch],
  );

  const persistUserStats = useCallback(
    (stats: UserProgressData, immediate?: boolean) => {
      saveUserProgress(userId, stats);
      setUserStats(stats);

      if (userId !== "guest") {
        const fn = () => syncUserStatsToSupabase(userId, stats);
        if (immediate) fn();
        else syncTimer(fn);
      }
    },
    [userId, syncTimer],
  );

  const startLesson = useCallback(
    (courseSlug: string, lessonSlug: string) => {
      const existing = getLessonProgress(courseSlug, lessonSlug);
      if (existing.status === "not_started") {
        persistLessonProgress({ ...existing, status: "in_progress", startedAt: nowISO(), lastAccessedAt: nowISO() });
      } else {
        persistLessonProgress({ ...existing, lastAccessedAt: nowISO() });
      }
    },
    [getLessonProgress, persistLessonProgress],
  );

  const recordAttempt = useCallback(
    (courseSlug: string, lessonSlug: string, score?: number, totalTests?: number) => {
      const existing = getLessonProgress(courseSlug, lessonSlug);
      const pct = score != null && totalTests != null && totalTests > 0 ? Math.round((score / totalTests) * 100) : 0;
      persistLessonProgress({
        ...existing,
        status: "in_progress",
        attempts: existing.attempts + 1,
        bestScore: existing.bestScore != null ? Math.max(existing.bestScore, pct) : (pct || null),
        lastAccessedAt: nowISO(),
        startedAt: existing.startedAt ?? nowISO(),
      });
    },
    [getLessonProgress, persistLessonProgress],
  );

  const completeLesson = useCallback(
    (courseSlug: string, lessonSlug: string, score?: number, totalTests?: number) => {
      const existing = getLessonProgress(courseSlug, lessonSlug);
      const pct = score != null && totalTests != null && totalTests > 0
        ? Math.round((score / totalTests) * 100)
        : 100;
      const xpAmount = totalTests != null && totalTests > 0 && score != null
        ? calculateXp("challenge", userStats.streak, { score, totalQuestions: totalTests })
        : calculateXp("lesson", userStats.streak);

      persistLessonProgress({
        ...existing,
        status: "completed",
        attempts: existing.attempts + 1,
        bestScore: existing.bestScore != null ? Math.max(existing.bestScore, pct) : pct,
        xpEarned: existing.xpEarned + xpAmount,
        completedAt: nowISO(),
        lastAccessedAt: nowISO(),
        startedAt: existing.startedAt ?? nowISO(),
      });

      const activityResult = recordActivity(activityDates, userStats.longestStreak);
      setActivityDates(activityResult.activityDates);
      saveActivityDates(userId, activityResult.activityDates);
      if (userId !== "guest") syncActivityDateToSupabase(userId, nowISO().slice(0, 10));

      const xpEvent = createXpEvent(xpAmount, `Completed: ${lessonSlug}`, "lesson");
      addLocalXpEvent(userId, xpEvent);
      setXpEvents((prev) => [...prev, xpEvent]);
      if (userId !== "guest") syncXpEventsToSupabase(userId, [xpEvent]);

      const newXp = userStats.xp + xpAmount;
      persistUserStats({
        ...userStats,
        xp: newXp,
        level: levelForXp(newXp),
        streak: activityResult.currentStreak,
        longestStreak: activityResult.longestStreak,
        lastActivityDate: nowISO().slice(0, 10),
        lessonsCompleted: userStats.lessonsCompleted + 1,
      });
    },
    [getLessonProgress, userStats, activityDates, userId, persistLessonProgress, persistUserStats],
  );

  const completeModule = useCallback(
    (courseSlug: string, moduleSlug: string) => {
      const xpAmount = calculateXp("challenge", userStats.streak);
      const xpEvent = createXpEvent(xpAmount, `Module completed: ${moduleSlug}`, "lesson");
      addLocalXpEvent(userId, xpEvent);
      setXpEvents((prev) => [...prev, xpEvent]);

      const newXp = userStats.xp + xpAmount;
      persistUserStats({
        ...userStats,
        xp: newXp,
        level: levelForXp(newXp),
        modulesCompleted: userStats.modulesCompleted + 1,
      });
    },
    [userStats, userId, persistUserStats],
  );

  const completeCourse = useCallback(
    (courseSlug: string) => {
      const xpAmount = calculateXp("course", userStats.streak);

      addLocalXpEvent(userId, createXpEvent(xpAmount, `Course completed: ${courseSlug}`, "course"));
      const newXp = userStats.xp + xpAmount;
      persistUserStats(
        {
          ...userStats,
          xp: newXp,
          level: levelForXp(newXp),
          coursesCompleted: userStats.coursesCompleted + 1,
        },
        true,
      );
    },
    [userStats, userId, persistUserStats],
  );

  const recordTime = useCallback(
    (seconds: number) => {
      persistUserStats({ ...userStats, totalTimeSpent: userStats.totalTimeSpent + seconds });
    },
    [userStats, persistUserStats],
  );

  const getCourseSummary = useCallback(
    (courseSlug: string, totalLessons: number): CourseProgressSummary => {
      const values = Object.values(lessonProgressRef.current).filter((p) => p.courseSlug === courseSlug);
      const allProgress = values.length > 0 ? values : getAllCourseProgress(userId, courseSlug);
      return computeCourseSummary(allProgress, courseSlug, totalLessons);
    },
    [userId],
  );

  const streak = computeStreak(activityDates, userStats.longestStreak);

  return {
    userStats,
    streak,
    xpEvents,
    getLessonProgress,
    startLesson,
    recordAttempt,
    completeLesson,
    completeModule,
    completeCourse,
    recordTime,
    getCourseSummary,
    isLoading: !loaded,
  };
}
