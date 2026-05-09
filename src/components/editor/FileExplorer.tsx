import { ChevronRight, ChevronDown, File } from "lucide-react";
import { fileIcon, fileColor } from "./types";

type FileExplorerProps = {
  files: { path: string }[];
  activePath: string | null;
  onSelect: (path: string) => void;
};

export function FileExplorer({ files, activePath, onSelect }: FileExplorerProps) {
  const folders = new Map<string, string[]>();
  const rootFiles: string[] = [];

  for (const f of files) {
    const parts = f.path.split("/");
    if (parts.length === 1) {
      rootFiles.push(f.path);
    } else {
      const dir = parts[0];
      if (!folders.has(dir)) folders.set(dir, []);
      folders.get(dir)!.push(f.path);
    }
  }

  return (
    <div className="text-[13px] select-none">
      <div className="px-4 h-9 flex items-center text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
        Files
      </div>
      <div className="py-1">
        {rootFiles.map((path) => (
          <FileRow
            key={path}
            path={path}
            isActive={path === activePath}
            depth={0}
            onSelect={onSelect}
          />
        ))}
        {Array.from(folders.entries()).map(([dir, paths]) => (
          <FolderRow key={dir} name={dir} files={paths} activePath={activePath} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function FileRow({
  path,
  isActive,
  depth,
  onSelect,
}: {
  path: string;
  isActive: boolean;
  depth: number;
  onSelect: (path: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(path)}
      className={`w-full flex items-center gap-1.5 px-4 py-1 text-left hover:bg-accent/30 ${isActive ? "bg-accent/50 text-foreground" : ""}`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-sm text-[8px] font-bold flex-shrink-0"
        style={{ color: fileColor(path) }}
      >
        {fileIcon(path)}
      </span>
      <span className="truncate">{path.split("/").pop()}</span>
    </button>
  );
}

function FolderRow({
  name,
  files,
  activePath,
  onSelect,
}: {
  name: string;
  files: string[];
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 px-2 py-1 text-muted-foreground">
        <ChevronDown className="size-3" />
        <File className="size-3.5" />
        <span>{name}</span>
      </div>
      {files.map((path) => (
        <FileRow
          key={path}
          path={path}
          isActive={path === activePath}
          depth={1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
