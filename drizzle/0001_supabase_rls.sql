CREATE SCHEMA IF NOT EXISTS app_private;--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid()
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_private.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'authenticated' AND auth.uid() IS NOT NULL
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.revoked_at IS NULL
  )
$$;--> statement-breakpoint
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;--> statement-breakpoint
GRANT USAGE ON SCHEMA app_private TO authenticated, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_private.current_user_id() TO authenticated, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_private.is_authenticated() TO authenticated, anon;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO authenticated, anon;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "modules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lesson_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lesson_tests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "certificates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "badges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_badges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "users_can_read_own_user" ON "users" FOR SELECT TO authenticated USING (id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_users" ON "users" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "profiles_are_public_readable" ON "profiles" FOR SELECT TO anon, authenticated USING (true);--> statement-breakpoint
CREATE POLICY "users_can_insert_own_profile" ON "profiles" FOR INSERT TO authenticated WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_update_own_profile" ON "profiles" FOR UPDATE TO authenticated USING (user_id = app_private.current_user_id()) WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_delete_own_profile" ON "profiles" FOR DELETE TO authenticated USING (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "admins_can_manage_profiles" ON "profiles" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_published_courses" ON "courses" FOR SELECT TO anon, authenticated USING (status = 'published' OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_courses" ON "courses" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_published_modules" ON "modules" FOR SELECT TO anon, authenticated USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM "courses" c WHERE c.id = modules.course_id AND c.status = 'published'
  )
);--> statement-breakpoint
CREATE POLICY "admins_can_manage_modules" ON "modules" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_published_lessons" ON "lessons" FOR SELECT TO anon, authenticated USING (
  is_published = true
  AND EXISTS (
    SELECT 1
    FROM "modules" m
    JOIN "courses" c ON c.id = m.course_id
    WHERE m.id = lessons.module_id
      AND m.is_published = true
      AND c.status = 'published'
  )
);--> statement-breakpoint
CREATE POLICY "admins_can_manage_lessons" ON "lessons" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_published_lesson_files" ON "lesson_files" FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1
    FROM "lessons" l
    JOIN "modules" m ON m.id = l.module_id
    JOIN "courses" c ON c.id = m.course_id
    WHERE l.id = lesson_files.lesson_id
      AND l.is_published = true
      AND m.is_published = true
      AND c.status = 'published'
  )
);--> statement-breakpoint
CREATE POLICY "admins_can_manage_lesson_files" ON "lesson_files" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_read_lesson_tests" ON "lesson_tests" FOR SELECT TO authenticated USING (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_lesson_tests" ON "lesson_tests" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_published_projects" ON "projects" FOR SELECT TO anon, authenticated USING (
  is_published = true
  AND (
    course_id IS NULL
    OR EXISTS (SELECT 1 FROM "courses" c WHERE c.id = projects.course_id AND c.status = 'published')
  )
);--> statement-breakpoint
CREATE POLICY "admins_can_manage_projects" ON "projects" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_read_own_submissions" ON "submissions" FOR SELECT TO authenticated USING (user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_insert_own_submissions" ON "submissions" FOR INSERT TO authenticated WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "admins_can_manage_submissions" ON "submissions" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_read_own_progress" ON "progress" FOR SELECT TO authenticated USING (user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_insert_own_progress" ON "progress" FOR INSERT TO authenticated WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_update_own_progress" ON "progress" FOR UPDATE TO authenticated USING (user_id = app_private.current_user_id()) WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_delete_own_progress" ON "progress" FOR DELETE TO authenticated USING (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "admins_can_manage_progress" ON "progress" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_valid_certificates" ON "certificates" FOR SELECT TO anon, authenticated USING (status = 'issued');--> statement-breakpoint
CREATE POLICY "admins_can_manage_certificates" ON "certificates" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "public_can_read_active_badges" ON "badges" FOR SELECT TO anon, authenticated USING (is_active = true OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_badges" ON "badges" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_read_own_badges" ON "user_badges" FOR SELECT TO authenticated USING (user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_user_badges" ON "user_badges" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "authenticated_can_read_visible_comments" ON "comments" FOR SELECT TO authenticated USING (is_deleted = false OR user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "authenticated_can_insert_own_comments" ON "comments" FOR INSERT TO authenticated WITH CHECK (user_id = app_private.current_user_id() AND is_deleted = false);--> statement-breakpoint
CREATE POLICY "users_can_update_own_comments" ON "comments" FOR UPDATE TO authenticated USING (user_id = app_private.current_user_id()) WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_delete_own_comments" ON "comments" FOR DELETE TO authenticated USING (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "admins_can_manage_comments" ON "comments" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_read_own_notifications" ON "notifications" FOR SELECT TO authenticated USING (user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
CREATE POLICY "users_can_update_own_notifications" ON "notifications" FOR UPDATE TO authenticated USING (user_id = app_private.current_user_id()) WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "admins_can_manage_notifications" ON "notifications" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_read_admin_users" ON "admin_users" FOR SELECT TO authenticated USING (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_manage_admin_users" ON "admin_users" FOR ALL TO authenticated USING (app_private.is_admin()) WITH CHECK (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_read_audit_logs" ON "audit_logs" FOR SELECT TO authenticated USING (app_private.is_admin());--> statement-breakpoint
CREATE POLICY "admins_can_insert_audit_logs" ON "audit_logs" FOR INSERT TO authenticated WITH CHECK (app_private.is_admin());
