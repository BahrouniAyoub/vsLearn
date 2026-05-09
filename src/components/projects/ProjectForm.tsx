import { useState } from "react";
import { Save, Send, Loader2, Trash2 } from "lucide-react";
import type { ProjectSubmission } from "@/lib/projects";

type ProjectFormProps = {
  project: ProjectSubmission;
  onSave: (updates: Partial<ProjectSubmission>) => void;
  onSubmit: () => void;
  onDeleteFile: (path: string) => void;
  isSubmitting: boolean;
};

export function ProjectForm({ project, onSave, onSubmit, onDeleteFile, isSubmitting }: ProjectFormProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [repoUrl, setRepoUrl] = useState(project.repoUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl ?? "");

  const handleSave = () => {
    onSave({ title, description, repoUrl: repoUrl || null, demoUrl: demoUrl || null });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-editor border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          placeholder="Project title"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full bg-editor border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-vertical"
          placeholder="Describe your project..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            Repository URL <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full bg-editor border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            Demo URL <span className="text-muted-foreground/50">(optional)</span>
          </label>
          <input
            type="url"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            className="w-full bg-editor border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
            placeholder="https://my-project.vercel.app"
          />
        </div>
      </div>

      {project.files.length > 0 && (
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5">
            Files ({project.files.length})
          </label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {project.files.map((f) => (
              <div
                key={f.path}
                className="flex items-center justify-between bg-editor border border-border rounded px-3 py-1.5 text-xs font-mono"
              >
                <span className="text-foreground truncate">{f.path}</span>
                <button
                  type="button"
                  onClick={() => onDeleteFile(f.path)}
                  className="text-muted-foreground hover:text-destructive ml-2 flex-shrink-0"
                  title="Remove file"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border bg-secondary rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Save className="size-3.5" />
          Save draft
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
          Submit project
        </button>
      </div>
    </div>
  );
}
