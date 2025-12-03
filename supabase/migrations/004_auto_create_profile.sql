-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================
-- Questo trigger crea automaticamente un profile quando un utente
-- si registra tramite Supabase Auth, bypassando le RLS policies.
-- ============================================================

-- Function per creare il profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che si attiva quando un nuovo utente viene creato in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Commento esplicativo
COMMENT ON FUNCTION public.handle_new_user() IS
'Automatically creates a profile in public.profiles when a new user signs up via Supabase Auth. Uses SECURITY DEFINER to bypass RLS policies.';
