import { createFileRoute } from "@tanstack/react-router";
import { courses } from "@/lib/vslearn/data";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Manage courses — Admin" }, { name: "description", content: "Create, edit, and delete courses." }] }),
  component: () => (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-sm text-syntax-comment">// admin.courses</div>
          <h1 className="text-3xl font-bold mt-1">Courses</h1>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:opacity-90">
          <Plus className="size-4" /> New course
        </button>
      </div>
      <div className="mt-8 border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Title</th>
              <th className="text-left px-4 py-2 font-medium">Category</th>
              <th className="text-left px-4 py-2 font-medium">Level</th>
              <th className="text-left px-4 py-2 font-medium">Lessons</th>
              <th className="text-left px-4 py-2 font-medium">Students</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-accent/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span className="font-medium">{c.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.level}</td>
                <td className="px-4 py-3 font-mono">{c.modules.reduce((s, m) => s + m.lessons.length, 0)}</td>
                <td className="px-4 py-3 font-mono">{c.students.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>
                  <button className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
