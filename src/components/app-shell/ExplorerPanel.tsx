import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { courses, courseProgress, mockUser } from "@/lib/vslearn/data";

export function ExplorerPanel({
  collapsed,
  onToggle,
  children,
}: {
  collapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <aside
      className={`${collapsed ? "hidden" : "hidden md:flex md:w-72"} bg-sidebar-bg border-r border-border flex-col flex-shrink-0 overflow-hidden`}
    >
      <div className="px-4 h-9 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto">{children ?? <DefaultExplorer />}</div>
    </aside>
  );
}

export function ExplorerToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="md:hidden fixed bottom-10 left-3 z-40 bg-card border border-border rounded-md p-2 text-muted-foreground"
    >
      {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
    </button>
  );
}

function DefaultExplorer() {
  return (
    <div className="text-[13px] pb-4">
      <div className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        My Courses
      </div>
      {mockUser.enrolledCourses.map((courseId) => {
        const course = courses.find((item) => item.id === courseId);
        if (!course) return null;
        const progress = courseProgress(course.id);
        return (
          <div key={course.id} className="group">
            <Link
              to="/learn/$courseSlug"
              params={{ courseSlug: course.id }}
              className="flex items-center gap-1 px-2 py-1 hover:bg-accent/30"
            >
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-base mr-1" style={{ color: course.color }}>
                {course.icon}
              </span>
              <span className="truncate">{course.title}</span>
            </Link>
            <div className="ml-5">
              {course.modules.map((module) => (
                <div key={module.id}>
                  <div className="flex items-center gap-1 px-2 py-1 text-muted-foreground">
                    <ChevronRight className="size-3" /> 📁 {module.title}
                  </div>
                  <div className="ml-5">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to="/learn/$courseSlug/$lessonSlug"
                        params={{ courseSlug: course.id, lessonSlug: lesson.id }}
                        className="flex items-center gap-2 px-2 py-1 hover:bg-accent/30 [&.active]:bg-accent/50"
                        activeProps={{ className: "active" }}
                      >
                        <FileIcon type={lesson.type} />
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 pb-2">
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{progress}% complete</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FileIcon({ type }: { type?: string }) {
  const map: Record<string, { ch: string; color: string }> = {
    text: { ch: "MD", color: "#519aba" },
    video: { ch: "▶", color: "#e94f64" },
    quiz: { ch: "?", color: "#dcb67a" },
    coding: { ch: "JS", color: "#f7df1e" },
  };
  const item = map[type ?? "text"] ?? map.text;
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[8px] font-bold flex-shrink-0"
      style={{ color: item.color }}
    >
      {item.ch}
    </span>
  );
}
