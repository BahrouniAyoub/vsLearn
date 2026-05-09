import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create your VSLearn account" }, { name: "description", content: "Start learning in a VS Code-inspired workspace." }] }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form
        onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => navigate({ to: "/dashboard" }), 600); }}
        className="w-full max-w-sm space-y-5"
      >
        <Link to="/" className="flex items-center gap-2 font-semibold mb-6">
          <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">{"<>"}</span>
          VS<span className="text-primary">Learn</span>
        </Link>
        <div>
          <div className="font-mono text-sm text-syntax-comment">// auth.register()</div>
          <h1 className="text-3xl font-bold mt-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Free forever. Upgrade anytime.</p>
        </div>
        <F label="Name" defaultValue="Ada Lovelace" />
        <F label="Email" type="email" defaultValue="ada@vslearn.dev" />
        <F label="Password" type="password" defaultValue="••••••••" />
        <button disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 disabled:opacity-50">
          {loading ? "Provisioning workspace…" : "Create account"}
        </button>
        <div className="text-sm text-muted-foreground text-center">
          Already have one? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </form>
    </div>
  );
}

function F({ label, ...props }: any) {
  return (
    <label className="block">
      <div className="text-xs font-mono text-muted-foreground mb-1">{label}</div>
      <input {...props} className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" />
    </label>
  );
}
