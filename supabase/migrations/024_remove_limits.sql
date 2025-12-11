-- Remove limits on dishes and categories

-- 1. Drop Triggers
DROP TRIGGER IF EXISTS enforce_dish_limit ON public.dishes;
DROP TRIGGER IF EXISTS enforce_category_limit ON public.categories;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS check_dish_limit();
DROP FUNCTION IF EXISTS check_category_limit();

-- 3. Drop Columns from tenants table
ALTER TABLE public.tenants DROP COLUMN IF EXISTS max_dishes;
ALTER TABLE public.tenants DROP COLUMN IF EXISTS max_categories;
