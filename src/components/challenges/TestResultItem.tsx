import { useState } from "react";
import { Check, X, AlertCircle, SkipForward, ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import type { TestResult } from "@/lib/challenges";

const STATUS_CONFIG = {
  pass: { icon: Check, className: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
  fail: { icon: X, className: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  error: { icon: AlertCircle, className: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  skip: { icon: SkipForward, className: "text-muted-foreground", bg: "bg-secondary border-border" },
} as const;

type TestResultItemProps = {
  result: TestResult;
};

export function TestResultItem({ result }: TestResultItemProps) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[result.status];
  const Icon = config.icon;
  const hasDetails = result.hint || (result.status !== "pass" && result.message);

  return (
    <div className={`border rounded ${config.bg} ${hasDetails ? "cursor-pointer" : ""}`}>
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((v) => !v)}
        className="w-full flex items-start gap-2 px-3 py-2 text-xs font-mono text-left"
      >
        {hasDetails ? (
          expanded ? <ChevronDown className="size-3 mt-0.5 flex-shrink-0 text-muted-foreground" /> :
                     <ChevronRight className="size-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <span className="size-3 flex-shrink-0" />
        )}
        <Icon className={`size-3.5 mt-0.5 flex-shrink-0 ${config.className}`} />
        <div className="flex-1 min-w-0">
          <span className={result.status === "pass" ? "text-green-400" : "text-foreground"}>
            {result.name}
          </span>
          {result.status === "pass" && (
            <span className="ml-2 text-green-400/70 text-[10px]">{result.message}</span>
          )}
        </div>
        <span className={`text-[10px] uppercase flex-shrink-0 ${config.className}`}>
          {result.status}
        </span>
      </button>
      {expanded && hasDetails && (
        <div className="px-3 pb-2 space-y-1">
          {result.status !== "pass" && result.message && (
            <div className="text-xs font-mono text-foreground/80 pl-5">{result.message}</div>
          )}
          {result.hint && (
            <div className="flex items-start gap-1.5 pl-5 text-xs text-syntax-keyword">
              <Lightbulb className="size-3 mt-0.5 flex-shrink-0" />
              <span>{result.hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
