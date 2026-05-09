import {
  Play,
  RotateCcw,
  Lightbulb,
  Eye,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type NavItem = {
  id: string;
  title: string;
} | null;

type LessonHeaderProps = {
  courseSlug: string;
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  lessonType: string;
  duration: string;
  fileCount: number;
  prev: NavItem;
  next: NavItem;
  completed: boolean;
  hintsVisible: boolean;
  hasSolution: boolean;
  running: boolean;
  allTestsPassed: boolean;
  onRun: () => void;
  onReset: () => void;
  onToggleHints: () => void;
  onRevealSolution: () => void;
  onToggleComplete: () => void;
};

export function LessonHeader({
  courseSlug,
  lessonTitle,
  moduleTitle,
  courseTitle,
  lessonType,
  duration,
  fileCount,
  prev,
  next,
  completed,
  hintsVisible,
  hasSolution,
  running,
  allTestsPassed,
  onRun,
  onReset,
  onToggleHints,
  onRevealSolution,
  onToggleComplete,
}: LessonHeaderProps) {
  return (
    <div className="border-b border-border bg-sidebar-bg/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar-bg/80">
      <div className="flex items-center h-11 px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] font-mono text-muted-foreground truncate hidden sm:inline">
            {courseTitle}
          </span>
          <ChevronRight className="size-3 text-muted-foreground hidden sm:inline flex-shrink-0" />
          <span className="text-[10px] font-mono text-muted-foreground truncate hidden sm:inline">
            {moduleTitle}
          </span>
          <ChevronRight className="size-3 text-muted-foreground hidden sm:inline flex-shrink-0" />
          <h1 className="text-xs font-semibold text-foreground truncate">
            {lessonTitle}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mr-1">
            <span className="capitalize px-1.5 py-0.5 bg-secondary rounded border border-border text-[9px]">
              {lessonType}
            </span>
            <span>{duration}</span>
            {fileCount > 0 && <span>{fileCount} files</span>}
          </span>

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5 fill-current" />}
            Run Tests
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-border bg-secondary rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            title="Reset code"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={onToggleHints}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded-md ${
              hintsVisible
                ? "border-syntax-keyword/40 bg-syntax-keyword/10 text-syntax-keyword"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title="Show hints"
          >
            <Lightbulb className="size-3.5" />
            <span className="hidden sm:inline">Hints</span>
          </button>

          {hasSolution && (
            <button
              type="button"
              onClick={onRevealSolution}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-border bg-secondary rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              title="View solution"
            >
              <Eye className="size-3.5" />
              <span className="hidden sm:inline">Solution</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleComplete}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded-md ${
              completed
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title={completed ? "Mark incomplete" : "Mark complete"}
          >
            <CheckCircle2 className={`size-3.5 ${completed ? "fill-green-500/20" : ""}`} />
            <span className="hidden sm:inline">{completed ? "Complete" : "Done"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center h-8 px-4 gap-3 border-t border-border bg-editor/50">
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground flex-1">
          {prev ? (
            <Link
              to="/learn/$courseSlug/$lessonSlug"
              params={{ courseSlug, lessonSlug: prev.id }}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-3" />
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{prev.title}</span>
            </Link>
          ) : (
            <span className="text-muted-foreground/40">First lesson</span>
          )}
        </div>

        {allTestsPassed && (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-400">
            <CheckCircle2 className="size-3" /> All tests passed
          </span>
        )}

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          {next ? (
            <Link
              to="/learn/$courseSlug/$lessonSlug"
              params={{ courseSlug, lessonSlug: next.id }}
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{next.title}</span>
              <ChevronRight className="size-3" />
            </Link>
          ) : (
            <span className="text-muted-foreground/40">Last lesson</span>
          )}
        </div>
      </div>
    </div>
  );
}
