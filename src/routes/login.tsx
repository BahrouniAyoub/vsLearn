import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — VSLearn" }, { name: "description", content: "Sign in to continue your learning." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 scanline-grid opacity-50" />
        <Link to="/" className="relative z-10 flex items-center gap-2 font-semibold">
          <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">{"<>"}</span>
          VS<span className="text-primary">Learn</span>
        </Link>
        <div className="relative z-10 max-w-sm">
          <div className="text-syntax-comment font-mono text-sm">// quote.ts</div>
          <p className="mt-3 text-2xl font-medium leading-snug">"It feels like the workspace I already use — but it teaches me along the way."</p>
          <div className="mt-4 text-sm text-muted-foreground">— Diego, junior dev</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => navigate({ to: "/dashboard" }), 600); }}
          className="w-full max-w-sm space-y-5"
        >
          <div>
            <div className="font-mono text-sm text-syntax-comment">// auth.login()</div>
            <h1 className="text-3xl font-bold mt-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your VSLearn workspace.</p>
          </div>
          <Field label="Email" type="email" defaultValue="ada@vslearn.dev" />
          <Field label="Password" type="password" defaultValue="••••••••" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 disabled:opacity-50">
            {loading ? "Authenticating…" : "Sign in"}
          </button>
          <div className="text-sm text-muted-foreground text-center">
            New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }: any) {
  return (
    <label className="block">
      <div className="text-xs font-mono text-muted-foreground mb-1">{label}</div>
      <input
        {...props}
        className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
      />
    </label>
  );
}
