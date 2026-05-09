import type { Certificate, CertificateRequirements } from "./types";
import {
  getCertificateByCourse,
  saveCertificate,
  getCertificates,
  lookupCertificateBySlug,
} from "./local";
import { syncCertificateToSupabase, loadCertificatesFromSupabase } from "./client";
import { getCourseContent } from "@/lib/content";

function generateUuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function hexFromUuid(uuid: string): string {
  return uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function generateCertificateNumber(): string {
  const raw = generateUuid();
  const part = hexFromUuid(raw);
  return `CERT-${part.slice(0, 4)}-${part.slice(4, 8)}`;
}

export function generateVerificationSlug(): string {
  const raw = generateUuid();
  const hex = hexFromUuid(raw);
  const b32 = parseInt(hex, 16).toString(36).toUpperCase();
  return `${b32.slice(0, 4)}-${b32.slice(4, 8)}-${b32.slice(8, 12)}`;
}

export function getCourseRequirements(
  courseSlug: string,
  completedLessonSlugs: string[],
): CertificateRequirements | null {
  const content = getCourseContent(courseSlug);
  if (!content) return null;

  const allLessons = content.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completed = allLessons.filter((l) => completedLessonSlugs.includes(l.slug));
  const completedProjectLessons = allLessons
    .filter((l) => l.frontmatter.type === "project" && completedLessonSlugs.includes(l.slug))
    .map((l) => ({ slug: l.slug, title: l.frontmatter.title }));

  return {
    courseSlug,
    courseTitle: content.title,
    totalLessons,
    completedLessons: completed.length,
    percentComplete: totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0,
    allLessonsCompleted: completed.length === totalLessons && totalLessons > 0,
    completedProjectLessons,
  };
}

export function checkCourseCompleted(courseSlug: string, completedLessonSlugs: string[]): boolean {
  const req = getCourseRequirements(courseSlug, completedLessonSlugs);
  return req?.allLessonsCompleted ?? false;
}

export function getCompletedLessonSlugs(
  getLessonProgress: (courseSlug: string, lessonSlug: string) => { status: string },
  courseSlug: string,
  totalLessons: number,
  allLessonSlugs: string[],
): string[] {
  return allLessonSlugs.filter((slug) => {
    const lp = getLessonProgress(courseSlug, slug);
    return lp.status === "completed";
  });
}

export function issueCertificate(
  userId: string,
  username: string,
  courseSlug: string,
  courseTitle: string,
  completedLessonSlugs: string[],
  allLessonSlugs: string[],
): Certificate {
  const content = getCourseContent(courseSlug);
  const allLessons = content
    ? content.modules.flatMap((m) => m.lessons)
    : [];

  const projectLessons = allLessons
    .filter((l) => l.frontmatter.type === "project" && completedLessonSlugs.includes(l.slug))
    .map((l) => ({ slug: l.slug, title: l.frontmatter.title }));

  const existing = getCertificateByCourse(userId, courseSlug);
  if (existing && existing.status === "issued") {
    return existing;
  }

  const certificate: Certificate = {
    id: generateUuid(),
    userId,
    username,
    courseSlug,
    courseTitle,
    certificateNumber: generateCertificateNumber(),
    verificationSlug: generateVerificationSlug(),
    status: "issued",
    issuedAt: new Date().toISOString(),
    completedLessons: completedLessonSlugs.length,
    totalLessons: allLessonSlugs.length,
    projectLessons,
  };

  saveCertificate(userId, certificate);

  if (userId !== "guest") {
    syncCertificateToSupabase(userId, certificate);
  }

  return certificate;
}

export function getUserCertificates(userId: string): Certificate[] {
  return getCertificates(userId);
}

export function getCertificateForCourse(userId: string, courseSlug: string): Certificate | null {
  return getCertificateByCourse(userId, courseSlug);
}

export function verifyCertificateBySlug(verificationSlug: string): Certificate | null {
  return lookupCertificateBySlug(verificationSlug);
}

export async function loadRemoteCertificates(userId: string): Promise<Certificate[]> {
  return loadCertificatesFromSupabase(userId);
}
