import type { LessonProgress, UserProgressData, XpEvent } from "./types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ProgressRecord = {
  id?: string;
  user_id: string;
  course_slug: string;
  lesson_slug: string;
  status: string;
  attempts: number;
  best_score: number | null;
  time_spent: number;
  xp_earned: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string;
};

type UserStatsRecord = {
  id?: string;
  user_id: string;
  xp: number;
  streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_time_spent: number;
  lessons_completed: number;
  courses_completed: number;
  modules_completed: number;
};

type XpEventRecord = {
  id?: string;
  user_id: string;
  amount: number;
  reason: string;
  timestamp: string;
  category: string;
};

type ActivityDateRecord = {
  id?: string;
  user_id: string;
  date: string;
};

function toProgressRecord(userId: string, p: LessonProgress): ProgressRecord {
  return {
    user_id: userId,
    course_slug: p.courseSlug,
    lesson_slug: p.lessonSlug,
    status: p.status,
    attempts: p.attempts,
    best_score: p.bestScore,
    time_spent: p.timeSpent,
    xp_earned: p.xpEarned,
    started_at: p.startedAt,
    completed_at: p.completedAt,
    last_accessed_at: p.lastAccessedAt,
  };
}

function fromProgressRecord(r: ProgressRecord): LessonProgress {
  return {
    courseSlug: r.course_slug,
    lessonSlug: r.lesson_slug,
    status: r.status as LessonProgress["status"],
    attempts: r.attempts,
    bestScore: r.best_score,
    timeSpent: r.time_spent,
    xpEarned: r.xp_earned,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    lastAccessedAt: r.last_accessed_at,
  };
}

export async function syncLessonProgressToSupabase(userId: string, progress: LessonProgress) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const record = toProgressRecord(userId, progress);

    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", progress.courseSlug)
      .eq("lesson_slug", progress.lessonSlug)
      .maybeSingle();

    if (existing) {
      await supabase.from("lesson_progress").update(record).eq("id", existing.id);
    } else {
      await supabase.from("lesson_progress").insert(record);
    }
  } catch {}
}

export async function loadLessonProgressFromSupabase(
  userId: string,
  courseSlug: string,
): Promise<LessonProgress[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug);

    return (data ?? []).map(fromProgressRecord);
  } catch {
    return [];
  }
}

export async function syncUserStatsToSupabase(userId: string, stats: UserProgressData) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const record: UserStatsRecord = {
      user_id: userId,
      xp: stats.xp,
      streak: stats.streak,
      longest_streak: stats.longestStreak,
      last_activity_date: stats.lastActivityDate,
      total_time_spent: stats.totalTimeSpent,
      lessons_completed: stats.lessonsCompleted,
      courses_completed: stats.coursesCompleted,
      modules_completed: stats.modulesCompleted,
    };

    const { data: existing } = await supabase
      .from("user_stats")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("user_stats").update(record).eq("id", existing.id);
    } else {
      await supabase.from("user_stats").insert(record);
    }
  } catch {}
}

export async function loadUserStatsFromSupabase(userId: string): Promise<UserProgressData | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;

    const { data } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return null;

    return {
      xp: data.xp ?? 0,
      level: 1,
      streak: data.streak ?? 0,
      longestStreak: data.longest_streak ?? 0,
      lastActivityDate: data.last_activity_date ?? "",
      totalTimeSpent: data.total_time_spent ?? 0,
      lessonsCompleted: data.lessons_completed ?? 0,
      coursesCompleted: data.courses_completed ?? 0,
      modulesCompleted: data.modules_completed ?? 0,
    };
  } catch {
    return null;
  }
}

export async function syncXpEventsToSupabase(userId: string, events: XpEvent[]) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    if (events.length === 0) return;

    const records: XpEventRecord[] = events.map((e) => ({
      user_id: userId,
      amount: e.amount,
      reason: e.reason,
      timestamp: e.timestamp,
      category: e.category,
    }));

    await supabase.from("xp_events").insert(records);
  } catch {}
}

export async function syncActivityDateToSupabase(userId: string, date: string) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data: existing } = await supabase
      .from("activity_dates")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (!existing) {
      await supabase.from("activity_dates").insert({ user_id: userId, date });
    }
  } catch {}
}
