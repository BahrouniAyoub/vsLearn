import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Certificate } from "./types";
import {
  getUserCertificates,
  getCertificateForCourse,
  issueCertificate,
  getCompletedLessonSlugs,
  loadRemoteCertificates,
} from "./service";
import { useProgress } from "@/lib/progress";

export type UseCertificatesResult = {
  certificates: Certificate[];
  isLoading: boolean;
  getCertificateForCourse: (courseSlug: string) => Certificate | null;
  issueCertificateForCourse: (
    courseSlug: string,
    courseTitle: string,
    allLessonSlugs: string[],
  ) => Certificate | null;
};

export function useCertificates(): UseCertificatesResult {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "user";
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(false);
  const progress = useProgress();

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const local = getUserCertificates(userId);
    setCertificates(local);

    if (userId !== "guest") {
      loadRemoteCertificates(userId).then((remote) => {
        setCertificates((prev) => {
          const merged = [...prev];
          for (const r of remote) {
            if (!merged.find((c) => c.courseSlug === r.courseSlug)) {
              merged.push(r);
            }
          }
          return merged;
        });
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [userId]);

  const getCertForCourse = useCallback(
    (courseSlug: string) => getCertificateForCourse(userId, courseSlug),
    [userId],
  );

  const issueForCourse = useCallback(
    (courseSlug: string, courseTitle: string, allLessonSlugs: string[]) => {
      const existing = getCertificateForCourse(userId, courseSlug);
      if (existing && existing.status === "issued") return existing;

      const completedSlugs = getCompletedLessonSlugs(
        progress.getLessonProgress,
        courseSlug,
        allLessonSlugs.length,
        allLessonSlugs,
      );

      if (completedSlugs.length !== allLessonSlugs.length) return null;

      const cert = issueCertificate(
        userId,
        username,
        courseSlug,
        courseTitle,
        completedSlugs,
        allLessonSlugs,
      );

      setCertificates((prev) => [...prev, cert]);
      return cert;
    },
    [userId, username, progress.getLessonProgress],
  );

  return {
    certificates,
    isLoading: !loaded,
    getCertificateForCourse: getCertForCourse,
    issueCertificateForCourse: issueForCourse,
  };
}
