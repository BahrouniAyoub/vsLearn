import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { WorkspaceData, WorkspaceRecord, CompletionEntry } from "./types";

function client() {
  return getSupabaseBrowserClient();
}

export async function saveWorkspaceToSupabase(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  data: WorkspaceData,
): Promise<boolean> {
  try {
    const record: Partial<WorkspaceRecord> = {
      userId,
      courseSlug,
      lessonSlug,
      files: data.files,
      activeFile: data.activeFile,
      openTabs: data.openTabs,
      completed: data.completed,
      lastOpenedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { error } = await client()
      .from("workspaces")
      .upsert(record, {
        onConflict: "user_id,course_slug,lesson_slug",
        ignoreDuplicates: false,
      });
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function loadWorkspaceFromSupabase(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<WorkspaceData | null> {
  try {
    const { data, error } = await client()
      .from("workspaces")
      .select("files,active_file,open_tabs,completed,updated_at")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      files: (data.files as Record<string, string>) ?? {},
      activeFile: (data.active_file as string | null) ?? null,
      openTabs: (data.open_tabs as string[]) ?? [],
      completed: (data.completed as boolean) ?? false,
      updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function syncCompletionToSupabase(
  userId: string,
  courseSlug: string,
  entries: CompletionEntry[],
): Promise<boolean> {
  try {
    const completedLessons = entries
      .filter((e) => e.courseSlug === courseSlug)
      .map((e) => e.lessonSlug);

    const { error } = await client()
      .from("workspaces")
      .upsert(
        {
          user_id: userId,
          course_slug: courseSlug,
          lesson_slug: "_completion",
          files: {},
          active_file: null,
          open_tabs: [],
          completed: false,
          metadata: { completedLessons },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false },
      );
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function loadCompletionFromSupabase(
  userId: string,
  courseSlug: string,
): Promise<string[] | null> {
  try {
    const { data, error } = await client()
      .from("workspaces")
      .select("metadata")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", "_completion")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const metadata = data.metadata as { completedLessons?: string[] } | null;
    return metadata?.completedLessons ?? null;
  } catch {
    return null;
  }
}

export async function saveLastLessonToSupabase(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
): Promise<boolean> {
  try {
    const { error } = await client()
      .from("workspaces")
      .upsert(
        {
          user_id: userId,
          course_slug: courseSlug,
          lesson_slug: "_last_lesson",
          files: {},
          active_file: null,
          open_tabs: [],
          completed: false,
          metadata: { lessonSlug },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,lesson_slug", ignoreDuplicates: false },
      );
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function loadLastLessonFromSupabase(
  userId: string,
  courseSlug: string,
): Promise<string | null> {
  try {
    const { data, error } = await client()
      .from("workspaces")
      .select("metadata")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .eq("lesson_slug", "_last_lesson")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const metadata = data.metadata as { lessonSlug?: string } | null;
    return metadata?.lessonSlug ?? null;
  } catch {
    return null;
  }
}
