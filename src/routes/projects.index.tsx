import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Code2, Grid3X3, List } from "lucide-react";
import { ProjectCard } from "@/components/projects";
import { getAllPublished, fetchPublishedProjectsFromSupabase } from "@/lib/projects";
import type { ProjectSubmission } from "@/lib/projects";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — VSLearn" },
      { name: "description", content: "Browse community projects." },
    ],
  }),
  component: ProjectsGallery,
});

function ProjectsGallery() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let mounted = true;
    const local = getAllPublished();
    setProjects(local);

    fetchPublishedProjectsFromSupabase().then((remote) => {
      if (!mounted) return;
      setProjects((prev) => {
        const merged = [...prev];
        for (const r of remote) {
          if (!merged.find((p) => p.id === r.id)) merged.push(r);
        }
        return merged.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
      setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.courseTitle.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold flex-shrink-0">
            <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">
              {"<>"}
            </span>
            VS<span className="text-primary">Learn</span>
          </Link>
          <nav className="flex items-center gap-4 ml-4 text-sm">
            <Link to="/courses" className="text-muted-foreground hover:text-foreground">
              Courses
            </Link>
            <Link to="/projects" className="text-foreground font-medium">
              Projects
            </Link>
          </nav>
          <div className="flex-1" />
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-muted-foreground mb-1 select-none">
              // projects
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Browse projects built by the VSLearn community.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid3X3 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {loading && projects.length === 0 ? (
          <div className="mt-20 text-center">
            <Code2 className="size-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-20 text-center">
            <Code2 className="size-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">
              {projects.length === 0
                ? "No published projects yet. Be the first to submit one!"
                : "No projects match your search."}
            </p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "mt-6 space-y-3"
            }
          >
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} showUser />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
