import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";
import { findCourse, courseProgress } from "@/lib/vslearn/data";
import {
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  Circle,
  FileText,
  Code2,
  HelpCircle,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/courses/$id")({
  head: ({ params }) => {
    const c = findCourse(params.id);
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

function CourseDetail() {
  const { id } = Route.useParams();
  const course = findCourse(id);
  if (!course) throw notFound();

  const progress = courseProgress(course.id);
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <VSCodeShell
      tabs={[
        { id: "courses", title: "courses.tsx", path: "/courses", icon: "coding" },
        {
          id: course.id,
          title: `${course.id}.md`,
          path: `/courses/${course.id}`,
          icon: "text",
        },
      ]}
      breadcrumbs={["vslearn", "courses", `${course.id}.md`]}
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
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-4" /> {course.hours} hours
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-4" /> {course.students.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" /> {course.rating}
              </span>
              <span>{totalLessons} lessons</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                to="/learn/$courseSlug/$lessonSlug"
                params={{ courseSlug: course.id, lessonSlug: course.modules[0].lessons[0].id }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90"
              >
                <Play className="size-4 fill-current" />{" "}
                {progress > 0 ? "Continue" : "Start course"}
              </Link>
              <button className="border border-border bg-secondary px-5 py-2.5 rounded-md hover:bg-accent text-sm">
                Bookmark
              </button>
            </div>
            {progress > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Your progress</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="font-mono text-sm text-syntax-comment">// curriculum</div>
          <h2 className="text-2xl font-bold mt-1">What you'll build</h2>
          <div className="mt-6 space-y-3">
            {course.modules.map((m, idx) => (
              <div key={m.id} className="border border-border bg-card rounded-md overflow-hidden">
                <div className="px-5 py-3 bg-secondary border-b border-border flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-muted-foreground">
                      module {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="font-semibold">{m.title}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{m.lessons.length} lessons</div>
                </div>
                <div className="divide-y divide-border">
                  {m.lessons.map((l) => (
                    <Link
                      key={l.id}
                      to="/learn/$courseSlug/$lessonSlug"
                      params={{ courseSlug: course.id, lessonSlug: l.id }}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-accent/20"
                    >
                      <LessonIcon type={l.type} />
                      <div className="flex-1">
                        <div className="text-sm">{l.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {l.type} · {l.duration}
                        </div>
                      </div>
                      {course.id === "js-fundamentals" && ["l1", "l2"].includes(l.id) ? (
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
      </div>
    </VSCodeShell>
  );
}

function LessonIcon({ type }: { type: string }) {
  const Icon =
    type === "video" ? Video : type === "quiz" ? HelpCircle : type === "coding" ? Code2 : FileText;
  return <Icon className="size-4 text-muted-foreground" />;
}
