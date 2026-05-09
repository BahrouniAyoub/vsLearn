import { CheckCircle2, BookOpen, Clock, Flame, Zap, Layers } from "lucide-react";
import { computeCourseSummary } from "@/lib/progress";
import type { CourseProgressSummary, UserProgressData, StreakInfo } from "@/lib/progress";
import { XPBar, LevelBadge } from "./XPBar";
import { StreakDisplay } from "./StreakDisplay";

type ProgressSummaryProps = {
  stats: UserProgressData;
  streak: StreakInfo;
  courseProgresses?: CourseProgressSummary[];
};

export function ProgressSummary({ stats, streak, courseProgresses = [] }: ProgressSummaryProps) {
  const totalLessonsAcrossCourses = courseProgresses.reduce((s, c) => s + c.totalLessons, 0);
  const totalCompletedAcrossCourses = courseProgresses.reduce((s, c) => s + c.completedLessons, 0);

  return (
    <div className="space-y-6">
      <LevelBadge level={stats.level} xp={stats.xp} />
      <XPBar xp={stats.xp} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<CheckCircle2 className="size-4 text-green-400" />}
          label="Lessons"
          value={String(stats.lessonsCompleted)}
        />
        <StatCard
          icon={<Layers className="size-4 text-syntax-keyword" />}
          label="Courses"
          value={String(stats.coursesCompleted)}
        />
        <StatCard
          icon={<Flame className="size-4 text-orange-400" />}
          label="Day streak"
          value={String(streak.currentStreak)}
        />
        <StatCard
          icon={<Clock className="size-4 text-blue-400" />}
          label="Time spent"
          value={formatTime(stats.totalTimeSpent)}
        />
      </div>

      {courseProgresses.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="size-3" /> Course Progress
          </div>
          {courseProgresses.map((cp) => (
            <CourseMiniProgress key={cp.courseSlug} progress={cp} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseMiniProgress({ progress }: { progress: CourseProgressSummary }) {
  return (
    <div className="bg-secondary/50 border border-border rounded-md p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-foreground truncate">{progress.courseSlug}</span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {progress.completedLessons}/{progress.totalLessons}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] font-mono text-muted-foreground">{progress.percentComplete}%</span>
        <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
          <Zap className="size-2.5 text-yellow-400" /> {progress.xpEarned} XP
        </span>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="border border-border bg-card rounded-md p-3">
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className="text-lg font-bold font-mono text-foreground">{value}</span>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground">{label}</div>
    </div>
  );
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
