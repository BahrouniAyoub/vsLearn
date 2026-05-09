import { getSupabaseBrowserClient } from "@/lib/supabase";

import type { CertificateRecord, ProfileRecord, ProgressRecord, ProjectRecord } from "./types";

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getOwnProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRecord>();

  if (error) throw error;
  return data;
}

export async function getPublicProfile(username: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", normalizeUsername(username))
    .eq("visibility", "public")
    .maybeSingle<ProfileRecord>();

  if (error) throw error;
  return data;
}

export async function getProfileStats(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const [progressResult, certificatesResult, projectsResult] = await Promise.all([
    supabase
      .from("progress")
      .select(
        "id,status,percent_complete,completed_at,last_accessed_at,courses(title,slug),lessons(title,slug)",
      )
      .eq("user_id", userId),
    supabase
      .from("certificates")
      .select("id,course_id,certificate_number,verification_code,issued_at,courses(title,slug)")
      .eq("user_id", userId)
      .eq("status", "issued"),
    supabase
      .from("projects")
      .select(
        "id,slug,title,description,repository_url,demo_url,thumbnail_url,is_featured,created_at",
      )
      .eq("user_id", userId)
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
  ]);

  if (progressResult.error) throw progressResult.error;
  if (certificatesResult.error) throw certificatesResult.error;
  if (projectsResult.error) throw projectsResult.error;

  const progress = (progressResult.data ?? []) as ProgressRecord[];
  const certificates = (certificatesResult.data ?? []) as CertificateRecord[];
  const projects = (projectsResult.data ?? []) as ProjectRecord[];

  return {
    progress,
    certificates,
    projects,
    completedLessons: progress.filter((item) => item.status === "completed").length,
    activeCourses: new Set(progress.map((item) => item.courses?.slug).filter(Boolean)).size,
  };
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = getSupabaseBrowserClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/avatar.${extension}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
