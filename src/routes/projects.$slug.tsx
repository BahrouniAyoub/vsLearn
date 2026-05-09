import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, ExternalLink, Github, User, Calendar,
  CheckCircle2, Clock, FileCode, TestTube,
} from "lucide-react";
import { findPublishedBySlug, fetchPublishedProjectsFromSupabase, type ProjectSubmission } from "@/lib/projects";
import { ProjectStatus } from "@/components/projects";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — VSLearn project` },
      { name: "description", content: "View project details." },
    ],
  }),
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <FileCode className="size-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-2xl font-bold">Project not found</h1>
      <p className="text-muted-foreground mt-2">This project may have been unpublished or the link is invalid.</p>
      <Link to="/projects" className="mt-6 text-primary hover:underline text-sm">Browse projects</Link>
    </div>
  ),
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const [project, setProject] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const local = findPublishedBySlug(slug);
    if (local) {
      setProject(local);
      setLoading(false);
      return;
    }

    fetchPublishedProjectsFromSupabase().then((remote) => {
      if (!mounted) return;
      const found = remote.find((p) => p.slug === slug);
      if (found) {
        setProject(found);
      } else {
        setProject(null);
      }
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="font-mono text-sm text-muted-foreground">loading project...</div>
      </div>
    );
  }

  if (!project) throw notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link
            to="/projects"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All projects
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="border border-border bg-card rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">{project.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {project.username}
                  </span>
                  <span>·</span>
                  <span>{project.courseTitle}</span>
                  <span>·</span>
                  <span>{project.lessonTitle}</span>
                </div>
              </div>
              <ProjectStatus status={project.status} className="flex-shrink-0" />
            </div>

            {project.description && (
              <p className="text-sm text-muted-foreground mt-5 whitespace-pre-wrap">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 flex-wrap">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-secondary hover:bg-accent transition-colors"
                >
                  <Github className="size-3.5" />
                  View repository
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  Live demo
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Submitted {new Date(project.submittedAt ?? project.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Updated {timeAgo(project.updatedAt)}
              </span>
            </div>
          </div>

          {project.files.length > 0 && (
            <div className="border-t border-border">
              <div className="px-6 sm:px-8 py-4 bg-secondary/20 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileCode className="size-4" />
                  Project files ({project.files.length})
                </div>
              </div>
              <div className="divide-y divide-border">
                {project.files.map((f: { path: string; content: string; language: string }) => (
                  <details key={f.path} className="group">
                    <summary className="px-6 sm:px-8 py-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/20 cursor-pointer transition-colors flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileCode className="size-3.5" />
                        {f.path}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">{f.language}</span>
                    </summary>
                    <pre className="px-6 sm:px-8 py-4 overflow-x-auto text-xs font-mono leading-relaxed bg-editor/50">
                      <code>{f.content}</code>
                    </pre>
                  </details>
                ))}
              </div>
            </div>
          )}

          {project.testResults && (
            <div className="border-t border-border">
              <div className="px-6 sm:px-8 py-4 bg-secondary/20 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TestTube className="size-4" />
                  Test results
                </div>
              </div>
              <div className="px-6 sm:px-8 py-4">
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="text-green-400">
                    <CheckCircle2 className="size-3.5 inline mr-1" />
                    {project.testResults.passed} passed
                  </span>
                  {project.testResults.failed > 0 && (
                    <span className="text-red-400">
                      {project.testResults.failed} failed
                    </span>
                  )}
                  <span className="text-muted-foreground">{project.testResults.total} total</span>
                </div>
                <div className="space-y-1">
                  {project.testResults.details.map((d: { name: string; passed: boolean; message?: string }, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded ${
                        d.passed
                          ? "text-green-400 bg-green-500/5"
                          : "text-red-400 bg-red-500/5"
                      }`}
                    >
                      <span>{d.passed ? "✓" : "✗"}</span>
                      <span className="flex-1">{d.name}</span>
                      {d.message && !d.passed && (
                        <span className="text-muted-foreground text-[10px] truncate max-w-[200px]">
                          {d.message}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
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
