-- Migration 017: Convert JSON language fields to String (keeping Italian) and handle View dependency

-- 1. Drop dependent view
DROP VIEW IF EXISTS public.menu_with_allergens;

-- 2. Migrate Categories
ALTER TABLE "public"."categories" ADD COLUMN "name_new" text;
ALTER TABLE "public"."categories" ADD COLUMN "description_new" text;

UPDATE "public"."categories"
SET
  "name_new" = COALESCE("name"->>'it', "name"->>'en', "name"::text),
  "description_new" = COALESCE("description"->>'it', "description"->>'en', "description"::text);

ALTER TABLE "public"."categories" DROP COLUMN "name";
ALTER TABLE "public"."categories" DROP COLUMN "description";
ALTER TABLE "public"."categories" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "public"."categories" RENAME COLUMN "description_new" TO "description";

-- 3. Migrate Dishes
ALTER TABLE "public"."dishes" ADD COLUMN "name_new" text;
ALTER TABLE "public"."dishes" ADD COLUMN "description_new" text;

UPDATE "public"."dishes"
SET
  "name_new" = COALESCE("name"->>'it', "name"->>'en', "name"::text),
  "description_new" = COALESCE("description"->>'it', "description"->>'en', "description"::text);

ALTER TABLE "public"."dishes" DROP COLUMN "name";
ALTER TABLE "public"."dishes" DROP COLUMN "description";
ALTER TABLE "public"."dishes" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "public"."dishes" RENAME COLUMN "description_new" TO "description";

-- 4. Migrate Allergens
ALTER TABLE "public"."allergens" ADD COLUMN "name_new" text;
ALTER TABLE "public"."allergens" ADD COLUMN "description_new" text;

UPDATE "public"."allergens"
SET
  "name_new" = COALESCE("name"->>'it', "name"->>'en', "name"::text),
  "description_new" = COALESCE("description"->>'it', "description"->>'en', "description"::text);

ALTER TABLE "public"."allergens" DROP COLUMN "name";
ALTER TABLE "public"."allergens" DROP COLUMN "description";
ALTER TABLE "public"."allergens" RENAME COLUMN "name_new" TO "name";
ALTER TABLE "public"."allergens" RENAME COLUMN "description_new" TO "description";

-- 5. Cleanup Tenants (remove legacy columns)
ALTER TABLE "public"."tenants" DROP COLUMN IF EXISTS "supported_languages";
ALTER TABLE "public"."tenants" DROP COLUMN IF EXISTS "default_language";

-- 6. Recreate View: menu_with_allergens
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
