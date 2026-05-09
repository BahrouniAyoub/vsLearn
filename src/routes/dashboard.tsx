import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/lib/auth";
import { listCourseMetadata, getCourseContent } from "@/lib/content";
import type { CourseContent, CourseLesson, CourseMetadata } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import type { CourseProgressSummary, XpEvent } from "@/lib/progress";
import { XPBar, StreakDisplay } from "@/components/progress";
import {
  Flame, BookOpen, TrendingUp, Clock, Award,
  Zap, ChevronRight, ExternalLink, GraduationCap,
  Sparkles, type LucideIcon,
} from "lucide-react";

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

type EnrichedCourse = CourseMetadata & {
  totalLessons: number;
  summary: CourseProgressSummary;
  content: CourseContent | null;
};

function Dashboard() {
  const { userStats, streak, xpEvents, getCourseSummary } = useProgress();

  const allCourses = useMemo(() => listCourseMetadata(), []);
  const courseContents = useMemo(
    () => Object.fromEntries(
      allCourses.map((c) => [c.slug, getCourseContent(c.slug)]),
    ),
    [allCourses],
  );

  const enrichedCourses: EnrichedCourse[] = useMemo(
    () =>
      allCourses.map((c) => {
        const content = courseContents[c.slug];
        const totalLessons = content
          ? content.modules.reduce((s, m) => s + m.lessons.length, 0)
          : 0;
        const summary = getCourseSummary(c.slug, totalLessons);
        return { ...c, totalLessons, summary, content };
      }),
    [allCourses, courseContents, getCourseSummary],
  );

  const activeCourses = enrichedCourses.filter(
    (c) => c.summary.percentComplete > 0 && c.summary.percentComplete < 100,
  );

  const completedCourses = enrichedCourses.filter(
    (c) => c.summary.percentComplete >= 100,
  );

  const notStarted = enrichedCourses.filter(
    (c) => c.summary.percentComplete === 0,
  );

  const recentActivity: XpEvent[] = useMemo(
    () =>
      [...xpEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10),
    [xpEvents],
  );

  const xpThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return xpEvents
      .filter((e) => new Date(e.timestamp).getTime() > weekAgo)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [xpEvents]);

  const recommended: { course: EnrichedCourse; lesson: CourseLesson } | null = useMemo(() => {
    const entry = notStarted[0] ?? enrichedCourses[0];
    if (!entry) return null;
    const firstLesson = entry.content?.modules[0]?.lessons[0];
    if (!firstLesson) return null;
    return { course: entry, lesson: firstLesson };
  }, [notStarted, enrichedCourses]);

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
            › {userStats.lessonsCompleted} lessons completed · {userStats.coursesCompleted} courses completed
          </div>
          {streak.currentStreak > 0 && (
            <div className="text-syntax-string">› {streak.currentStreak}-day streak active</div>
          )}
          <div className="text-syntax-string">✓ ready to continue</div>
        </div>
      }
    >
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="font-mono text-xs text-muted-foreground mb-1 select-none">
          // dashboard.tsx
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {streak.activeToday
            ? "You're on fire today! Keep the momentum going."
            : streak.atRisk
              ? "Complete a lesson to keep your streak alive!"
              : "Pick up where you left off, or start something new."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <XPBar xp={userStats.xp} />
          </div>
          <StreakDisplay streak={streak} size="md" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatCard
            icon={<Flame className="size-4 text-orange-400" />}
            label="Day streak"
            value={String(streak.currentStreak)}
            detail={streak.longestStreak > streak.currentStreak ? `Best: ${streak.longestStreak}` : undefined}
          />
          <StatCard
            icon={<BookOpen className="size-4 text-primary" />}
            label="Lessons"
            value={String(userStats.lessonsCompleted)}
            detail="completed"
          />
          <StatCard
            icon={<Award className="size-4 text-yellow-400" />}
            label="Courses"
            value={String(userStats.coursesCompleted)}
            detail={completedCourses.length > 0 ? "completed" : undefined}
          />
          <StatCard
            icon={<Zap className="size-4 text-purple-400" />}
            label="XP this week"
            value={xpThisWeek.toLocaleString()}
            detail={`Lv.${userStats.level} · ${userStats.xp.toLocaleString()} total`}
          />
        </div>

        {streak.atRisk && !streak.activeToday && (
          <div className="mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 text-sm">
            <Flame className="size-5 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 font-medium">
              Complete a lesson today to keep your {streak.currentStreak}-day streak alive!
            </span>
          </div>
        )}

        {activeCourses.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">Continue learning</h2>
            </div>
            <div className="space-y-3">
              {activeCourses.map((c) => {
                const content = c.content;
                const allLessons = content
                  ? content.modules.flatMap((m) => m.lessons)
                  : [];
                const firstIncomplete = allLessons.find(
                  (l) => getCourseSummary(c.slug, allLessons.length).completedLessons < allLessons.indexOf(l) + 1,
                );
                const nextLesson = firstIncomplete ?? allLessons[0];
                return (
                  <CourseProgressCard
                    key={c.slug}
                    course={c}
                    nextLesson={nextLesson}
                  />
                );
              })}
            </div>
          </section>
        )}

        {completedCourses.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="size-4 text-yellow-400" />
              <h2 className="text-lg font-semibold">Earned certificates</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedCourses.map((c) => (
                <CertificateCard key={c.slug} course={c} />
              ))}
            </div>
          </section>
        )}

        {recentActivity.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent activity</h2>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {recentActivity.map((event, i) => (
                <ActivityRow key={event.id} event={event} isLast={i === recentActivity.length - 1} />
              ))}
            </div>
          </section>
        )}

        {recommended && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-purple-400" />
              <h2 className="text-lg font-semibold">Recommended next</h2>
            </div>
            <RecommendedCard course={recommended.course} lesson={recommended.lesson} />
          </section>
        )}

        {notStarted.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="size-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Explore courses</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {notStarted.slice(0, 6).map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className="text-xl font-bold font-mono text-foreground">{value}</span>
      </div>
      <div className="text-xs font-mono text-muted-foreground">{label}</div>
      {detail && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{detail}</div>}
    </div>
  );
}

function CourseProgressCard({ course, nextLesson }: { course: EnrichedCourse; nextLesson?: CourseLesson }) {
  const s = course.summary;
  return (
    <Link
      to="/learn/$courseSlug/$lessonSlug"
      params={{ courseSlug: course.slug, lessonSlug: nextLesson?.slug ?? "" }}
      className="group block bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-all"
    >
      <div className="flex items-center gap-4">
        <div
          className="size-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `${course.color ?? "#888"}20`,
            color: course.color ?? "#888",
          }}
        >
          {course.icon ?? "📘"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate group-hover:text-primary transition-colors">
            {course.title}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <span className="capitalize">{course.level}</span>
            <span>·</span>
            <span>{s.completedLessons}/{s.totalLessons} lessons</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="text-lg font-bold font-mono text-foreground">{s.percentComplete}%</div>
          <div className="text-[10px] text-muted-foreground">{s.xpEarned} XP</div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 hidden sm:block" />
      </div>
      <div className="mt-4 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
          style={{ width: `${s.percentComplete}%` }}
        />
      </div>
      {nextLesson && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="text-primary/70">Continue</span>
          <ChevronRight className="size-3 text-primary/70" />
          <span className="truncate">{nextLesson.frontmatter.title}</span>
        </div>
      )}
    </Link>
  );
}

function CertificateCard({ course }: { course: EnrichedCourse }) {
  return (
    <Link
      to="/courses/$id"
      params={{ id: course.slug }}
      className="group bg-card border border-border rounded-lg p-4 hover:border-yellow-400/40 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="size-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate group-hover:text-yellow-400 transition-colors">
            {course.title}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Certificate earned</div>
        </div>
        <ExternalLink className="size-4 text-muted-foreground group-hover:text-yellow-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

const categoryIcon: Record<string, LucideIcon> = {
  lesson: BookOpen,
  challenge: Zap,
  course: Award,
  streak: Flame,
  quiz: Sparkles,
};

const categoryColor: Record<string, string> = {
  lesson: "text-primary",
  challenge: "text-purple-400",
  course: "text-yellow-400",
  streak: "text-orange-400",
  quiz: "text-blue-400",
};

function ActivityRow({ event, isLast }: { event: XpEvent; isLast: boolean }) {
  const Icon = categoryIcon[event.category] ?? BookOpen;
  const color = categoryColor[event.category] ?? "text-primary";
  const ago = timeAgo(event.timestamp);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-border" : ""} hover:bg-accent/20 transition-colors`}>
      <div className="size-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className={`size-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{event.reason}</div>
        <div className="text-xs text-muted-foreground">{ago}</div>
      </div>
      <div className="text-sm font-mono font-bold text-green-400 flex-shrink-0">+{event.amount}</div>
    </div>
  );
}

function RecommendedCard({ course, lesson }: { course: EnrichedCourse; lesson: CourseLesson }) {
  return (
    <Link
      to="/learn/$courseSlug/$lessonSlug"
      params={{ courseSlug: course.slug, lessonSlug: lesson.slug }}
      className="group block bg-gradient-to-br from-card to-secondary/30 border border-border rounded-lg p-5 hover:border-primary/40 transition-all"
    >
      <div className="flex items-start gap-4">
        <div
          className="size-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `${course.color ?? "#888"}20`,
            color: course.color ?? "#888",
          }}
        >
          {course.icon ?? "📘"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {course.title}
          </div>
          <div className="font-semibold mt-0.5 group-hover:text-primary transition-colors">
            {lesson.frontmatter.title}
          </div>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {lesson.frontmatter.summary ?? course.description}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="capitalize px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">
              {lesson.frontmatter.type}
            </span>
            <span>{lesson.frontmatter.durationMinutes} min</span>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

function CourseCard({ course }: { course: EnrichedCourse }) {
  return (
    <Link
      to="/courses/$id"
      params={{ id: course.slug }}
      className="group border border-border bg-card rounded-lg p-4 hover:border-primary/40 transition-all"
    >
      <div
        className="size-10 rounded-lg flex items-center justify-center text-lg"
        style={{
          background: `${course.color ?? "#888"}20`,
          color: course.color ?? "#888",
        }}
      >
        {course.icon ?? "📘"}
      </div>
      <div className="font-semibold mt-3 group-hover:text-primary transition-colors">{course.title}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
        <span className="capitalize">{course.level}</span>
        <span>·</span>
        <span>{course.estimatedHours}h</span>
        <span>·</span>
        <span>{course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
    </Link>
  );
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
