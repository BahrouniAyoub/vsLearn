import type { Certificate } from "./types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type CertificateRecord = {
  id?: string;
  user_id: string;
  course_slug: string;
  course_title: string;
  certificate_number: string;
  verification_slug: string;
  status: string;
  issued_at: string;
  completed_lessons: number;
  total_lessons: number;
  project_lessons: { slug: string; title: string }[];
};

function toRecord(userId: string, c: Certificate): CertificateRecord {
  return {
    user_id: userId,
    course_slug: c.courseSlug,
    course_title: c.courseTitle,
    certificate_number: c.certificateNumber,
    verification_slug: c.verificationSlug,
    status: c.status,
    issued_at: c.issuedAt,
    completed_lessons: c.completedLessons,
    total_lessons: c.totalLessons,
    project_lessons: c.projectLessons,
  };
}

function fromRecord(r: CertificateRecord): Certificate {
  return {
    id: r.id ?? "",
    userId: r.user_id,
    courseSlug: r.course_slug,
    courseTitle: r.course_title,
    certificateNumber: r.certificate_number,
    verificationSlug: r.verification_slug,
    status: r.status as Certificate["status"],
    issuedAt: r.issued_at,
    completedLessons: r.completed_lessons,
    totalLessons: r.total_lessons,
    projectLessons: r.project_lessons,
    username: "",
  };
}

export async function syncCertificateToSupabase(userId: string, certificate: Certificate) {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const record = toRecord(userId, certificate);

    const { data: existing } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", certificate.courseSlug)
      .maybeSingle();

    if (existing) {
      await supabase.from("certificates").update(record).eq("id", existing.id);
    } else {
      await supabase.from("certificates").insert(record);
    }
  } catch {}
}

export async function loadCertificatesFromSupabase(userId: string): Promise<Certificate[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return [];

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId);

    return (data ?? []).map(fromRecord);
  } catch {
    return [];
  }
}
