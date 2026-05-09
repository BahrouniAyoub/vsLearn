import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Star, Users } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { courses } from "@/lib/vslearn/data";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn - VSLearn" },
      { name: "description", content: "Continue learning in your VS Code-inspired workspace." },
    ],
  }),
  component: LearnRoute,
});

function LearnRoute() {
  return (
    <ProtectedRoute>
      <LearnIndex />
    </ProtectedRoute>
  );
}

function LearnIndex() {
  return (
    <AppShell
      tabs={[{ id: "learn", title: "learn.tsx", path: "/learn", icon: "coding" }]}
      breadcrumbs={["vslearn", "learn"]}
      terminalContent={
        <div>
          <span className="text-syntax-function">vslearn</span>
          <span className="text-syntax-keyword"> $ </span>open courses
          <div className="text-muted-foreground mt-1">› Select a course to continue.</div>
        </div>
      }
    >
      <div className="p-8 max-w-6xl">
        <div className="font-mono text-sm text-syntax-comment">// learn.index</div>
        <h1 className="text-3xl font-bold mt-1">Learning workspace</h1>
        <p className="text-muted-foreground mt-1">
          Choose a course and continue inside the editor.
        </p>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to="/learn/$courseSlug"
              params={{ courseSlug: course.id }}
              className="group border border-border bg-card rounded-md overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div
                className="aspect-[16/9] relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${course.color}30, ${course.color}05)`,
                }}
              >
                <div className="absolute inset-0 scanline-grid opacity-30" />
                <div
                  className="absolute inset-0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform"
                  style={{ color: course.color }}
                >
                  {course.icon}
                </div>
              </div>
              <div className="p-5">
                <div className="text-xs font-mono text-muted-foreground">{course.category}</div>
                <div className="font-semibold mt-1">{course.title}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {course.description}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {course.hours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> {course.students.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" /> {course.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
