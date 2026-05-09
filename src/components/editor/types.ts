export type EditorFile = {
  path: string;
  content: string;
  language: string;
};

export const LANGUAGE_MAP: Record<string, string> = {
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  svg: "xml",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  bash: "shell",
  py: "python",
  rs: "rust",
  go: "go",
};

export function extname(path: string) {
  const i = path.lastIndexOf(".");
  return i === -1 ? "" : path.slice(i + 1).toLowerCase();
}

export function inferLanguage(path: string) {
  return LANGUAGE_MAP[extname(path)] ?? "plaintext";
}

export function fileIcon(path: string) {
  const ext = extname(path);
  const map: Record<string, string> = {
    html: "🌐",
    css: "🎨",
    js: "⚡",
    jsx: "⚛",
    ts: "TS",
    tsx: "TS",
    json: "{ }",
    md: "MD",
    mdx: "MDX",
    svg: "🖼",
    xml: "XML",
    yaml: "YML",
  };
  return map[ext] ?? "📄";
}

export function fileColor(path: string) {
  const ext = extname(path);
  const map: Record<string, string> = {
    html: "#e34f26",
    css: "#1572b6",
    js: "#f7df1e",
    jsx: "#61dafb",
    ts: "#3178c6",
    tsx: "#3178c6",
    json: "#8bc34a",
    md: "#519aba",
  };
  return map[ext] ?? "#888";
}
