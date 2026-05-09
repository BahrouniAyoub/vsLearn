import { useRef, useEffect } from "react";
import {
  TerminalSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  Trash2,
} from "lucide-react";
import type { ConsoleMessage } from "./types";

const ICON_MAP: Record<string, { icon: typeof TerminalSquare; className: string }> = {
  log: { icon: TerminalSquare, className: "text-syntax-function" },
  info: { icon: Info, className: "text-syntax-keyword" },
  warn: { icon: AlertTriangle, className: "text-yellow-400" },
  error: { icon: AlertCircle, className: "text-destructive" },
  debug: { icon: Bug, className: "text-muted-foreground" },
};

type ConsolePanelProps = {
  messages: ConsoleMessage[];
  onClear?: () => void;
};

export function ConsolePanel({ messages, onClear }: ConsolePanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 flex items-center px-3 border-b border-border text-xs flex-shrink-0">
        <span className="text-foreground border-b-2 border-primary pb-1.5 -mb-px">
          CONSOLE
        </span>
        <span className="ml-2 text-muted-foreground text-[10px]">
          ({messages.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px]"
          title="Clear console"
        >
          <Trash2 className="size-3" /> Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
        {messages.length === 0 && (
          <div className="text-muted-foreground italic p-2">
            Console output will appear here...
          </div>
        )}
        {messages.map((msg) => {
          const meta = ICON_MAP[msg.method] ?? ICON_MAP.log;
          const Icon = meta.icon;
          return (
            <div
              key={msg.id}
              className="flex items-start gap-2 px-2 py-1 rounded hover:bg-accent/20"
            >
              <Icon className={`size-3.5 mt-0.5 flex-shrink-0 ${meta.className}`} />
              <div className="flex-1 min-w-0">
                {msg.args.map((arg, i) => (
                  <pre
                    key={i}
                    className={`whitespace-pre-wrap break-words ${
                      msg.method === "error"
                        ? "text-destructive"
                        : msg.method === "warn"
                          ? "text-yellow-400"
                          : "text-foreground/90"
                    }`}
                  >
                    {i > 0 ? "  " : ""}{arg}
                  </pre>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
