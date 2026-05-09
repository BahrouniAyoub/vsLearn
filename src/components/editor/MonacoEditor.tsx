import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { inferLanguage } from "./types";

type MonacoEditorProps = {
  path: string;
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  options?: editor.IStandaloneEditorConstructionOptions;
};

export function MonacoEditor({
  path,
  value,
  onChange,
  language,
  options = {},
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isDark = document.documentElement.classList.contains("dark");

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    return () => {
      editorRef.current = null;
    };
  }, []);

  return (
    <Editor
      key={path}
      path={path}
      defaultLanguage={language ?? inferLanguage(path)}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      theme={isDark ? "vs-dark" : "vs-light"}
      options={{
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
        lineNumbers: "on",
        minimap: { enabled: true, scale: 1 },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        renderWhitespace: "selection",
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 12, bottom: 12 },
        ...options,
      }}
      loading={
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono">
          Loading editor...
        </div>
      }
      onMount={handleMount}
    />
  );
}
