import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";

import { getAuthRedirectUrl } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Create your VSLearn account" },
      { name: "description", content: "Start learning in a VS Code-inspired workspace." },
    ],
  }),
  component: Register,
});

function Register() {
  const { redirect } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: getAuthRedirectUrl(redirect),
      },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Check your email to verify your account before signing in.");
  }

  async function signUpWithProvider(provider: "github" | "google") {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthRedirectUrl(redirect) },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <Brand />
        <div>
          <div className="font-mono text-sm text-syntax-comment">// auth.register()</div>
          <h1 className="text-3xl font-bold mt-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify your email to activate your workspace.
          </p>
        </div>

        <Field
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <Status tone="error">{error}</Status>}
        {message && <Status>{message}</Status>}

        <button
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <OAuthButtons onProvider={signUpWithProvider} />

        <div className="text-sm text-muted-foreground text-center">
          Already have one?{" "}
          <Link to="/login" search={{ redirect }} className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold mb-6">
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
