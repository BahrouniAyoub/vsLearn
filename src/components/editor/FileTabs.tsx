import { X } from "lucide-react";
import { fileIcon, fileColor } from "./types";

export type FileTab = {
  path: string;
  isModified: boolean;
};

type FileTabsProps = {
  tabs: FileTab[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

export function FileTabs({ tabs, activePath, onSelect, onClose }: FileTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-9 bg-titlebar/80 border-b border-border flex items-end overflow-x-auto flex-shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.path === activePath;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => onSelect(tab.path)}
            className={`h-9 px-3 flex items-center gap-2 text-xs border-r border-border whitespace-nowrap
              ${isActive ? "bg-tab-active text-foreground" : "bg-tab-inactive text-muted-foreground hover:text-foreground"}`}
          >
            <span
              className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[8px] font-bold flex-shrink-0"
              style={{ color: fileColor(tab.path) }}
            >
              {fileIcon(tab.path)}
            </span>
            <span>{tab.path.split("/").pop() ?? tab.path}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.path);
              }}
              className="ml-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
            >
              <X className="size-3" />
            </button>
          </button>
        );
      })}
    </div>
  );
}
