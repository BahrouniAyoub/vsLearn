import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";

import { ProtectedRoute, useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";

export const Route = createFileRoute("/settings/account")({
  head: () => ({
    meta: [
      { title: "Account settings - VSLearn" },
      { name: "description", content: "Manage your VSLearn account and authentication settings." },
    ],
  }),
  component: AccountSettingsRoute,
});

function AccountSettingsRoute() {
  return (
    <ProtectedRoute>
      <AccountSettings />
    </ProtectedRoute>
  );
}

function AccountSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword("");
    setMessage("Password updated.");
  }

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <VSCodeShell
      tabs={[
        { id: "account", title: "account.settings.tsx", path: "/settings/account", icon: "coding" },
      ]}
      breadcrumbs={["vslearn", "settings", "account"]}
    >
      <div className="p-8 max-w-3xl">
        <div className="font-mono text-sm text-syntax-comment">// settings.account</div>
        <h1 className="text-3xl font-bold mt-1">Account settings</h1>
        <p className="text-muted-foreground mt-1">Manage your authenticated VSLearn session.</p>

        <section className="mt-8 border border-border bg-card rounded-md p-5">
          <div className="text-xs font-mono text-muted-foreground">Signed in as</div>
          <div className="font-mono mt-1">{user?.email}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Email verification: {user?.email_confirmed_at ? "verified" : "pending"}
          </div>
        </section>

        <form
          onSubmit={updatePassword}
          className="mt-6 border border-border bg-card rounded-md p-5 space-y-4"
        >
          <div>
            <h2 className="font-semibold">Change password</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Use this after a password recovery link or while signed in.
            </p>
          </div>
          <label className="block">
            <div className="text-xs font-mono text-muted-foreground mb-1">New password</div>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
            />
          </label>
          {error && <Status tone="error">{error}</Status>}
          {message && <Status>{message}</Status>}
          <button
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <section className="mt-6 border border-border bg-card rounded-md p-5">
          <h2 className="font-semibold">Session</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="border border-border bg-secondary px-4 py-2 rounded-md text-sm hover:bg-accent"
            >
              Back to dashboard
            </Link>
            <button
              onClick={logout}
              className="border border-destructive text-destructive px-4 py-2 rounded-md text-sm hover:bg-destructive/10"
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </VSCodeShell>
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
