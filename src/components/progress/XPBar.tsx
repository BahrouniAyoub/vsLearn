import { TrendingUp, Zap } from "lucide-react";
import { levelForXp, xpProgressInLevel, xpForNextLevel } from "@/lib/progress";

type XPBarProps = {
  xp: number;
  size?: "sm" | "md";
};

export function XPBar({ xp, size = "md" }: XPBarProps) {
  const level = levelForXp(xp);
  const progress = xpProgressInLevel(xp);
  const toNext = xpForNextLevel(xp);

  const barH = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1 flex-shrink-0">
        <Zap className={`${size === "sm" ? "size-3.5" : "size-4"} text-yellow-400 fill-yellow-400/30`} />
        <span className={`font-bold font-mono ${size === "sm" ? "text-xs" : "text-sm"} text-yellow-400`}>
          {xp.toLocaleString()}
        </span>
      </div>
      <div className="flex-1 min-w-[60px]">
        <div className={`${barH} bg-secondary rounded-full overflow-hidden border border-border/50`}>
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`font-mono font-semibold ${size === "sm" ? "text-[10px]" : "text-xs"} text-foreground`}>
          Lv.{level}
        </span>
        <span className={`text-muted-foreground ${size === "sm" ? "text-[9px]" : "text-[10px]"}`}>
          {toNext.toLocaleString()} XP to next
        </span>
      </div>
    </div>
  );
}

type LevelBadgeProps = {
  level: number;
  xp: number;
};

export function LevelBadge({ level, xp }: LevelBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full">
      <TrendingUp className="size-3.5 text-amber-400" />
      <span className="text-xs font-mono font-bold text-amber-400">Level {level}</span>
      <span className="text-[10px] font-mono text-muted-foreground">{xp.toLocaleString()} XP</span>
    </div>
  );
}
