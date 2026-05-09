import { useEffect, useRef, useCallback } from "react";
import { Target, RotateCcw, Zap, Clock, CheckCircle2 } from "lucide-react";
import type { LessonProgress, UserProgressData, StreakInfo } from "@/lib/progress";
import { XPBar } from "./XPBar";
import { StreakDisplay } from "./StreakDisplay";

type LessonTrackerProps = {
  lessonProgress: LessonProgress;
  userStats: UserProgressData;
  streak: StreakInfo;
  onRecordTime?: (seconds: number) => void;
};

export function LessonTracker({ lessonProgress, userStats, streak, onRecordTime }: LessonTrackerProps) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      if (elapsed > 0 && elapsed % 30 === 0) {
        onRecordTime?.(30);
      }
    }, 30000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      if (elapsed > 0) onRecordTime?.(elapsed);
    };
  }, [onRecordTime]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <XPBar xp={userStats.xp} size="sm" />
        <StreakDisplay streak={streak} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          icon={<RotateCcw className="size-3 text-muted-foreground" />}
          label="Attempts"
          value={String(lessonProgress.attempts)}
        />
        <MiniStat
          icon={<CheckCircle2 className="size-3 text-green-400" />}
          label="Best score"
          value={lessonProgress.bestScore != null ? `${lessonProgress.bestScore}%` : "—"}
        />
        <MiniStat
          icon={<Zap className="size-3 text-yellow-400" />}
          label="XP earned"
          value={String(lessonProgress.xpEarned)}
        />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary/50 border border-border rounded px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground mb-0.5">
        {icon} {label}
      </div>
      <div className="text-xs font-mono font-semibold text-foreground">{value}</div>
    </div>
  );
}
