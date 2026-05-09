export type WorkspaceData = {
  files: Record<string, string>;
  activeFile: string | null;
  openTabs: string[];
  completed: boolean;
  updatedAt: string;
};

export type WorkspaceRecord = {
  id?: string;
  userId: string;
  courseSlug: string;
  lessonSlug: string;
  files: Record<string, string>;
  activeFile: string | null;
  openTabs: string[];
  completed: boolean;
  lastOpenedAt?: string;
  updatedAt?: string;
};

export type CompletionEntry = {
  courseSlug: string;
  lessonSlug: string;
  completedAt: string;
};

export function emptyWorkspace(): WorkspaceData {
  return {
    files: {},
    activeFile: null,
    openTabs: [],
    completed: false,
    updatedAt: new Date().toISOString(),
  };
}

export function nowISO(): string {
  return new Date().toISOString();
}
