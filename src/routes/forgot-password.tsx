import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";

import { getAuthRedirectUrl } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password - VSLearn" },
      { name: "description", content: "Request a VSLearn password reset link." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl("/settings/account"),
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("If an account exists, a reset link has been sent.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <Link to="/" className="flex items-center gap-2 font-semibold mb-6">
          <span className="size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-mono">
            {"<>"}
          </span>
          VS<span className="text-primary">Learn</span>
        </Link>
        <div>
          <div className="font-mono text-sm text-syntax-comment">// auth.resetPassword()</div>
          <h1 className="text-3xl font-bold mt-1">Forgot password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send a password reset link to your email.
          </p>
        </div>
        <label className="block">
          <div className="text-xs font-mono text-muted-foreground mb-1">Email</div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
          />
        </label>
        {error && <Status tone="error">{error}</Status>}
        {message && <Status>{message}</Status>}
        <button
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <div className="text-sm text-muted-foreground text-center">
          Remembered it?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
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
