import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { getAuthRedirectUrl, useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in - VSLearn" },
      { name: "description", content: "Sign in to continue your learning." },
    ],
  }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) window.location.assign(redirect);
  }, [redirect, user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Authenticated. Opening your workspace...");
    window.location.assign(redirect);
  }

  async function signInWithProvider(provider: "github" | "google") {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthRedirectUrl(redirect) },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <AuthScreen aside="// auth.login()">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <Brand />
        <div>
          <div className="font-mono text-sm text-syntax-comment">// auth.login()</div>
          <h1 className="text-3xl font-bold mt-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your VSLearn workspace.</p>
        </div>

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <Status tone="error">{error}</Status>}
        {message && <Status>{message}</Status>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign in"}
        </button>

        <OAuthButtons onProvider={signInWithProvider} />

        <div className="flex justify-between text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" search={{ redirect }} className="text-primary hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </AuthScreen>
  );
}

function AuthScreen({ children, aside }: { children: ReactNode; aside: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-card border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 scanline-grid opacity-50" />
        <Brand className="relative z-10" />
        <div className="relative z-10 max-w-sm">
          <div className="text-syntax-comment font-mono text-sm">{aside}</div>
          <p className="mt-3 text-2xl font-medium leading-snug">
            "It feels like the workspace I already use, but it teaches me along the way."
          </p>
          <div className="mt-4 text-sm text-muted-foreground">- Diego, junior dev</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}

function Brand({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold ${className}`}>
      <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">
        {"<>"}
      </span>
      VS<span className="text-primary">Learn</span>
    </Link>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, ...props }: FieldProps) {
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

function OAuthButtons({ onProvider }: { onProvider: (provider: "github" | "google") => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onProvider("github")}
        className="border border-border bg-secondary py-2 rounded-md text-sm hover:bg-accent"
      >
        GitHub
      </button>
      <button
        type="button"
        onClick={() => onProvider("google")}
        className="border border-border bg-secondary py-2 rounded-md text-sm hover:bg-accent"
      >
        Google
      </button>
    </div>
  );
}

function Status({
  children,
  tone = "success",
}: {
  children: ReactNode;
  tone?: "success" | "error";
}) {
  return (
    <div
      className={`text-sm border rounded-md px-3 py-2 ${tone === "error" ? "border-destructive text-destructive" : "border-primary text-primary"}`}
    >
      {children}
    </div>
  );
}
