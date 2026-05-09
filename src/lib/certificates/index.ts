export type { Certificate, CertificateStatus, CertificateRequirements } from "./types";
export {
  generateCertificateNumber,
  generateVerificationSlug,
  getCourseRequirements,
  checkCourseCompleted,
  getCompletedLessonSlugs,
  issueCertificate,
  getUserCertificates,
  getCertificateForCourse,
  verifyCertificateBySlug,
  loadRemoteCertificates,
} from "./service";
export { useCertificates } from "./useCertificates";
export type { UseCertificatesResult } from "./useCertificates";
