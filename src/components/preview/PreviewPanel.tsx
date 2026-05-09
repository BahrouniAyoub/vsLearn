import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { RuntimeErrorDisplay } from "./RuntimeErrorDisplay";
import type { ConsoleMessage, RuntimeError, PreviewMessage } from "./types";
import { buildPreviewDocument, messageId } from "./types";

type PreviewPanelProps = {
  files: { path: string; content: string }[];
  onConsoleMessage?: (message: ConsoleMessage) => void;
  onRuntimeError?: (error: RuntimeError) => void;
  debounceMs?: number;
};

const PREVIEW_BRIDGE_ORIGIN = "null";

export function PreviewPanel({
  files,
  onConsoleMessage,
  onRuntimeError,
  debounceMs = 300,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const urlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filesRef = useRef(files);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentError, setCurrentError] = useState<RuntimeError | null>(null);

  filesRef.current = files;

  const refreshPreview = useCallback(() => {
    const doc = buildPreviewDocument(filesRef.current);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setLoading(true);

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;

    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      refreshPreview();
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [files, debounceMs, refreshPreview]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<PreviewMessage>) {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === "console") {
        const msg: ConsoleMessage = {
          id: messageId(),
          method: data.method,
          args: data.args,
          timestamp: data.timestamp ?? Date.now(),
        };
        onConsoleMessage?.(msg);
      }

      if (data.type === "error") {
        const err: RuntimeError = {
          message: data.message,
          stack: data.stack,
          lineno: data.lineno,
          colno: data.colno,
          source: data.source,
        };
        setCurrentError(err);
        onRuntimeError?.(err);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleMessage, onRuntimeError]);

  function handleIframeLoad() {
    setLoading(false);
  }

  function handleDismissError() {
    setCurrentError(null);
  }

  function handleRefresh() {
    refreshPreview();
  }

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border bg-secondary rounded-md"
      >
        <Eye className="size-3" /> Show preview
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full bg-editor">
      <div className="h-9 bg-titlebar/80 border-b border-border flex items-center px-3 gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-muted-foreground hover:text-foreground"
          title="Hide preview"
        >
          <EyeOff className="size-3.5" />
        </button>
        <span className="text-xs font-mono text-muted-foreground flex-1">
          Preview
          {loading && <span className="ml-2 text-[10px]">refreshing...</span>}
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground"
          title="Refresh preview"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      <div className="flex-1 relative bg-white">
        <RuntimeErrorDisplay error={currentError} onDismiss={handleDismissError} />
        <iframe
          ref={iframeRef}
          title="Preview"
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
