-- Migration 031: Add AI Data Column to Dishes
-- Purpose: Persist AI analysis rationale and metadata

ALTER TABLE "public"."dishes"
ADD COLUMN IF NOT EXISTS "ai_data" JSONB DEFAULT NULL;

COMMENT ON COLUMN "public"."dishes"."ai_data" IS 'Stores AI analysis results: { rationale, confidence, needs_review, last_scan, allergens_detected }';

-- Update the View to include the new column
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
  d.is_homemade,
  d.is_frozen,
  d.display_order AS dish_order,
  d.allergen_ids,
  d.ai_data, -- Added new column
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
