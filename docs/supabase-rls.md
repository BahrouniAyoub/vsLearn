# Supabase RLS Policies

This project uses PostgreSQL Row Level Security for least-privilege access when the browser talks directly to Supabase with the anon key.

## Assumptions

- `public.users.id` must match `auth.users.id` from Supabase Auth.
- Browser requests use the Supabase anon key plus an authenticated user JWT when signed in.
- Server-side trusted jobs use the Supabase service role key and bypass RLS only when required.
- Course authoring and administrative operations require an active row in `public.admin_users` with `revoked_at IS NULL`.
- Secret challenge test cases in `lesson_tests` are not readable by public or student clients.

## Helper Functions

- `app_private.current_user_id()` returns `auth.uid()`.
- `app_private.is_authenticated()` returns true only for authenticated JWT requests.
- `app_private.is_admin()` checks `public.admin_users` for the current user.

The helper schema is revoked from `PUBLIC`; only explicit execution grants are provided to `anon` and `authenticated` roles.

## Policy Summary

- Users can read their own `users` row; admins can manage users.
- Profiles are publicly readable, but users can only insert/update/delete their own profile.
- Published courses, modules, lessons, lesson files, projects, and active badges are readable publicly.
- Only admins can insert/update/delete course content, modules, lessons, lesson files, lesson tests, projects, badges, certificates, admin users, and audit logs.
- Comments require authentication for reads and writes. Users can manage their own comments; admins can moderate all comments.
- Progress rows belong to users. Users can insert/update/delete only their own progress; admins can manage all progress.
- Submissions belong to users. Users can insert/read only their own submissions; score, status, and test-result updates are admin/server-side only.
- Issued certificates are publicly readable for verification pages. Certificate writes are admin-only.
- Notifications are private to the recipient; admins can manage notifications.
- Audit logs are admin-readable and admin-insertable only.

## Operational Notes

- Run migrations with a privileged database connection: `npm run db:migrate`.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Keep writes that require elevated privileges on the server.
- If adding tables, enable RLS immediately and add explicit policies before exposing them to clients.
- If adding new content status values, review public read policies before deploying.
- `drizzle/0002_auth_profile_trigger.sql` creates `public.users` and `public.profiles` rows automatically after Supabase Auth signup.
