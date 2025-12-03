-- Drop triggers that enforce limits
DROP TRIGGER IF EXISTS enforce_dish_limit ON public.dishes;
DROP TRIGGER IF EXISTS enforce_category_limit ON public.categories;

-- Drop functions that check limits
DROP FUNCTION IF EXISTS check_dish_limit();
DROP FUNCTION IF EXISTS check_category_limit();

-- Optional: Update existing tenants to have high limits (just in case code still checks them)
UPDATE public.tenants
SET max_dishes = 9999,
    max_categories = 9999;
