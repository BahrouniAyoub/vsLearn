import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { BookOpen, LayoutDashboard, Home, Settings, User, Award, FileCode, Shield } from "lucide-react";
import { courses } from "@/lib/vslearn/data";

export function CommandPalette({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const go = (path: string, params?: any) => {
    onOpenChange(false);
    navigate({ to: path as any, params });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-card border border-border rounded-md shadow-2xl overflow-hidden">
        <Command className="bg-transparent">
          <div className="border-b border-border">
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="w-full bg-transparent px-4 py-3 outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-muted-foreground text-center">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-1">
              <Item icon={<Home className="size-4" />} label="Go to Home" hint="/" onSelect={() => go("/")} />
              <Item icon={<LayoutDashboard className="size-4" />} label="Open Dashboard" hint="/dashboard" onSelect={() => go("/dashboard")} />
              <Item icon={<BookOpen className="size-4" />} label="Browse Courses" hint="/courses" onSelect={() => go("/courses")} />
              <Item icon={<Shield className="size-4" />} label="Admin Panel" hint="/admin" onSelect={() => go("/admin")} />
              <Item icon={<User className="size-4" />} label="Sign in" hint="/login" onSelect={() => go("/login")} />
            </Command.Group>

            <Command.Group heading="Courses" className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-1 mt-2">
              {courses.map((c) => (
                <Item
                  key={c.id}
                  icon={<span style={{ color: c.color }}>{c.icon}</span>}
                  label={`Open: ${c.title}`}
                  hint={c.category}
                  onSelect={() => go("/courses/$id", { id: c.id })}
                />
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="text-[11px] uppercase tracking-wider text-muted-foreground px-2 py-1 mt-2">
              <Item icon={<FileCode className="size-4" />} label="New Code Snippet" hint="Coming soon" />
              <Item icon={<Award className="size-4" />} label="View Achievements" hint="Coming soon" />
              <Item icon={<Settings className="size-4" />} label="Open Settings" hint="Coming soon" />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({ icon, label, hint, onSelect }: { icon: React.ReactNode; label: string; hint?: string; onSelect?: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
    >
      <span className="w-5 flex items-center justify-center text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Command.Item>
  );
}
