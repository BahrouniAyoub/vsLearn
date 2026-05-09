import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { TestGroup } from "@/lib/challenges";
import { TestResultItem } from "./TestResultItem";

type TestResultGroupProps = {
  group: TestGroup;
  defaultOpen?: boolean;
};

export function TestResultGroup({ group, defaultOpen = false }: TestResultGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const passed = group.results.filter((r) => r.status === "pass").length;
  const failed = group.results.filter((r) => r.status === "fail" || r.status === "error").length;
  const allPassed = failed === 0 && group.results.length > 0;

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-secondary text-xs font-mono hover:bg-accent/30"
      >
        {open ? <ChevronDown className="size-3.5 text-muted-foreground" /> :
                <ChevronRight className="size-3.5 text-muted-foreground" />}
        <span className="flex-1 text-left font-medium">{group.name}</span>
        <span className="flex items-center gap-2 text-[10px]">
          {allPassed ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="size-3" /> {group.results.length}/{group.results.length}
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="size-3" /> {passed}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="size-3" /> {failed}
              </span>
            </>
          )}
        </span>
        <span className="text-muted-foreground">{group.results.length} tests</span>
      </button>
      {open && (
        <div className="p-2 space-y-1.5 bg-editor">
          {group.results.map((r) => (
            <TestResultItem key={r.id} result={r} />
          ))}
          {group.results.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <AlertCircle className="size-3" /> No tests in this group
            </div>
          )}
        </div>
      )}
    </div>
  );
}
