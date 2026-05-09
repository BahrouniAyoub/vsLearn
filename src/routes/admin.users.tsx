import { createFileRoute } from "@tanstack/react-router";
import { Shield, User } from "lucide-react";

const users = [
  { name: "Ada Lovelace", email: "ada@vslearn.dev", role: "admin", joined: "2024-03-01", courses: 12 },
  { name: "Diego Pereira", email: "diego@example.com", role: "student", joined: "2024-08-12", courses: 5 },
  { name: "Lin Han", email: "lin@example.com", role: "student", joined: "2024-09-04", courses: 8 },
  { name: "Maya Rosales", email: "maya@example.com", role: "student", joined: "2024-10-21", courses: 3 },
  { name: "Tomás Vega", email: "tomas@example.com", role: "student", joined: "2025-01-15", courses: 1 },
];

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Manage users — Admin" }, { name: "description", content: "View and manage platform users." }] }),
  component: () => (
    <div className="p-8 max-w-6xl">
      <div className="font-mono text-sm text-syntax-comment">// admin.users</div>
      <h1 className="text-3xl font-bold mt-1">Users</h1>
      <p className="text-muted-foreground mt-1">{users.length} accounts total.</p>

      <div className="mt-8 border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">User</th>
              <th className="text-left px-4 py-2 font-medium">Role</th>
              <th className="text-left px-4 py-2 font-medium">Joined</th>
              <th className="text-left px-4 py-2 font-medium">Courses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.email} className="hover:bg-accent/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {u.role === "admin" ? <Shield className="size-3" /> : <User className="size-3" />} {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{u.joined}</td>
                <td className="px-4 py-3 font-mono">{u.courses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
