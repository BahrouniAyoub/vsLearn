import { AlertTriangle, X } from "lucide-react";
import type { RuntimeError } from "./types";

type RuntimeErrorDisplayProps = {
  error: RuntimeError | null;
  onDismiss?: () => void;
};

export function RuntimeErrorDisplay({ error, onDismiss }: RuntimeErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center pt-8 bg-background/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-card border border-destructive/50 rounded-md shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/30">
          <AlertTriangle className="size-4 text-destructive flex-shrink-0" />
          <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
            Runtime Error
          </span>
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="p-4 font-mono text-sm space-y-2">
          <div className="text-destructive font-medium break-words">
            {error.message}
          </div>
          {error.lineno != null && (
            <div className="text-xs text-muted-foreground">
              Line {error.lineno}
              {error.colno != null ? `, column ${error.colno}` : ""}
              {error.source ? ` in ${error.source.split("/").pop()}` : ""}
            </div>
          )}
          {error.stack && (
            <details className="mt-2" open>
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Stack trace
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto bg-editor border border-border rounded p-3">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
