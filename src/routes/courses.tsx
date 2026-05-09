import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";
import { courses, categories } from "@/lib/vslearn/data";
import { Star, Clock, Users, Search } from "lucide-react";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses — VSLearn" }, { name: "description", content: "Browse our full catalog of web development courses." }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const list = courses.filter((c) =>
    (!filter || c.category === filter) &&
    (!q || c.title.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase()))
  );

  const sidebarContent = (
    <div className="text-[13px]">
      <div className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Categories</div>
      <button
        onClick={() => setFilter(null)}
        className={`w-full text-left px-4 py-1.5 hover:bg-accent/30 ${filter === null ? "bg-accent/50 text-foreground" : ""}`}
      >
        📂 All courses <span className="text-muted-foreground text-xs">({courses.length})</span>
      </button>
      {categories.map((c) => {
        const count = courses.filter((co) => co.category === c.name).length;
        return (
          <button
            key={c.name}
            onClick={() => setFilter(c.name)}
            className={`w-full text-left px-4 py-1.5 hover:bg-accent/30 flex items-center gap-2 ${filter === c.name ? "bg-accent/50 text-foreground" : ""}`}
          >
            <span style={{ color: c.color }}>{c.icon}</span>
            {c.name}
            <span className="text-muted-foreground text-xs ml-auto">{count}</span>
          </button>
        );
      })}
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
        <p className="text-muted-foreground mt-1">{list.length} of {courses.length} courses {filter ? `in ${filter}` : "available"}.</p>

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
          {list.map((c) => (
            <Link
              key={c.id}
              to="/courses/$id"
              params={{ id: c.id }}
              className="group border border-border bg-card rounded-md overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-[16/9] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.color}30, ${c.color}05)` }}>
                <div className="absolute inset-0 scanline-grid opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-90 group-hover:scale-110 transition-transform" style={{ color: c.color }}>{c.icon}</div>
                <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-border">{c.level}</div>
              </div>
              <div className="p-5">
                <div className="text-xs font-mono text-muted-foreground">{c.category}</div>
                <div className="font-semibold mt-1">{c.title}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {c.hours}h</span>
                  <span className="flex items-center gap-1"><Users className="size-3" /> {c.students.toLocaleString()}</span>
                  <span className="flex items-center gap-1 ml-auto"><Star className="size-3 fill-yellow-400 text-yellow-400" /> {c.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </VSCodeShell>
  );
}
