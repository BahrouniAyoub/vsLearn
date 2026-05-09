CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "visibility" "profile_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repository_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "demo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profiles_visibility_idx" ON "profiles" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "profiles_are_public_readable" ON "profiles";--> statement-breakpoint
CREATE POLICY "public_can_read_visible_profiles" ON "profiles" FOR SELECT TO anon, authenticated USING (visibility = 'public' OR user_id = app_private.current_user_id() OR app_private.is_admin());--> statement-breakpoint
DROP POLICY IF EXISTS "public_can_read_published_projects" ON "projects";--> statement-breakpoint
CREATE POLICY "public_can_read_published_projects" ON "projects" FOR SELECT TO anon, authenticated USING (
  is_published = true
  AND (
    course_id IS NULL
    OR EXISTS (SELECT 1 FROM "courses" c WHERE c.id = projects.course_id AND c.status = 'published')
  )
);--> statement-breakpoint
CREATE POLICY "users_can_insert_own_projects" ON "projects" FOR INSERT TO authenticated WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_update_own_projects" ON "projects" FOR UPDATE TO authenticated USING (user_id = app_private.current_user_id()) WITH CHECK (user_id = app_private.current_user_id());--> statement-breakpoint
CREATE POLICY "users_can_delete_own_projects" ON "projects" FOR DELETE TO authenticated USING (user_id = app_private.current_user_id());
