import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Circle, Code2, FileText, HelpCircle, Play, Video } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { courseProgress, findCourse } from "@/lib/vslearn/data";

export const Route = createFileRoute("/learn/$courseSlug")({
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    return {
      meta: [
        { title: course ? `${course.title} - Learn` : "Course not found" },
        { name: "description", content: course?.description ?? "VSLearn course." },
      ],
    };
  },
  component: LearnCourseRoute,
});

function LearnCourseRoute() {
  return (
    <ProtectedRoute>
      <LearnCourse />
    </ProtectedRoute>
  );
}

function LearnCourse() {
  const { courseSlug } = Route.useParams();
  const course = findCourse(courseSlug);
  if (!course) throw notFound();
  const progress = courseProgress(course.id);

  return (
    <AppShell
      tabs={[
        { id: "learn", title: "learn.tsx", path: "/learn", icon: "coding" },
        { id: course.id, title: `${course.id}.md`, path: `/learn/${course.id}`, icon: "text" },
      ]}
      breadcrumbs={["vslearn", "learn", course.title]}
    >
      <div className="p-8 max-w-5xl">
        <div className="flex items-start gap-6">
          <div
            className="size-20 rounded-md flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: `${course.color}25`, color: course.color }}
          >
            {course.icon}
          </div>
          <div className="flex-1">
            <div className="text-xs font-mono text-muted-foreground">
              {course.category} · {course.level}
            </div>
            <h1 className="text-3xl font-bold mt-1">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/learn/$courseSlug/$lessonSlug"
                params={{
                  courseSlug: course.id,
                  lessonSlug: course.modules[0]?.lessons[0]?.id ?? "l1",
                }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90"
              >
                <Play className="size-4 fill-current" />{" "}
                {progress > 0 ? "Continue" : "Start course"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-3">
          {course.modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="border border-border bg-card rounded-md overflow-hidden"
            >
              <div className="px-5 py-3 bg-secondary border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">
                    module {String(moduleIndex + 1).padStart(2, "0")}
                  </div>
                  <div className="font-semibold">{module.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">{module.lessons.length} lessons</div>
              </div>
              <div className="divide-y divide-border">
                {module.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to="/learn/$courseSlug/$lessonSlug"
                    params={{ courseSlug: course.id, lessonSlug: lesson.id }}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-accent/20"
                  >
                    <LessonIcon type={lesson.type} />
                    <div className="flex-1">
                      <div className="text-sm">{lesson.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {lesson.type} · {lesson.duration}
                      </div>
                    </div>
                    {course.id === "js-fundamentals" && ["l1", "l2"].includes(lesson.id) ? (
                      <CheckCircle2 className="size-4 text-green-400" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function LessonIcon({ type }: { type: string }) {
  const Icon =
    type === "video" ? Video : type === "quiz" ? HelpCircle : type === "coding" ? Code2 : FileText;
  return <Icon className="size-4 text-muted-foreground" />;
}
