-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Version: 1.0.0
-- Description: Security policies per multi-tenancy e accesso pubblico
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- ============================================================
-- ABILITAZIONE RLS SU TUTTE LE TABELLE
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_allergens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: profiles
-- ============================================================

-- Utenti possono vedere solo il proprio profilo
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Utenti possono aggiornare solo il proprio profilo
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Utenti possono inserire solo il proprio profilo
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- POLICIES: tenants
-- ============================================================

-- Pubblico può leggere info ristoranti (per menu pubblico)
CREATE POLICY "Public read access to tenant info"
  ON public.tenants
  FOR SELECT
  USING (TRUE);

-- Utenti autenticati possono creare tenant (diventano owner)
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Owner può aggiornare il proprio tenant
CREATE POLICY "Owners can update own tenant"
  ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owner può eliminare il proprio tenant
CREATE POLICY "Owners can delete own tenant"
  ON public.tenants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============================================================
-- POLICIES: allergens (dati globali)
-- ============================================================

-- Tutti possono leggere gli allergeni (dati globali)
CREATE POLICY "Public read access to allergens"
  ON public.allergens
  FOR SELECT
  USING (TRUE);

-- Solo service_role può modificare gli allergeni (via migrations)
-- Non creiamo policies per INSERT/UPDATE/DELETE = solo service_role

-- ============================================================
-- POLICIES: categories
-- ============================================================

-- Pubblico può leggere categorie visibili
CREATE POLICY "Public read access to visible categories"
  ON public.categories
  FOR SELECT
  USING (is_visible = TRUE);

-- Owner può leggere tutte le proprie categorie (anche nascoste)
CREATE POLICY "Tenant owners can read own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può creare categorie nel proprio tenant
CREATE POLICY "Tenant owners can create categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può aggiornare le proprie categorie
CREATE POLICY "Tenant owners can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può eliminare le proprie categorie
CREATE POLICY "Tenant owners can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: dishes
-- ============================================================

-- Pubblico può leggere piatti visibili
CREATE POLICY "Public read access to visible dishes"
  ON public.dishes
  FOR SELECT
  USING (is_visible = TRUE);

-- Owner può leggere tutti i propri piatti (anche nascosti)
CREATE POLICY "Tenant owners can read own dishes"
  ON public.dishes
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può creare piatti nel proprio tenant
CREATE POLICY "Tenant owners can create dishes"
  ON public.dishes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può aggiornare i propri piatti
CREATE POLICY "Tenant owners can update own dishes"
  ON public.dishes
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può eliminare i propri piatti
CREATE POLICY "Tenant owners can delete own dishes"
  ON public.dishes
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: dish_allergens
-- ============================================================

-- Pubblico può leggere allergeni dei piatti visibili
CREATE POLICY "Public read access to dish allergens"
  ON public.dish_allergens
  FOR SELECT
  USING (
    dish_id IN (
      SELECT id FROM public.dishes WHERE is_visible = TRUE
    )
  );

-- Owner può leggere tutti gli allergeni dei propri piatti
CREATE POLICY "Tenant owners can read own dish allergens"
  ON public.dish_allergens
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può creare collegamenti allergen-piatto
CREATE POLICY "Tenant owners can create dish allergens"
  ON public.dish_allergens
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Owner può eliminare collegamenti allergen-piatto
CREATE POLICY "Tenant owners can delete dish allergens"
  ON public.dish_allergens
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- TESTING RLS POLICIES (query di verifica)
-- ============================================================

/*
-- Test 1: Utente non autenticato può vedere menu pubblico
SET ROLE anon;
SELECT * FROM public.dishes WHERE tenant_id = 'test-tenant-uuid';
-- Dovrebbe vedere solo dishes con is_visible = TRUE

-- Test 2: Owner può vedere tutti i suoi piatti
SET ROLE authenticated;
SET request.jwt.claim.sub = 'owner-user-uuid';
SELECT * FROM public.dishes WHERE tenant_id = 'owned-tenant-uuid';
-- Dovrebbe vedere tutti i piatti (inclusi hidden)

-- Test 3: Owner NON può vedere piatti di altri tenant
SELECT * FROM public.dishes WHERE tenant_id = 'other-tenant-uuid';
-- Dovrebbe tornare 0 righe

-- Test 4: Owner può creare piatto nel proprio tenant
INSERT INTO public.dishes (tenant_id, category_id, name, description, price, slug)
VALUES ('owned-tenant-uuid', 'category-uuid', '{"it":"Test","en":"Test"}', '{"it":"Desc","en":"Desc"}', 10.00, 'test');
-- Dovrebbe avere successo

-- Test 5: Owner NON può creare piatto in altro tenant
INSERT INTO public.dishes (tenant_id, category_id, name, description, price, slug)
VALUES ('other-tenant-uuid', 'category-uuid', '{"it":"Test","en":"Test"}', '{"it":"Desc","en":"Desc"}', 10.00, 'test');
-- Dovrebbe fallire con permission denied

-- Reset role
RESET ROLE;
*/

-- ============================================================
-- FINE POLICIES
-- ============================================================
