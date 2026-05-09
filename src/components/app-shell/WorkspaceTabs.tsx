import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import type { WorkspaceTab } from "./types";

export function WorkspaceTabs({ tabs }: { tabs: WorkspaceTab[] }) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-titlebar/80 border-b border-border flex items-end overflow-x-auto flex-shrink-0">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.path as never}
          className="h-9 px-3 flex items-center gap-2 text-xs border-r border-border bg-tab-inactive [&.active]:bg-tab-active [&.active]:text-foreground text-muted-foreground hover:text-foreground whitespace-nowrap"
          activeProps={{ className: "active" }}
        >
          <FileIcon type={tab.icon} />
          {tab.title}
          <X className="size-3 opacity-0 group-hover:opacity-100" />
        </Link>
      ))}
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
