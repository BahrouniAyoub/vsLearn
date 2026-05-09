import { Flame, AlertTriangle, Sparkles } from "lucide-react";
import type { StreakInfo } from "@/lib/progress";
import { streakLabel } from "@/lib/progress";

type StreakDisplayProps = {
  streak: StreakInfo;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

export function StreakDisplay({ streak, size = "md", showLabel = true }: StreakDisplayProps) {
  const flameSize = size === "lg" ? "size-6" : size === "md" ? "size-5" : "size-3.5";
  const textSize = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-xs";
  const labelSize = size === "lg" ? "text-xs" : size === "md" ? "text-[10px]" : "text-[9px]";

  const { currentStreak, activeToday, atRisk } = streak;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {currentStreak > 0 ? (
          <Flame
            className={`${flameSize} ${currentStreak >= 7 ? "text-orange-400" : currentStreak >= 3 ? "text-amber-400" : "text-amber-500/70"} ${activeToday ? "animate-pulse" : ""}`}
          />
        ) : (
          <Sparkles className={`${flameSize} text-muted-foreground/40`} />
        )}
      </div>
      <div>
        <div className={`font-bold font-mono ${textSize} ${currentStreak > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
          {currentStreak}
        </div>
        {showLabel && (
          <div className={`${labelSize} text-muted-foreground font-mono flex items-center gap-1`}>
            {atRisk ? (
              <>
                <AlertTriangle className="size-2.5 text-amber-400" />
                <span className="text-amber-400">Complete today!</span>
              </>
            ) : (
              streakLabel(currentStreak)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
