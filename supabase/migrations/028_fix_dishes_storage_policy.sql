-- Fix storage policies for dishes bucket to allow new folder structure
-- Previous policies enforced folder name to match slug and 'immagini piatti'
-- New structure is 'restaurant-name-id/dishes/'

-- 1. Drop old restrictive policies
DROP POLICY IF EXISTS "Tenant owners can upload dish images" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can update dish images" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can delete dish images" ON storage.objects;

-- 2. Create new permissive policies for authenticated users
--    We trust the application logic to handle folder naming and cleanup.
--    This matches the strategy used for the 'logos' bucket in 027.

CREATE POLICY "Authenticated users can upload dish images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'dishes');

CREATE POLICY "Authenticated users can update dish images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'dishes')
WITH CHECK (bucket_id = 'dishes');

CREATE POLICY "Authenticated users can delete dish images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'dishes');

-- Ensure public read access is still there (it might be already, but safe to ensure)
DROP POLICY IF EXISTS "Public read access to dish images" ON storage.objects;
CREATE POLICY "Public read access to dish images"
ON storage.objects FOR SELECT
USING (bucket_id = 'dishes');
