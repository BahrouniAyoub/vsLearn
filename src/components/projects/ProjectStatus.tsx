import type { ProjectStatus as TProjectStatus } from "@/lib/projects";
import { cn } from "@/lib/utils";

const statusConfig: Record<TProjectStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-secondary text-muted-foreground border-border",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  passed: {
    label: "Passed",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  needs_changes: {
    label: "Needs Changes",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
};

export function ProjectStatus({ status, className }: { status: TProjectStatus; className?: string }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono rounded-full border",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
