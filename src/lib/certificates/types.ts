export type CertificateStatus = "issued" | "revoked";

export type Certificate = {
  id: string;
  userId: string;
  username: string;
  courseSlug: string;
  courseTitle: string;
  certificateNumber: string;
  verificationSlug: string;
  status: CertificateStatus;
  issuedAt: string;
  completedLessons: number;
  totalLessons: number;
  projectLessons: { slug: string; title: string }[];
};

export type CertificateRequirements = {
  courseSlug: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentComplete: number;
  allLessonsCompleted: boolean;
  completedProjectLessons: { slug: string; title: string }[];
};

export const CERT_PREFIX = "vslearn_cert_v2";

export function storageKey(prefix: string, userId: string, ...parts: string[]): string {
  return [prefix, userId, ...parts].join("_");
}

export function nowISO(): string {
  return new Date().toISOString();
}
