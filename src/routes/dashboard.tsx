import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { listCourseMetadata, getCourseContent } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { XPBar, StreakDisplay } from "@/components/progress";
import { Clock, BookOpen, TrendingUp, Flame } from "lucide-react";

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
  const { userStats, streak, xpEvents, getCourseSummary } = useProgress();

  const allCourses = useMemo(() => listCourseMetadata(), []);
  const enrichedCourses = useMemo(
    () =>
      allCourses.map((c) => {
        const content = getCourseContent(c.slug);
        const totalLessons = content
          ? content.modules.reduce((s, m) => s + m.lessons.length, 0)
          : 0;
        const summary = getCourseSummary(c.slug, totalLessons);
        return { ...c, totalLessons, summary };
      }),
    [allCourses, getCourseSummary],
  );

  const inProgress = enrichedCourses.filter(
    (c) => c.summary.percentComplete > 0 && c.summary.percentComplete < 100,
  );
  const completed = enrichedCourses.filter(
    (c) => c.summary.percentComplete >= 100,
  );
  const notStarted = enrichedCourses.filter(
    (c) => c.summary.percentComplete === 0,
  );
  const continueLearning = [...inProgress, ...completed];

  const xpThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return xpEvents
      .filter((e) => new Date(e.timestamp).getTime() > weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [xpEvents]);

  const totalHours = Math.round(userStats.totalTimeSpent / 60);

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
          <div className="text-syntax-comment">› Welcome back.</div>
          <div className="text-syntax-comment">
            › {userStats.lessonsCompleted} lessons completed
          </div>
          <div className="text-syntax-string">✓ ready to continue</div>
        </div>
      }
    >
      <div className="p-8 max-w-6xl">
        <div className="font-mono text-sm text-syntax-comment">
          // dashboard.tsx — your workspace
        </div>
        <h1 className="text-3xl font-bold mt-1">Welcome back</h1>
        <p className="text-muted-foreground mt-1">
          Pick up where you left off, or start something new.
        </p>

        <div className="mt-6 mb-8">
          <XPBar xp={userStats.xp} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          <Stat
            icon={<Flame className="size-5 text-orange-400" />}
            label="Day streak"
            value={String(streak.currentStreak)}
          />
          <Stat
            icon={<BookOpen className="size-5 text-primary" />}
            label="Lessons completed"
            value={String(userStats.lessonsCompleted)}
          />
          <Stat
            icon={<TrendingUp className="size-5 text-green-400" />}
            label="Level"
            value={String(userStats.level)}
          />
          <Stat
            icon={<TrendingUp className="size-5 text-yellow-400" />}
            label="XP this week"
            value={xpThisWeek.toLocaleString()}
          />
        </div>

        {streak.atRisk && (
          <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm text-amber-400 flex items-center gap-2">
            <span>Complete a lesson today to keep your streak alive!</span>
          </div>
        )}

        {continueLearning.length > 0 && (
          <>
            <h2 className="mt-12 text-xl font-semibold">Continue learning</h2>
            <div className="mt-4 space-y-3">
              {continueLearning.map((c) => {
                const firstLesson =
                  getCourseContent(c.slug)?.modules[0]?.lessons[0];
                return (
                  <Link
                    key={c.slug}
                    to="/learn/$courseSlug/$lessonSlug"
                    params={{
                      courseSlug: c.slug,
                      lessonSlug: firstLesson?.slug ?? "",
                    }}
                    className="block border border-border bg-card rounded-md p-5 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="size-12 rounded-md flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: `${c.color ?? "#888"}20`,
                          color: c.color ?? "#888",
                        }}
                      >
                        {c.icon ?? "📘"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{c.title}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {c.description}
                        </div>
                      </div>
                      <div className="text-right text-sm hidden sm:block">
                        <div className="text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="size-3" /> {c.estimatedHours}h
                        </div>
                        <div className="font-semibold mt-1">
                          {c.summary.percentComplete}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${c.summary.percentComplete}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {notStarted.length > 0 && (
          <>
            <h2 className="mt-12 text-xl font-semibold">Recommended next</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              {notStarted.slice(0, 3).map((c) => (
                <Link
                  key={c.slug}
                  to="/courses/$id"
                  params={{ id: c.slug }}
                  className="border border-border bg-card rounded-md p-5 hover:border-primary/50"
                >
                  <div
                    className="size-10 rounded-md flex items-center justify-center text-lg"
                    style={{
                      background: `${c.color ?? "#888"}20`,
                      color: c.color ?? "#888",
                    }}
                  >
                    {c.icon ?? "📘"}
                  </div>
                  <div className="font-semibold mt-3">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {c.level} · {c.estimatedHours}h
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
