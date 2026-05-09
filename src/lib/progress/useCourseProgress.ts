import { useCallback, useMemo } from "react";
import { useProgress } from "./useProgress";

export function useCourseProgress(courseSlug: string, totalLessons: number) {
  const progress = useProgress();
  const summary = progress.getCourseSummary(courseSlug, totalLessons);

  const isComplete = useCallback(
    (lessonSlug: string) => {
      const lp = progress.getLessonProgress(courseSlug, lessonSlug);
      return lp.status === "completed";
    },
    [progress, courseSlug],
  );

  return {
    isComplete,
    progressPercent: summary.percentComplete,
  };
}
