-- ============================================================
-- SCHEMA DATABASE: MULTI-TENANT RESTAURANT MENU BUILDER
-- ============================================================
-- Version: 1.0.0
-- Description: Schema completo per piattaforma SaaS multi-tenant
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Per fuzzy text search

-- ============================================================
-- TABELLA: profiles
-- Descrizione: Profili utenti collegati a Supabase Auth
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id)';

-- ============================================================
-- TABELLA: tenants
-- Descrizione: Ristoranti (tenant multi-tenant)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Business information
  restaurant_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Contact information
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'IT',

  -- Branding personalizzabile
  logo_url TEXT,
  primary_color TEXT DEFAULT '#8B0000',
  secondary_color TEXT DEFAULT '#D4AF37',

  -- Menu settings
  default_language TEXT NOT NULL DEFAULT 'it' CHECK (default_language IN ('it', 'en')),
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['it', 'en'],
  currency TEXT NOT NULL DEFAULT 'EUR',
  cover_charge DECIMAL(10,2) DEFAULT 2.50,

  -- Subscription
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
  max_dishes INTEGER NOT NULL DEFAULT 50,
  max_categories INTEGER NOT NULL DEFAULT 10,

  -- Onboarding wizard tracking
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE public.tenants IS 'Restaurant tenants - each restaurant is isolated';
COMMENT ON COLUMN public.tenants.slug IS 'URL-friendly identifier for menu access (path-based: /magna-roma)';
COMMENT ON COLUMN public.tenants.logo_url IS 'Custom logo URL from Supabase Storage';
COMMENT ON COLUMN public.tenants.primary_color IS 'Custom primary brand color (hex)';
COMMENT ON COLUMN public.tenants.secondary_color IS 'Custom secondary brand color (hex)';
COMMENT ON COLUMN public.tenants.max_dishes IS 'Subscription tier limit on number of dishes';
COMMENT ON COLUMN public.tenants.onboarding_completed IS 'Setup wizard completion status';

-- Indexes
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);

-- ============================================================
-- TABELLA: allergens
-- Descrizione: Allergeni globali (EU Regulation 1169/2011)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.allergens (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 14),
  icon TEXT NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: JSONB deve avere traduzioni IT e EN
  CONSTRAINT name_has_translations CHECK (
    name ? 'it' AND name ? 'en'
  )
);

COMMENT ON TABLE public.allergens IS 'Global allergen reference data - EU Regulation 1169/2011';
COMMENT ON COLUMN public.allergens.name IS 'Bilingual name: {"it": "...", "en": "..."}';
COMMENT ON COLUMN public.allergens.description IS 'Bilingual description: {"it": "...", "en": "..."}';

-- ============================================================
-- TABELLA: categories
-- Descrizione: Categorie menu (Antipasti, Primi, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Category data (JSONB per traduzioni)
  name JSONB NOT NULL,
  slug TEXT NOT NULL,
  description JSONB,

  -- Display settings
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT name_has_translations CHECK (
    name ? 'it' AND name ? 'en'
  ),
  CONSTRAINT unique_tenant_slug UNIQUE (tenant_id, slug)
);

COMMENT ON TABLE public.categories IS 'Menu categories - tenant-isolated';
COMMENT ON COLUMN public.categories.name IS 'Bilingual name: {"it": "Antipasti", "en": "Appetizers"}';
COMMENT ON COLUMN public.categories.display_order IS 'Order for displaying categories (lower = first)';

-- Indexes
CREATE INDEX idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX idx_categories_tenant_order ON public.categories(tenant_id, display_order);

-- ============================================================
-- TABELLA: dishes
-- Descrizione: Piatti individuali del menu
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,

  -- Dish data (JSONB per traduzioni)
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  slug TEXT NOT NULL,

  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- Image
  image_url TEXT,

  -- Flags
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_seasonal BOOLEAN NOT NULL DEFAULT FALSE,
  seasonal_note JSONB,
  is_gluten_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
  is_vegan BOOLEAN NOT NULL DEFAULT FALSE,

  -- Display order
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT name_has_translations CHECK (
    name ? 'it' AND name ? 'en'
  ),
  CONSTRAINT description_has_translations CHECK (
    description ? 'it' AND description ? 'en'
  ),
  CONSTRAINT unique_tenant_category_slug UNIQUE (tenant_id, category_id, slug)
);

COMMENT ON TABLE public.dishes IS 'Menu dishes - tenant-isolated';
COMMENT ON COLUMN public.dishes.name IS 'Bilingual name: {"it": "Carbonara", "en": "Carbonara"}';
COMMENT ON COLUMN public.dishes.description IS 'Bilingual description: {"it": "...", "en": "..."}';
COMMENT ON COLUMN public.dishes.price IS 'Price in currency (DECIMAL for precision)';
COMMENT ON COLUMN public.dishes.image_url IS 'Full Supabase Storage URL';
COMMENT ON COLUMN public.dishes.is_seasonal IS 'Shows seasonal placeholder if true';
COMMENT ON COLUMN public.dishes.display_order IS 'Order within category (lower = first)';

-- Indexes
CREATE INDEX idx_dishes_tenant_id ON public.dishes(tenant_id);
CREATE INDEX idx_dishes_category_id ON public.dishes(category_id);
CREATE INDEX idx_dishes_tenant_category ON public.dishes(tenant_id, category_id);
CREATE INDEX idx_dishes_tenant_category_order ON public.dishes(tenant_id, category_id, display_order);
CREATE INDEX idx_dishes_visible ON public.dishes(tenant_id, is_visible) WHERE is_visible = TRUE;

-- Full-text search indexes
CREATE INDEX idx_dishes_name_gin ON public.dishes USING GIN ((name::text) gin_trgm_ops);
CREATE INDEX idx_dishes_description_gin ON public.dishes USING GIN ((description::text) gin_trgm_ops);

-- ============================================================
-- TABELLA: dish_allergens
-- Descrizione: Junction table many-to-many (dishes ↔ allergens)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dish_allergens (
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  allergen_id TEXT NOT NULL REFERENCES public.allergens(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (dish_id, allergen_id)
);

COMMENT ON TABLE public.dish_allergens IS 'Many-to-many relationship between dishes and allergens';

-- Indexes
CREATE INDEX idx_dish_allergens_dish_id ON public.dish_allergens(dish_id);
CREATE INDEX idx_dish_allergens_allergen_id ON public.dish_allergens(allergen_id);
CREATE INDEX idx_dish_allergens_tenant_id ON public.dish_allergens(tenant_id);

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Function: Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row update';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================

-- Function: Validate category belongs to same tenant as dish
CREATE OR REPLACE FUNCTION check_category_tenant_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.categories
    WHERE id = NEW.category_id AND tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'Category does not belong to the same tenant as the dish';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_category_tenant_match() IS 'Ensures category belongs to same tenant before dish insert/update';

CREATE TRIGGER enforce_category_tenant_match
  BEFORE INSERT OR UPDATE ON public.dishes
  FOR EACH ROW EXECUTE FUNCTION check_category_tenant_match();

-- ============================================================

-- Function: Auto-populate tenant_id in dish_allergens from dish
CREATE OR REPLACE FUNCTION populate_dish_allergen_tenant()
RETURNS TRIGGER AS $$
BEGIN
  SELECT tenant_id INTO NEW.tenant_id
  FROM public.dishes WHERE id = NEW.dish_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION populate_dish_allergen_tenant() IS 'Automatically populates tenant_id from related dish';

CREATE TRIGGER auto_populate_tenant_id
  BEFORE INSERT ON public.dish_allergens
  FOR EACH ROW EXECUTE FUNCTION populate_dish_allergen_tenant();

-- ============================================================

-- Function: Enforce dish limit based on subscription tier
CREATE OR REPLACE FUNCTION check_dish_limit()
RETURNS TRIGGER AS $$
DECLARE
  dish_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO dish_count
  FROM public.dishes WHERE tenant_id = NEW.tenant_id;

  SELECT max_dishes INTO max_allowed
  FROM public.tenants WHERE id = NEW.tenant_id;

  IF dish_count >= max_allowed THEN
    RAISE EXCEPTION 'Dish limit reached (max: %)', max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_dish_limit() IS 'Enforces subscription tier dish limit';

CREATE TRIGGER enforce_dish_limit
  BEFORE INSERT ON public.dishes
  FOR EACH ROW EXECUTE FUNCTION check_dish_limit();

-- ============================================================

-- Function: Enforce category limit based on subscription tier
CREATE OR REPLACE FUNCTION check_category_limit()
RETURNS TRIGGER AS $$
DECLARE
  category_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM public.categories WHERE tenant_id = NEW.tenant_id;

  SELECT max_categories INTO max_allowed
  FROM public.tenants WHERE id = NEW.tenant_id;

  IF category_count >= max_allowed THEN
    RAISE EXCEPTION 'Category limit reached (max: %)', max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_category_limit() IS 'Enforces subscription tier category limit';

CREATE TRIGGER enforce_category_limit
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION check_category_limit();

-- ============================================================
-- VIEWS (Optional: Query helpers)
-- ============================================================

-- View: Complete menu with allergens
CREATE OR REPLACE VIEW public.menu_with_allergens AS
SELECT
  d.id AS dish_id,
  d.tenant_id,
  d.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  c.display_order AS category_order,
  d.name AS dish_name,
  d.description,
  d.slug AS dish_slug,
  d.price,
  d.image_url,
  d.is_visible,
  d.is_seasonal,
  d.seasonal_note,
  d.is_gluten_free,
  d.is_vegetarian,
  d.is_vegan,
  d.display_order AS dish_order,
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'id', a.id,
          'number', a.number,
          'icon', a.icon,
          'name', a.name,
          'description', a.description
        )
      )
      FROM public.dish_allergens da
      JOIN public.allergens a ON da.allergen_id = a.id
      WHERE da.dish_id = d.id
    ),
    '[]'::json
  ) AS allergens
FROM public.dishes d
JOIN public.categories c ON d.category_id = c.id
ORDER BY c.display_order, d.display_order;

COMMENT ON VIEW public.menu_with_allergens IS 'Complete menu view with embedded allergen data for easy querying';

-- ============================================================
-- FINE SCHEMA
-- ============================================================
