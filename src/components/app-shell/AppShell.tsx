import { useEffect, useState } from "react";
import { Bell, ChevronRight, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth";
import { CommandPalette } from "@/components/vscode/CommandPalette";
import { mockUser } from "@/lib/vslearn/data";
import { BottomPanel } from "./BottomPanel";
import { ExplorerPanel, ExplorerToggle } from "./ExplorerPanel";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { WorkspaceTabs } from "./WorkspaceTabs";
import type { WorkspaceTab } from "./types";

export function AppShell({
  children,
  tabs = [],
  breadcrumbs = [],
  terminalContent,
  testPanelContent,
  explorerContent,
}: {
  children: React.ReactNode;
  tabs?: WorkspaceTab[];
  breadcrumbs?: string[];
  terminalContent?: React.ReactNode;
  testPanelContent?: React.ReactNode;
  explorerContent?: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [activityView, setActivityView] = useState<"explorer" | "search" | "courses" | "profile">(
    "explorer",
  );
  const { user } = useAuth();
  const initials = (user?.email ?? mockUser.email).slice(0, 2).toUpperCase();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "`") {
        event.preventDefault();
        setTerminalOpen((value) => !value);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setExplorerCollapsed((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-9 bg-titlebar border-b border-border flex items-center px-3 text-xs select-none flex-shrink-0">
        <div className="flex gap-1.5 mr-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <Link to="/dashboard" className="font-semibold tracking-tight mr-4">
          VS<span className="text-primary">Learn</span>
        </Link>
        <div className="hidden md:flex gap-3 text-muted-foreground">
          {["File", "Edit", "View", "Go", "Run", "Help"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mx-auto bg-secondary border border-border rounded px-3 py-1 text-xs text-muted-foreground hover:bg-accent/40 hidden md:flex items-center gap-2 min-w-[260px] justify-center"
        >
          <Search className="size-3" /> Search courses, lessons, commands...
          <kbd className="ml-2 px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
            Ctrl K
          </kbd>
        </button>
        <div className="ml-auto flex items-center gap-3 text-muted-foreground">
          <Bell className="size-3.5" />
          <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
            {initials}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar activeView={activityView} onViewChange={setActivityView} authenticated={!!user} />
        <ExplorerPanel
          collapsed={explorerCollapsed}
          onToggle={() => setExplorerCollapsed((value) => !value)}
        >
          {explorerContent}
        </ExplorerPanel>
        <ExplorerToggle
          collapsed={explorerCollapsed}
          onToggle={() => setExplorerCollapsed((value) => !value)}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <WorkspaceTabs tabs={tabs} />
          {breadcrumbs.length > 0 && (
            <div className="h-7 px-4 flex items-center gap-1 text-xs text-muted-foreground border-b border-border flex-shrink-0 overflow-x-auto whitespace-nowrap">
              {breadcrumbs.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="size-3" />}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground" : ""}>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto bg-editor">{children}</div>
          <BottomPanel
            open={terminalOpen}
            onClose={() => setTerminalOpen(false)}
            tabs={testPanelContent ? [
              { id: "terminal", label: "TERMINAL", content: terminalContent },
              { id: "tests", label: "TESTS", content: testPanelContent },
            ] : undefined}
            defaultTab={testPanelContent ? "tests" : "terminal"}
          >
            {terminalContent}
          </BottomPanel>
        </main>
      </div>

      <StatusBar onToggleTerminal={() => setTerminalOpen((value) => !value)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
