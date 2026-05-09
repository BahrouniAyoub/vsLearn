import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Award, BookOpen, Code2, ExternalLink, Github, MapPin } from "lucide-react";

import {
  getProfileStats,
  getPublicProfile,
  type CertificateRecord,
  type ProfileRecord,
  type ProgressRecord,
  type ProjectRecord,
} from "@/lib/profile";

type ProfileStats = {
  progress: ProgressRecord[];
  certificates: CertificateRecord[];
  projects: ProjectRecord[];
  completedLessons: number;
  activeCourses: number;
};

export const Route = createFileRoute("/profile/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.username} - VSLearn profile` },
      {
        name: "description",
        content: `View ${params.username}'s VSLearn profile, projects, certificates, and learning activity.`,
      },
    ],
  }),
  component: PublicProfile,
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

function PublicProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getPublicProfile(username)
      .then(async (nextProfile) => {
        if (!nextProfile) throw notFound();
        const nextStats = await getProfileStats(nextProfile.user_id);
        if (!mounted) return;
        setProfile(nextProfile);
        setStats(nextStats);
      })
      .catch((profileError: Error) => {
        if (!mounted) return;
        setError(profileError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) {
    return <ProfileShell>profile.load("{username}")</ProfileShell>;
  }

  if (error || !profile) {
    throw notFound();
  }

  const certificates = stats?.certificates ?? [];
  const projects = stats?.projects ?? [];
  const recentActivity = [...(stats?.progress ?? [])]
    .sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">
              {"<>"}
            </span>
            VS<span className="text-primary">Learn</span>
          </Link>
          <Link
            to="/courses"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Courses
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="border border-border bg-card rounded-md p-6 h-fit">
            <div className="size-28 rounded-md bg-secondary border border-border overflow-hidden flex items-center justify-center text-3xl font-mono">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.display_name} avatar`}
                  className="size-full object-cover"
                />
              ) : (
                profile.display_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <h1 className="text-2xl font-bold mt-5">{profile.display_name}</h1>
            <div className="font-mono text-sm text-syntax-comment">@{profile.username}</div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-4 whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" /> {profile.location}
                </div>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  className="flex items-center gap-2 text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" /> Website
                </a>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <Stat
                icon={<BookOpen className="size-5 text-primary" />}
                label="Active courses"
                value={String(stats?.activeCourses ?? 0)}
              />
              <Stat
                icon={<Code2 className="size-5 text-green-400" />}
                label="Completed lessons"
                value={String(stats?.completedLessons ?? 0)}
              />
              <Stat
                icon={<Award className="size-5 text-yellow-400" />}
                label="Certificates"
                value={String(certificates.length)}
              />
            </div>

            <Panel
              title="Completed certificates"
              empty={certificates.length === 0 ? "No public certificates yet." : undefined}
            >
              {certificates.map((certificate) => {
                return (
                  <Link
                    key={certificate.id}
                    to="/certificate/$username/$certificateSlug"
                    params={{
                      username: username,
                      certificateSlug: certificate.verification_code,
                    }}
                    className="flex items-center justify-between border border-border rounded-md p-4 hover:border-primary/30 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold group-hover:text-primary transition-colors">
                        {certificate.courses?.title ?? "Completed course"}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        #{certificate.certificate_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(certificate.issued_at).toLocaleDateString()}
                      </span>
                      <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </Panel>

            <Panel
              title="Recent activity"
              empty={
                recentActivity.length === 0 ? "No recent public learning activity." : undefined
              }
            >
              {recentActivity.map((item) => (
                <div key={item.id} className="border border-border rounded-md p-4">
                  <div className="font-semibold">
                    {item.lessons?.title ?? item.courses?.title ?? "Learning activity"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 capitalize">
                    {item.status.replace("_", " ")} · {item.percent_complete}%
                  </div>
                </div>
              ))}
            </Panel>

            <Panel
              title="Public projects"
              empty={projects.length === 0 ? "No public projects yet." : undefined}
              action={
                <Link
                  to="/profile/$username/projects"
                  params={{ username }}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  View all
                </Link>
              }
            >
              <div className="grid md:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((project) => (
                  <article key={project.id} className="border border-border rounded-md bg-card p-5">
                    <div className="font-semibold">{project.title}</div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="mt-4 flex gap-3 text-sm">
                      {project.repository_url && (
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Github className="size-4" /> Code
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="size-4" /> Demo
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {projects.length > 4 && (
                <Link
                  to="/profile/$username/projects"
                  params={{ username }}
                  className="block text-center text-xs text-muted-foreground hover:text-primary mt-4 pt-3 border-t border-border"
                >
                  View all {projects.length} projects
                </Link>
              )}
            </Panel>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="font-mono text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border bg-card rounded-md p-5">
      <div className="flex items-center justify-between">
        {icon}
        <div className="text-3xl font-bold font-mono">{value}</div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">{label}</div>
    </div>
  );
}

function Panel({ title, empty, action, children }: { title: string; empty?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-border bg-card rounded-md p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4 space-y-3">
        {empty ? <div className="text-sm text-muted-foreground">{empty}</div> : children}
      </div>
    </section>
  );
}
