import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Code2, Globe, Lock, ExternalLink,
} from "lucide-react";
import { getPublicProfile, getProfileStats, type ProfileRecord } from "@/lib/profile";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/projects";
import { ProjectStatus, ProjectCard } from "@/components/projects";
import type { ProjectSubmission } from "@/lib/projects";

export const Route = createFileRoute("/profile/$username/projects")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username}'s projects — VSLearn` },
      { name: "description", content: `Browse ${params.username}'s projects on VSLearn.` },
    ],
  }),
  component: ProfileProjects,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="font-mono text-sm text-syntax-comment">// profile not found</div>
        <h1 className="text-3xl font-bold mt-2">Profile unavailable</h1>
        <p className="text-muted-foreground mt-2">This profile does not exist or is private.</p>
        <Link
          to="/courses"
          className="inline-flex mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
        >
          Browse courses
        </Link>
      </div>
    </div>
  ),
});

function ProfileProjects() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const { projects: allMyProjects } = useProjects();

  const isOwnProfile =
    user?.user_metadata?.username === username ||
    user?.email?.split("@")[0] === username;

  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublicProfile(username)
      .then((p) => {
        if (!mounted) return;
        if (!p) throw notFound();
        setProfile(p);
      })
      .catch(() => {
        if (!mounted) return;
        setProfile(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="font-mono text-sm text-muted-foreground">loading projects...</div>
      </div>
    );
  }

  if (!profile) throw notFound();

  const displayProjects: ProjectSubmission[] = isOwnProfile
    ? allMyProjects
    : allMyProjects.filter((p) => p.isPublished && p.username === username);

  const published = displayProjects.filter((p) => p.isPublished);
  const drafts = displayProjects.filter((p) => !p.isPublished);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          {isOwnProfile ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/profile/$username"
              params={{ username }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              @{username}
            </Link>
          )}
          <div className="flex-1" />
          <Link
            to="/projects"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Community gallery
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="font-mono text-xs text-muted-foreground mb-1 select-none">
          // {username}/projects
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {isOwnProfile ? "My Projects" : `${username}'s Projects`}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isOwnProfile
            ? "Manage your project submissions."
            : `Projects by ${username}.`}
        </p>

        {displayProjects.length === 0 ? (
          <div className="mt-20 text-center">
            <Code2 className="size-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">No projects yet.</p>
            {isOwnProfile && (
              <p className="text-sm text-muted-foreground mt-1">
                Complete a project lesson to submit your first project.
              </p>
            )}
          </div>
        ) : (
          <>
            {published.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="size-4 text-green-400" />
                  <h2 className="text-sm font-semibold">Published ({published.length})</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {published.map((p) => (
                    <div key={p.id} className="relative">
                      <ProjectCard project={p} />
                      {isOwnProfile && (
                        <Link
                          to="/projects/$slug"
                          params={{ slug: p.slug }}
                          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                          title="View public page"
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isOwnProfile && drafts.length > 0 && (
              <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Drafts ({drafts.length})</h2>
                </div>
                <div className="space-y-3">
                  {drafts.map((p) => (
                    <div
                      key={p.id}
                      className="border border-border bg-card rounded-lg p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.courseTitle}</div>
                      </div>
                      <ProjectStatus status={p.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
