import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";
import { listCourseMetadata } from "@/lib/content";
import { Clock, Search } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — VSLearn" },
      { name: "description", content: "Browse our full catalog of web development courses." },
    ],
  }),
  component: CoursesPage,
});

const levelBadge: Record<string, { label: string; className: string }> = {
  beginner: {
    label: "Beginner",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  advanced: {
    label: "Advanced",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

function CoursesPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const courses = useMemo(() => listCourseMetadata(), []);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of courses) {
      map.set(c.category, (map.get(c.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [courses]);

  const list = courses.filter(
    (c) =>
      (!filter || c.category === filter) &&
      (!q || c.title.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase())),
  );

  const sidebarContent = (
    <div className="text-[13px]">
      <div className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        Categories
      </div>
      <button
        onClick={() => setFilter(null)}
        className={`w-full text-left px-4 py-1.5 hover:bg-accent/30 ${filter === null ? "bg-accent/50 text-foreground" : ""}`}
      >
        <span className="mr-1.5">📂</span> All courses{" "}
        <span className="text-muted-foreground text-xs">({courses.length})</span>
      </button>
      {categories.map(([name, count]) => (
        <button
          key={name}
          onClick={() => setFilter(name)}
          className={`w-full text-left px-4 py-1.5 hover:bg-accent/30 flex items-center gap-2 ${filter === name ? "bg-accent/50 text-foreground" : ""}`}
        >
          <span>{name}</span>
          <span className="text-muted-foreground text-xs ml-auto">{count}</span>
        </button>
      ))}
    </div>
  );

  return (
    <VSCodeShell
      tabs={[{ id: "courses", title: "courses.tsx", path: "/courses", icon: "coding" }]}
      breadcrumbs={["vslearn", "src", "routes", "courses.tsx"]}
      sidebarContent={sidebarContent}
    >
      <div className="p-8 max-w-6xl">
        <div className="font-mono text-sm text-syntax-comment">// catalog.find()</div>
        <h1 className="text-3xl font-bold mt-1">Courses</h1>
        <p className="text-muted-foreground mt-1">
          {list.length} of {courses.length} courses{filter ? ` in ${filter}` : ""} available.
        </p>

        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-secondary border border-border rounded-md pl-10 pr-3 py-2 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((c) => {
            const badge = levelBadge[c.level] ?? levelBadge.beginner;
            return (
              <Link
                key={c.slug}
                to="/courses/$id"
                params={{ id: c.slug }}
                className="group border border-border bg-card rounded-md overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div
                  className="aspect-[16/9] relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${c.color ?? "#888"}30, ${c.color ?? "#888"}05)` }}
                >
                  <div className="absolute inset-0 scanline-grid opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-90 group-hover:scale-110 transition-transform">
                    {c.icon}
                  </div>
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-mono text-muted-foreground">{c.category}</div>
                  <div className="font-semibold mt-1">{c.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {c.description}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {c.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1 ml-auto text-muted-foreground/60">
                      {c.modules.length} module{c.modules.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </VSCodeShell>
  );
}
