-- Migration 018: Fix and Finalize Language Migration
-- Handles inconsistent states (Text containing JSON or partially migrated data)

-- 1. Drop dependent view
DROP VIEW IF EXISTS public.menu_with_allergens;

-- Function to safely extract Italian text from JSON or return text
CREATE OR REPLACE FUNCTION extract_italian_text(input_val text) RETURNS text AS $$
DECLARE
  json_val jsonb;
BEGIN
  -- Try to parse as JSON
  BEGIN
    json_val := input_val::jsonb;
    -- If successful, extracting 'it' or 'en'
    RETURN COALESCE(json_val->>'it', json_val->>'en', input_val);
  EXCEPTION WHEN OTHERS THEN
    -- If not valid JSON, assume it's already the text we want
    RETURN input_val;
  END;
END;
$$ LANGUAGE plpgsql;

-- 2. Migrate Categories
DO $$
BEGIN
  -- Check if 'name' is already converted to simple text (not containing JSON structure)
  -- But we can't easily check 'simple text'. We rely on the function.
  
  -- We'll explicitly cast to text and use our function
  -- Note: If 'name' is JSON type, casting to text gives checking string.
  -- If 'name' is TEXT type, it gives the text.
  
  -- Update name
  UPDATE "public"."categories"
  SET "name" = extract_italian_text("name"::text);
  
  -- Update description
  UPDATE "public"."categories"
  SET "description" = extract_italian_text("description"::text);
  
  -- Determine if we need to alter type (if it was JSON)
  -- If column is already TEXT, this is a no-op or fine.
  -- If column is JSON, we need to alter it to TEXT.
  EXECUTE 'ALTER TABLE "public"."categories" ALTER COLUMN "name" TYPE text';
  EXECUTE 'ALTER TABLE "public"."categories" ALTER COLUMN "description" TYPE text';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error migrating categories: %', SQLERRM;
END $$;

-- 3. Migrate Dishes
DO $$
BEGIN
  UPDATE "public"."dishes"
  SET "name" = extract_italian_text("name"::text);
  
  UPDATE "public"."dishes"
  SET "description" = extract_italian_text("description"::text);
  
  EXECUTE 'ALTER TABLE "public"."dishes" ALTER COLUMN "name" TYPE text';
  EXECUTE 'ALTER TABLE "public"."dishes" ALTER COLUMN "description" TYPE text';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error migrating dishes: %', SQLERRM;
END $$;

-- 4. Migrate Allergens
DO $$
BEGIN
  UPDATE "public"."allergens"
  SET "name" = extract_italian_text("name"::text);
  
  UPDATE "public"."allergens"
  SET "description" = extract_italian_text("description"::text);
  
  EXECUTE 'ALTER TABLE "public"."allergens" ALTER COLUMN "name" TYPE text';
  EXECUTE 'ALTER TABLE "public"."allergens" ALTER COLUMN "description" TYPE text';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error migrating allergens: %', SQLERRM;
END $$;

-- 5. Cleanup Tenants
ALTER TABLE "public"."tenants" DROP COLUMN IF EXISTS "supported_languages";
ALTER TABLE "public"."tenants" DROP COLUMN IF EXISTS "default_language";

-- 6. Cleanup temporary columns (if leftover from previous failed runs)
ALTER TABLE "public"."categories" DROP COLUMN IF EXISTS "name_new";
ALTER TABLE "public"."categories" DROP COLUMN IF EXISTS "description_new";
ALTER TABLE "public"."dishes" DROP COLUMN IF EXISTS "name_new";
ALTER TABLE "public"."dishes" DROP COLUMN IF EXISTS "description_new";
ALTER TABLE "public"."allergens" DROP COLUMN IF EXISTS "name_new";
ALTER TABLE "public"."allergens" DROP COLUMN IF EXISTS "description_new";

-- 7. Cleanup helper function
DROP FUNCTION IF EXISTS extract_italian_text(text);

-- 8. Recreate View: menu_with_allergens
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
