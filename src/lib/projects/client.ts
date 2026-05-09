import type { ProjectSubmission } from "./types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type ProjectRecord = {
  id?: string;
  user_id: string;
  course_slug: string;
  course_title: string;
  lesson_slug: string;
  lesson_title: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  files: { path: string; content: string; language: string }[];
  repo_url: string | null;
  demo_url: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  test_results: { passed: number; failed: number; total: number; details: { name: string; passed: boolean; message?: string }[] } | null;
  reviewer_notes: string | null;
};

function toRecord(userId: string, p: ProjectSubmission): ProjectRecord {
  return {
    user_id: userId,
    course_slug: p.courseSlug,
    course_title: p.courseTitle,
    lesson_slug: p.lessonSlug,
    lesson_title: p.lessonTitle,
    slug: p.slug,
    title: p.title,
    description: p.description,
    status: p.status,
    files: p.files,
    repo_url: p.repoUrl,
    demo_url: p.demoUrl,
    thumbnail_url: p.thumbnailUrl,
    is_published: p.isPublished,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    submitted_at: p.submittedAt,
    test_results: p.testResults,
    reviewer_notes: p.reviewerNotes,
  };
}

function fromRecord(r: ProjectRecord): ProjectSubmission {
  return {
    id: r.id ?? "",
    userId: r.user_id,
    username: "",
    courseSlug: r.course_slug,
    courseTitle: r.course_title,
    lessonSlug: r.lesson_slug,
    lessonTitle: r.lesson_title,
    slug: r.slug,
    title: r.title,
    description: r.description,
    status: r.status as ProjectSubmission["status"],
    files: r.files,
    repoUrl: r.repo_url,
    demoUrl: r.demo_url,
    thumbnailUrl: r.thumbnail_url,
    isPublished: r.is_published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    submittedAt: r.submitted_at,
    testResults: r.test_results,
    reviewerNotes: r.reviewer_notes,
  };
}

export async function syncProjectToSupabase(userId: string, project: ProjectSubmission) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const record = toRecord(userId, project);
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", project.slug)
      .maybeSingle();
    if (existing) {
      await supabase.from("projects").update(record).eq("id", existing.id);
    } else {
      await supabase.from("projects").insert(record);
    }
  } catch {}
}

export async function loadProjectsFromSupabase(userId: string): Promise<ProjectSubmission[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map(fromRecord);
  } catch {
    return [];
  }
}

export async function fetchPublishedProjectsFromSupabase(): Promise<ProjectSubmission[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .in("status", ["passed", "submitted"])
      .order("created_at", { ascending: false });
    return (data ?? []).map(fromRecord);
  } catch {
    return [];
  }
}
