import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";
import { BookOpen, Users, BarChart3, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — VSLearn" }, { name: "description", content: "Manage courses, lessons, and users." }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isRoot = path === "/admin";

  const sidebar = (
    <div className="text-[13px]">
      <div className="px-4 pt-3 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Admin</div>
      {[
        { to: "/admin", label: "Overview", icon: BarChart3 },
        { to: "/admin/courses", label: "Courses", icon: BookOpen },
        { to: "/admin/users", label: "Users", icon: Users },
      ].map((it) => (
        <Link
          key={it.to}
          to={it.to as any}
          activeOptions={{ exact: true }}
          className="flex items-center gap-2 px-4 py-1.5 hover:bg-accent/30 [&.active]:bg-accent/50"
          activeProps={{ className: "active" }}
        >
          <it.icon className="size-4" /> {it.label}
        </Link>
      ))}
    </div>
  );

  return (
    <VSCodeShell
      tabs={[{ id: "admin", title: "admin.tsx", path: "/admin", icon: "coding" }]}
      breadcrumbs={["vslearn", "admin", isRoot ? "overview" : path.split("/").pop() ?? ""]}
      sidebarContent={sidebar}
    >
      {isRoot ? <AdminOverview /> : <Outlet />}
    </VSCodeShell>
  );
}

function AdminOverview() {
  const stats = [
    { label: "Total students", value: "120,432", icon: Users },
    { label: "Active courses", value: "82", icon: BookOpen },
    { label: "Lessons completed (30d)", value: "94,210", icon: BarChart3 },
    { label: "Avg. session", value: "24m", icon: Settings },
  ];
  return (
    <div className="p-8 max-w-6xl">
      <div className="font-mono text-sm text-syntax-comment">// admin.overview</div>
      <h1 className="text-3xl font-bold mt-1">Platform overview</h1>
      <p className="text-muted-foreground mt-1">Health, growth, and engagement at a glance.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card rounded-md p-5">
            <s.icon className="size-5 text-primary" />
            <div className="text-3xl font-bold font-mono mt-3">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-border bg-card rounded-md p-6">
        <div className="font-semibold">Quick actions</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/courses" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90">+ New course</Link>
          <Link to="/admin/users" className="border border-border bg-secondary px-4 py-2 rounded-md text-sm hover:bg-accent">Manage users</Link>
        </div>
      </div>
    </div>
  );
}
