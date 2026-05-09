import { Link } from "@tanstack/react-router";
import { ExternalLink, Github, Clock, User } from "lucide-react";
import type { ProjectSubmission } from "@/lib/projects";
import { ProjectStatus } from "./ProjectStatus";

export function ProjectCard({
  project,
  showUser = false,
}: {
  project: ProjectSubmission;
  showUser?: boolean;
}) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group block border border-border bg-card rounded-lg p-5 hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate group-hover:text-primary transition-colors">
            {project.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>{project.courseTitle}</span>
            <span>·</span>
            <span>{project.lessonTitle}</span>
          </div>
        </div>
        <ProjectStatus status={project.status} />
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
        {showUser && (
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {project.username}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {timeAgo(project.updatedAt)}
        </span>
        {project.repoUrl && (
          <span className="flex items-center gap-1 text-primary/70">
            <Github className="size-3" />
            Repo
          </span>
        )}
        {project.demoUrl && (
          <span className="flex items-center gap-1 text-primary/70">
            <ExternalLink className="size-3" />
            Demo
          </span>
        )}
      </div>
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
