-- Add flags for dishes
ALTER TABLE "public"."dishes" ADD COLUMN "is_homemade" boolean DEFAULT false;
ALTER TABLE "public"."dishes" ADD COLUMN "is_frozen" boolean DEFAULT false;

-- Modify view (if needed, but 'select *' in views usually needs manual update if explicit columns are used, 
-- but 'menu_with_allergens' view might check specific columns? Let's check schema.
-- view menu_with_allergens seems to select specific columns. I should likely update it too if I want these exposed in the view.
-- The prompt didn't strictly say to update the view, but good practice.
-- However, reviewing `database.ts` (View: menu_with_allergens), it lists specific columns. 
-- For now, I will just add columns to the table. The app queries `dishes` table directly in dashboard.
-- Public page might query details.
