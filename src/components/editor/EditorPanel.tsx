import { useState, useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { RotateCcw, Play } from "lucide-react";
import { MonacoEditor } from "./MonacoEditor";
import { FileTabs } from "./FileTabs";
import { FileExplorer } from "./FileExplorer";
import type { EditorFile } from "./types";

export type EditorPanelHandle = {
  resetFiles: () => void;
  getFiles: () => EditorFile[];
};

type EditorPanelProps = {
  files: EditorFile[];
  starterFiles: EditorFile[];
  onFilesChange?: (files: EditorFile[]) => void;
  onRun?: (files: EditorFile[]) => void;
  readOnly?: boolean;
  storageKey?: string;
};

const STORAGE_PREFIX = "vslearn_editor_";

function loadSaved(path: string): string | null {
  try {
    return localStorage.getItem(path);
  } catch {
    return null;
  }
}

function saveContent(path: string, content: string) {
  try {
    localStorage.setItem(path, content);
  } catch {
    // storage full or unavailable
  }
}

function removeSaved(path: string) {
  try {
    localStorage.removeItem(path);
  } catch {
    // ignore
  }
}

export const EditorPanel = forwardRef<EditorPanelHandle, EditorPanelProps>(
  function EditorPanel({ files: initialFiles, starterFiles, onFilesChange, onRun, readOnly = false, storageKey }, ref) {
    const autoSaveKey = storageKey
      ? `${STORAGE_PREFIX}${storageKey}`
      : null;

    const [fileStates, setFileStates] = useState<EditorFile[]>(() => {
      return initialFiles.map((f) => ({
        ...f,
        content: autoSaveKey ? loadSaved(`${autoSaveKey}:${f.path}`) ?? f.content : f.content,
      }));
    });

    const [activePath, setActivePath] = useState<string | null>(
      () => initialFiles[0]?.path ?? null,
    );
    const [openTabs, setOpenTabs] = useState<string[]>(
      () => initialFiles.map((f) => f.path),
    );

    const initialRef = useRef(initialFiles);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      initialRef.current = initialFiles;
    }, [initialFiles]);

    const activeFile = fileStates.find((f) => f.path === activePath) ?? null;

    const updateFile = useCallback(
      (path: string, content: string) => {
        setFileStates((prev) => {
          const next = prev.map((f) => (f.path === path ? { ...f, content } : f));
          onFilesChange?.(next);
          return next;
        });

        if (autoSaveKey) {
          if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = setTimeout(() => {
            saveContent(`${autoSaveKey}:${path}`, content);
          }, 500);
        }
      },
      [autoSaveKey, onFilesChange],
    );

    const openFile = useCallback(
      (path: string) => {
        setActivePath(path);
        setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
      },
      [],
    );

    const closeFile = useCallback(
      (path: string) => {
        setOpenTabs((prev) => {
          const next = prev.filter((p) => p !== path);
          if (activePath === path) {
            const idx = prev.indexOf(path);
            setActivePath(next[Math.min(idx, next.length - 1)] ?? null);
          }
          return next;
        });
      },
      [activePath],
    );

    const resetFiles = useCallback(() => {
      const reset = starterFiles.map((f) => ({ ...f }));
      setFileStates(reset);
      if (autoSaveKey) {
        for (const f of starterFiles) {
          saveContent(`${autoSaveKey}:${f.path}`, f.content);
        }
      }
      onFilesChange?.(reset);
    }, [starterFiles, autoSaveKey, onFilesChange]);

    const getFiles = useCallback(() => fileStates, [fileStates]);

    useImperativeHandle(ref, () => ({ resetFiles, getFiles }), [resetFiles, getFiles]);

    const handleRun = useCallback(() => {
      onRun?.(fileStates);
    }, [onRun, fileStates]);

    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          if (autoSaveKey) {
            for (const f of fileStates) {
              saveContent(`${autoSaveKey}:${f.path}`, f.content);
            }
          }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          handleRun();
        }
      }
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fileStates, autoSaveKey, handleRun]);

    const tabs = openTabs.map((path) => ({
      path,
      isModified: false,
    }));

    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-1 min-h-0">
          <div className="w-52 bg-sidebar-bg border-r border-border flex flex-col flex-shrink-0 overflow-y-auto hidden md:flex">
            <FileExplorer
              files={fileStates}
              activePath={activePath}
              onSelect={openFile}
            />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <FileTabs
              tabs={tabs}
              activePath={activePath}
              onSelect={openFile}
              onClose={closeFile}
            />
            <div className="flex-1 relative">
              {activeFile ? (
                <MonacoEditor
                  key={activeFile.path}
                  path={activeFile.path}
                  value={activeFile.content}
                  language={activeFile.language}
                  onChange={(v) => updateFile(activeFile.path, v)}
                  options={{ readOnly }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
                  No file selected
                </div>
              )}
            </div>
            <div className="h-9 border-t border-border bg-sidebar-bg flex items-center px-3 gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={resetFiles}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border bg-secondary rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Reset to starter files"
              >
                <RotateCcw className="size-3" /> Reset
              </button>
              {onRun && (
                <button
                  type="button"
                  onClick={handleRun}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                  title="Run code (Ctrl+Enter)"
                >
                  <Play className="size-3 fill-current" /> Run
                </button>
              )}
              <div className="ml-auto text-[10px] text-muted-foreground font-mono">
                {activeFile?.path ?? "No file"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
