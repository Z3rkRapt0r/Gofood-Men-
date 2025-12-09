-- Migration 019: Optimize Allergens Schema
-- Remove many-to-many table and use array column in dishes

-- 1. Add array column to dishes
ALTER TABLE "public"."dishes" ADD COLUMN "allergen_ids" TEXT[] DEFAULT '{}';

-- 2. Migrate existing data
-- We aggregate the allergen_ids from the join table into the array
WITH agg AS (
    SELECT dish_id, array_agg(allergen_id) as ids
    FROM "public"."dish_allergens"
    GROUP BY dish_id
)
UPDATE "public"."dishes" d
SET "allergen_ids" = agg.ids
FROM agg
WHERE d.id = agg.dish_id;

-- 3. Drop the join table
DROP TABLE "public"."dish_allergens";

-- 4. Update the View to use the new column
-- We want to maintain the 'allergens' JSON output for the frontend
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
  d.allergen_ids, -- Include specific IDs column
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
      FROM public.allergens a
      WHERE a.id = ANY(d.allergen_ids)
    ),
    '[]'::json
  ) AS allergens
FROM public.dishes d
JOIN public.categories c ON d.category_id = c.id
ORDER BY c.display_order, d.display_order;
