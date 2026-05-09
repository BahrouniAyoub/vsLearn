import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { ProtectedRoute, useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  getOwnProfile,
  normalizeUsername,
  uploadAvatar,
  type ProfileVisibility,
} from "@/lib/profile";
import { VSCodeShell } from "@/components/vscode/VSCodeShell";

export const Route = createFileRoute("/settings/profile")({
  head: () => ({
    meta: [
      { title: "Profile settings - VSLearn" },
      { name: "description", content: "Edit your VSLearn public profile." },
    ],
  }),
  component: ProfileSettingsRoute,
});

function ProfileSettingsRoute() {
  return (
    <ProtectedRoute>
      <ProfileSettings />
    </ProtectedRoute>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ProfileVisibility>("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getOwnProfile(user.id)
      .then((profile) => {
        setDisplayName(profile?.display_name ?? user.email?.split("@")[0] ?? "Learner");
        setUsername(profile?.username ?? "");
        setBio(profile?.bio ?? "");
        setWebsiteUrl(profile?.website_url ?? "");
        setLocation(profile?.location ?? "");
        setAvatarUrl(profile?.avatar_url ?? null);
        setVisibility(profile?.visibility ?? "public");
      })
      .catch((profileError: Error) => setError(profileError.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setSaving(true);
    setError(null);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      setAvatarUrl(publicUrl);
      setMessage("Avatar uploaded. Save your profile to keep it.");
    } catch (avatarError) {
      setError(avatarError instanceof Error ? avatarError.message : "Could not upload avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const nextUsername = normalizeUsername(username);
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: displayName.trim(),
        username: nextUsername || null,
        bio: bio.trim() || null,
        website_url: websiteUrl.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl,
        visibility,
      },
      { onConflict: "user_id" },
    );

    setSaving(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setUsername(nextUsername);
    setMessage("Profile saved.");
  }

  return (
    <VSCodeShell
      tabs={[
        {
          id: "profile-settings",
          title: "profile.settings.tsx",
          path: "/settings/profile",
          icon: "coding",
        },
      ]}
      breadcrumbs={["vslearn", "settings", "profile"]}
    >
      <div className="p-8 max-w-4xl">
        <div className="font-mono text-sm text-syntax-comment">// settings.profile</div>
        <h1 className="text-3xl font-bold mt-1">Profile settings</h1>
        <p className="text-muted-foreground mt-1">
          Control your public VSLearn identity and portfolio.
        </p>

        {loading ? (
          <div className="mt-8 font-mono text-sm text-muted-foreground">profile.load()</div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-[220px_1fr] gap-6">
            <aside className="border border-border bg-card rounded-md p-5 h-fit">
              <div className="size-28 rounded-md bg-secondary border border-border overflow-hidden flex items-center justify-center text-3xl font-mono">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="size-full object-cover" />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <label className="mt-4 block">
                <div className="text-xs font-mono text-muted-foreground mb-1">Avatar</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="text-xs text-muted-foreground"
                />
              </label>
              {username && (
                <Link
                  to="/profile/$username"
                  params={{ username }}
                  className="mt-4 inline-flex text-sm text-primary hover:underline"
                >
                  View public profile
                </Link>
              )}
            </aside>

            <section className="border border-border bg-card rounded-md p-5 space-y-5">
              <Field
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
              <Field
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="ada-lovelace"
                pattern="[a-zA-Z0-9_-]+"
              />
              <label className="block">
                <div className="text-xs font-mono text-muted-foreground mb-1">Bio</div>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={5}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Website"
                  type="url"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
                <Field
                  label="Location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
              <label className="block">
                <div className="text-xs font-mono text-muted-foreground mb-1">
                  Profile visibility
                </div>
                <select
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as ProfileVisibility)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>

              {error && <Status tone="error">{error}</Status>}
              {message && <Status>{message}</Status>}

              <button
                disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </section>
          </form>
        )}
      </div>
    </VSCodeShell>
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
