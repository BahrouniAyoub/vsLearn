import React, { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Settings,
  User,
  Bell,
  Award,
  BookOpen,
  Bookmark,
  LayoutDashboard,
  Terminal as TermIcon,
  ChevronRight,
  X,
  Circle,
  Wifi,
  AlertCircle,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { courses, mockUser, courseProgress } from "@/lib/vslearn/data";
import { CommandPalette } from "./CommandPalette";

interface Tab {
  id: string;
  title: string;
  path: string;
  icon?: string;
}

export function VSCodeShell({
  children,
  tabs = [],
  breadcrumbs = [],
  terminalContent,
  sidebarContent,
}: {
  children: React.ReactNode;
  tabs?: Tab[];
  breadcrumbs?: string[];
  terminalContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [activityView, setActivityView] = useState<"explorer" | "search" | "courses" | "profile">(
    "explorer",
  );
  const { user } = useAuth();
  const initials = (user?.email ?? mockUser.email).slice(0, 2).toUpperCase();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
      if (e.key === "`" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setTerminalOpen((t) => !t);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const defaultSidebar = (
    <div className="text-[13px]">
      <div className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        My Courses
      </div>
      {mockUser.enrolledCourses.map((cid) => {
        const course = courses.find((c) => c.id === cid);
        if (!course) return null;
        const progress = courseProgress(cid);
        return (
          <div key={cid} className="group">
            <div className="flex items-center gap-1 px-2 py-1 hover:bg-accent/30 cursor-pointer">
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-base mr-1" style={{ color: course.color }}>
                {course.icon}
              </span>
              <span className="truncate">{course.title}</span>
            </div>
            {course.modules.map((m) => (
              <div key={m.id} className="ml-5">
                <div className="flex items-center gap-1 px-2 py-1 hover:bg-accent/30 cursor-pointer">
                  <ChevronRight className="size-3 text-muted-foreground" />
                  <span className="text-muted-foreground">📁</span>
                  <span>{m.title}</span>
                </div>
                <div className="ml-5">
                  {m.lessons.map((l) => (
                    <Link
                      key={l.id}
                      to="/learn/$courseId/$lessonId"
                      params={{ courseId: cid, lessonId: l.id }}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-accent/30 [&.active]:bg-accent/50"
                      activeProps={{ className: "active" }}
                    >
                      <FileIcon type={l.type} />
                      <span className="truncate">{l.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-3 pb-2">
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{progress}% complete</div>
            </div>
          </div>
        );
      })}

      <div className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
        <Bookmark className="size-3" /> Bookmarks
      </div>
      <div className="px-3 py-1 text-muted-foreground text-xs">No bookmarks yet</div>

      <div className="px-4 pt-4 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
        <Award className="size-3" /> Badges
      </div>
      <div className="px-3 pb-4 flex flex-wrap gap-2">
        {mockUser.badges.map((b) => (
          <div
            key={b.id}
            className="bg-secondary border border-border rounded px-2 py-1 text-xs flex items-center gap-1"
          >
            <span>{b.icon}</span> {b.name}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Title bar */}
      <div className="h-9 bg-titlebar border-b border-border flex items-center px-3 text-xs select-none flex-shrink-0">
        <div className="flex gap-1.5 mr-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <Link to="/" className="font-semibold tracking-tight mr-4">
          VS<span className="text-primary">Learn</span>
        </Link>
        <div className="flex gap-3 text-muted-foreground">
          {["File", "Edit", "View", "Go", "Run", "Help"].map((m) => (
            <span key={m} className="hover:text-foreground cursor-default">
              {m}
            </span>
          ))}
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="mx-auto bg-secondary border border-border rounded px-3 py-1 text-xs text-muted-foreground hover:bg-accent/40 hidden md:flex items-center gap-2 min-w-[300px] justify-center"
        >
          <Search className="size-3" /> Search lessons, courses, commands…
          <kbd className="ml-2 px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
            ⌘K
          </kbd>
        </button>
        <div className="ml-auto flex items-center gap-3 text-muted-foreground">
          <Bell className="size-3.5" />
          <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
            {initials}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Activity bar */}
        <div className="w-12 bg-activity-bar flex flex-col items-center py-2 gap-1 flex-shrink-0">
          <ActivityIcon
            icon={<Files className="size-5" />}
            active={activityView === "explorer"}
            onClick={() => setActivityView("explorer")}
            label="Explorer"
          />
          <ActivityIcon
            icon={<Search className="size-5" />}
            active={activityView === "search"}
            onClick={() => {
              setActivityView("search");
              setPaletteOpen(true);
            }}
            label="Search"
          />
          <ActivityIcon
            icon={<BookOpen className="size-5" />}
            active={activityView === "courses"}
            onClick={() => setActivityView("courses")}
            label="Courses"
            link="/courses"
          />
          <ActivityIcon
            icon={<LayoutDashboard className="size-5" />}
            label="Dashboard"
            link="/dashboard"
          />
          <ActivityIcon icon={<GitBranch className="size-5" />} label="Source Control" />
          <ActivityIcon icon={<Bug className="size-5" />} label="Run & Debug" />
          <ActivityIcon icon={<Award className="size-5" />} label="Achievements" />
          <div className="mt-auto flex flex-col gap-1">
            <ActivityIcon
              icon={<User className="size-5" />}
              label="Account"
              link={user ? "/settings/account" : "/login"}
            />
            <ActivityIcon
              icon={<Settings className="size-5" />}
              label="Settings"
              link="/settings/account"
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-64 bg-sidebar-bg border-r border-border flex flex-col flex-shrink-0 overflow-hidden hidden md:flex">
          <div className="px-4 h-9 flex items-center text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto">{sidebarContent ?? defaultSidebar}</div>
        </aside>

        {/* Editor area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          {tabs.length > 0 && (
            <div className="h-9 bg-titlebar/80 border-b border-border flex items-end overflow-x-auto flex-shrink-0">
              {tabs.map((tab, i) => (
                <Link
                  key={tab.id}
                  to={tab.path as never}
                  className="h-9 px-3 flex items-center gap-2 text-xs border-r border-border bg-tab-inactive [&.active]:bg-tab-active [&.active]:text-foreground text-muted-foreground hover:text-foreground"
                  activeProps={{ className: "active" }}
                >
                  <FileIcon type={tab.icon} />
                  {tab.title}
                  <X className="size-3 opacity-0 hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="h-7 px-4 flex items-center gap-1 text-xs text-muted-foreground border-b border-border flex-shrink-0">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="size-3" />}
                  <span className={i === breadcrumbs.length - 1 ? "text-foreground" : ""}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-editor">{children}</div>

          {/* Terminal panel */}
          {terminalOpen && (
            <div className="h-56 border-t border-border bg-terminal flex flex-col flex-shrink-0">
              <div className="h-8 flex items-center px-3 border-b border-border text-xs">
                <div className="flex gap-4">
                  <span className="text-foreground border-b-2 border-primary pb-1.5 -mb-px">
                    TERMINAL
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    PROBLEMS
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    OUTPUT
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    DEBUG
                  </span>
                </div>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                {terminalContent ?? (
                  <div className="text-muted-foreground">
                    <span className="text-syntax-function">vslearn</span>
                    <span className="text-syntax-keyword"> $ </span>
                    Welcome to your learning terminal. Tip: press{" "}
                    <kbd className="px-1 bg-secondary rounded">Ctrl+K</kbd> for the command palette.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <div className="h-6 bg-statusbar text-white text-[11px] flex items-center px-2 gap-3 flex-shrink-0">
        <span className="flex items-center gap-1">
          <GitBranch className="size-3" /> main
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="size-3" /> 0 <Circle className="size-2.5" /> 0
        </span>
        <button
          onClick={() => setTerminalOpen((t) => !t)}
          className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded"
        >
          <TermIcon className="size-3" /> Terminal
        </button>
        <span className="ml-auto flex items-center gap-3">
          <span>UTF-8</span>
          <span>TypeScript</span>
          <span className="flex items-center gap-1">
            <Wifi className="size-3" /> Connected
          </span>
          <span className="flex items-center gap-1">
            <Check className="size-3" /> VSLearn
          </span>
        </span>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function ActivityIcon({
  icon,
  active,
  onClick,
  label,
  link,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  label: string;
  link?: string;
}) {
  const inner = (
    <button
      onClick={onClick}
      title={label}
      className={`size-12 flex items-center justify-center text-muted-foreground hover:text-foreground relative ${active ? "text-foreground" : ""}`}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-foreground" />}
      {icon}
    </button>
  );
  if (link) return <Link to={link}>{inner}</Link>;
  return inner;
}

function FileIcon({ type }: { type?: string }) {
  const map: Record<string, { ch: string; color: string }> = {
    text: { ch: "MD", color: "#519aba" },
    video: { ch: "▶", color: "#e94f64" },
    quiz: { ch: "?", color: "#dcb67a" },
    coding: { ch: "JS", color: "#f7df1e" },
  };
  const it = map[type ?? "text"] ?? map.text;
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[8px] font-bold flex-shrink-0"
      style={{ color: it.color }}
    >
      {it.ch}
    </span>
  );
}
