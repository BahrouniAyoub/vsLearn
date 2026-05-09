import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { courses, mockUser, courseProgress } from "@/lib/vslearn/data";
import { Flame, Trophy, Target, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VSLearn" },
      { name: "description", content: "Your learning workspace." },
    ],
  }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const enrolled = mockUser.enrolledCourses
    .map((id) => courses.find((c) => c.id === id)!)
    .filter(Boolean);
  const tabs = [{ id: "dash", title: "dashboard.tsx", path: "/dashboard", icon: "coding" }];

  return (
    <AppShell
      tabs={tabs}
      breadcrumbs={["vslearn", "src", "dashboard.tsx"]}
      terminalContent={
        <div className="space-y-1">
          <div>
            <span className="text-syntax-function">vslearn</span>
            <span className="text-syntax-keyword"> $ </span>npm run learn
          </div>
          <div className="text-syntax-comment">› Welcome back, {mockUser.name.split(" ")[0]}.</div>
          <div className="text-syntax-comment">
            › {mockUser.completedLessons.length} lessons completed · {mockUser.badges.length} badges
            earned
          </div>
          <div className="text-syntax-string">✓ ready to continue</div>
        </div>
      }
    >
      <div className="p-8 max-w-6xl">
        <div className="font-mono text-sm text-syntax-comment">
          // dashboard.tsx — your workspace
        </div>
        <h1 className="text-3xl font-bold mt-1">Welcome back, {mockUser.name.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">
          Pick up where you left off, or start something new.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          <Stat icon={<Flame className="size-5 text-orange-400" />} label="Day streak" value="12" />
          <Stat
            icon={<Target className="size-5 text-primary" />}
            label="Lessons completed"
            value={String(mockUser.completedLessons.length)}
          />
          <Stat
            icon={<Trophy className="size-5 text-yellow-400" />}
            label="Badges earned"
            value={String(mockUser.badges.length)}
          />
          <Stat
            icon={<TrendingUp className="size-5 text-green-400" />}
            label="XP this week"
            value="2,340"
          />
        </div>

        <h2 className="mt-12 text-xl font-semibold">Continue learning</h2>
        <div className="mt-4 space-y-3">
          {enrolled.map((c) => {
            const p = courseProgress(c.id);
            const firstLesson = c.modules[0]?.lessons[0];
            return (
              <Link
                key={c.id}
                to="/learn/$courseSlug/$lessonSlug"
                params={{ courseSlug: c.id, lessonSlug: firstLesson?.id ?? "l1" }}
                className="block border border-border bg-card rounded-md p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="size-12 rounded-md flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${c.color}20`, color: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{c.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{c.description}</div>
                  </div>
                  <div className="text-right text-sm hidden sm:block">
                    <div className="text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="size-3" /> {c.hours}h
                    </div>
                    <div className="font-semibold mt-1">{p}%</div>
                  </div>
                </div>
                <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${p}%` }} />
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="mt-12 text-xl font-semibold">Recommended next</h2>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {courses
            .filter((c) => !mockUser.enrolledCourses.includes(c.id))
            .slice(0, 3)
            .map((c) => (
              <Link
                key={c.id}
                to="/courses/$id"
                params={{ id: c.id }}
                className="border border-border bg-card rounded-md p-5 hover:border-primary/50"
              >
                <div
                  className="size-10 rounded-md flex items-center justify-center text-lg"
                  style={{ background: `${c.color}20`, color: c.color }}
                >
                  {c.icon}
                </div>
                <div className="font-semibold mt-3">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.level} · {c.hours}h
                </div>
              </Link>
            ))}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border bg-card rounded-md p-4">
      <div className="flex items-center justify-between">
        {icon}
        <div className="text-2xl font-bold font-mono">{value}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">{label}</div>
    </div>
  );
}
