import { AlertCircle, Check, Circle, GitBranch, Terminal, Wifi } from "lucide-react";

export function StatusBar({ onToggleTerminal }: { onToggleTerminal: () => void }) {
  return (
    <footer className="h-6 bg-statusbar text-white text-[11px] flex items-center px-2 gap-3 flex-shrink-0 overflow-hidden">
      <span className="flex items-center gap-1">
        <GitBranch className="size-3" /> main
      </span>
      <span className="flex items-center gap-1">
        <AlertCircle className="size-3" /> 0 <Circle className="size-2.5" /> 0
      </span>
      <button
        type="button"
        onClick={onToggleTerminal}
        className="flex items-center gap-1 hover:bg-white/10 px-1.5 rounded"
      >
        <Terminal className="size-3" /> Terminal
      </button>
      <span className="ml-auto hidden sm:flex items-center gap-3">
        <span>UTF-8</span>
        <span>TypeScript</span>
        <span className="flex items-center gap-1">
          <Wifi className="size-3" /> Connected
        </span>
        <span className="flex items-center gap-1">
          <Check className="size-3" /> VSLearn
        </span>
      </span>
    </footer>
  );
}
