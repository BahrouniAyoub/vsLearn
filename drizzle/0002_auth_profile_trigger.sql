CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  profile_name text;
BEGIN
  profile_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1),
    'Learner'
  );

  INSERT INTO public.users (id, email, email_verified_at)
  VALUES (NEW.id, NEW.email, NEW.email_confirmed_at)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified_at = EXCLUDED.email_verified_at,
    updated_at = now();

  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (NEW.id, profile_name, NULL)
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    updated_at = now();

  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    email_verified_at = NEW.email_confirmed_at,
    updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();--> statement-breakpoint
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;--> statement-breakpoint
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email, email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_updated();
