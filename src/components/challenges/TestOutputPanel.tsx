import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import type { TestSuite, TestGroup } from "@/lib/challenges";
import { TestResultGroup } from "./TestResultGroup";

const RUNNER_TABS = [
  { id: "all", label: "ALL" },
  { id: "dom", label: "DOM" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "javascript", label: "JS" },
  { id: "a11y", label: "A11Y" },
] as const;

type TestOutputPanelProps = {
  suite: TestSuite | null;
  running: boolean;
  onRun: () => void;
  onReset?: () => void;
};

export function TestOutputPanel({ suite, running, onRun, onReset }: TestOutputPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  const filteredGroups: TestGroup[] = suite
    ? activeTab === "all"
      ? suite.groups
      : suite.groups.filter((g) => g.runner === activeTab)
    : [];

  const allPassed = suite ? suite.summary.failed === 0 && suite.summary.errors === 0 && suite.summary.total > 0 : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [suite]);

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 flex items-center px-3 border-b border-border text-xs flex-shrink-0">
        <div className="flex gap-1">
          {RUNNER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1 rounded text-[10px] font-mono ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {suite && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mr-2">
              {allPassed ? (
                <CheckCircle2 className="size-3 text-green-400" />
              ) : suite.summary.total > 0 ? (
                <XCircle className="size-3 text-destructive" />
              ) : null}
              {suite.summary.passed}/{suite.summary.total}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
            title="Reset"
          >
            <RotateCcw className="size-3" />
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Play className="size-3 fill-current" />
            )}
            Run Tests
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-xs">
        {!suite && !running && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Play className="size-8 text-muted-foreground/30" />
            <span className="text-sm">Run tests to validate your solution</span>
          </div>
        )}
        {running && (
          <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Running tests...</span>
          </div>
        )}
        {suite && !running && filteredGroups.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <AlertCircle className="size-4 mr-2" /> No test groups match filter
          </div>
        )}
        {suite && !running && filteredGroups.map((group) => (
          <TestResultGroup key={group.id} group={group} defaultOpen={true} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
