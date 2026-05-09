import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";
import { getCourseContent } from "@/lib/content";
import { useCourseProgress } from "@/lib/progress";
import { useAuth } from "@/lib/auth";
import {
  Clock,
  Play,
  CheckCircle2,
  Circle,
  Lock,
  FileText,
  Code2,
  HelpCircle,
  Video,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/courses/$id")({
  head: ({ params }) => {
    const c = getCourseContent(params.id);
    return {
      meta: [
        { title: c ? `${c.title} — VSLearn` : "Course not found" },
        { name: "description", content: c?.description ?? "VSLearn course." },
      ],
    };
  },
  component: CourseDetail,
  notFoundComponent: () => <div className="p-8">Course not found.</div>,
});

const levelBadge: Record<string, { label: string; className: string }> = {
  beginner: { label: "Beginner", className: "bg-green-500/10 text-green-400 border-green-500/30" },
  intermediate: {
    label: "Intermediate",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  advanced: { label: "Advanced", className: "bg-red-500/10 text-red-400 border-red-500/30" },
};

function CourseDetail() {
  const { id } = Route.useParams();
  const course = getCourseContent(id);
  if (!course) throw notFound();

  const { user } = useAuth();
  const isAuthed = !!user;
  const allLessons = useMemo(
    () => course.modules.flatMap((m) => m.lessons),
    [course.modules],
  );

  const { isComplete, progressPercent } = useCourseProgress(
    course.slug,
    allLessons.length,
  );

  const totalMinutes = allLessons.reduce((s, l) => s + (l.frontmatter.durationMinutes ?? 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  function isLessonUnlocked(lessonIndex: number) {
    if (lessonIndex === 0) return true;
    const prevLesson = allLessons[lessonIndex - 1];
    if (!prevLesson) return true;
    return isComplete(prevLesson.slug);
  }

  return (
    <VSCodeShell
      tabs={[
        { id: "courses", title: "courses.tsx", path: "/courses", icon: "coding" },
        {
          id: course.slug,
          title: `${course.slug}.md`,
          path: `/courses/${course.slug}`,
          icon: "text",
        },
      ]}
      breadcrumbs={["vslearn", "courses", `${course.slug}.md`]}
    >
      <div className="p-8 max-w-5xl">
        <div className="flex items-start gap-6">
          <div
            className="size-20 rounded-md flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: `${course.color ?? "#888"}25`, color: course.color ?? "#888" }}
          >
            {course.icon ?? "📘"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>{course.category}</span>
              <span>·</span>
              {(() => {
                const badge = levelBadge[course.level] ?? levelBadge.beginner;
                return (
                  <span className={`px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider ${badge.className}`}>
                    {badge.label}
                  </span>
                );
              })()}
            </div>
            <h1 className="text-3xl font-bold mt-1">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-4" />{" "}
                {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="size-4" /> {allLessons.length} lesson
                {allLessons.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                to="/learn/$courseSlug/$lessonSlug"
                params={{
                  courseSlug: course.slug,
                  lessonSlug: allLessons[0]?.slug ?? "",
                }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90"
              >
                <Play className="size-4 fill-current" />{" "}
                {progressPercent > 0 ? "Continue" : "Start course"}
              </Link>
              <button className="border border-border bg-secondary px-5 py-2.5 rounded-md hover:bg-accent text-sm">
                Bookmark
              </button>
            </div>
            {isAuthed && progressPercent > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Your progress</span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="font-mono text-sm text-syntax-comment">// curriculum</div>
          <h2 className="text-2xl font-bold mt-1">Course curriculum</h2>
          <div className="mt-6 space-y-3">
            {course.modules.map((m) => {
              const moduleCompletedCount = m.lessons.filter((l) =>
                isComplete(l.slug),
              ).length;
              return (
                <div key={m.slug} className="border border-border bg-card rounded-md overflow-hidden">
                  <div className="px-5 py-3 bg-secondary border-b border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {m.lessons.length > 0 && moduleCompletedCount === m.lessons.length
                          ? "✅ complete"
                          : `module`}
                      </div>
                      <div className="font-semibold">{m.title}</div>
                      {m.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{m.lessons.length} lessons</div>
                  </div>
                  <div className="divide-y divide-border">
                    {m.lessons.map((l) => {
                      const globalIndex = allLessons.indexOf(l);
                      const unlocked = isLessonUnlocked(globalIndex);
                      const completed = isComplete(l.slug);
                      const fm = l.frontmatter;

                      return (
                        <Link
                          key={l.slug}
                          to="/learn/$courseSlug/$lessonSlug"
                          params={{ courseSlug: course.slug, lessonSlug: l.slug }}
                          className={`px-5 py-3 flex items-center gap-3 ${unlocked ? "hover:bg-accent/20" : "pointer-events-none opacity-60"}`}
                          onClick={(e) => { if (!unlocked) e.preventDefault(); }}
                        >
                          {completed ? (
                            <CheckCircle2 className="size-4 text-green-400 flex-shrink-0" />
                          ) : unlocked ? (
                            <Circle className="size-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Lock className="size-4 text-muted-foreground/30 flex-shrink-0" />
                          )}
                          <LessonIcon type={fm.type} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${!unlocked ? "text-muted-foreground/50" : ""}`}>
                              {fm.title ?? l.slug}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize flex items-center gap-2 mt-0.5">
                              <span>{fm.type}</span>
                              <span>·</span>
                              <span>{fm.durationMinutes} min</span>
                              {fm.summary && (
                                <>
                                  <span>·</span>
                                  <span className="truncate">{fm.summary}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VSCodeShell>
  );
}

function LessonIcon({ type }: { type: string }) {
  const Icon =
    type === "video" ? Video : type === "quiz" ? HelpCircle : type === "coding" ? Code2 : FileText;
  return <Icon className="size-4 text-muted-foreground flex-shrink-0" />;
}
