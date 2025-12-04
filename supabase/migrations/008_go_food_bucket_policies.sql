-- ============================================================
-- STORAGE POLICIES FOR "Loghi Ristoratori" BUCKET
-- ============================================================

-- 1. Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('Loghi Ristoratori', 'Loghi Ristoratori', true)
ON CONFLICT (id) DO NOTHING;

-- Force the bucket to be public (in case it was created manually as private)
UPDATE storage.buckets
SET public = true
WHERE id = 'Loghi Ristoratori';

-- 2. Policy: Public Read Access
-- Anyone can read files from the "Loghi Ristoratori" bucket
DROP POLICY IF EXISTS "Public read access to Loghi Ristoratori" ON storage.objects;
CREATE POLICY "Public read access to Loghi Ristoratori"
ON storage.objects FOR SELECT
USING (bucket_id = 'Loghi Ristoratori');

-- 3. Policy: Tenant Owner Upload (Insert)
-- Allow authenticated users to upload files to "Loghi Ristoratori" bucket
-- ONLY if the top-level folder name matches their restaurant slug
DROP POLICY IF EXISTS "Tenant owners can upload to Loghi Ristoratori" ON storage.objects;
CREATE POLICY "Tenant owners can upload to Loghi Ristoratori"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'Loghi Ristoratori' AND
  (storage.foldername(name))[1] IN (
    SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
  )
);

-- 4. Policy: Tenant Owner Update
-- Allow authenticated users to update files in their folder
DROP POLICY IF EXISTS "Tenant owners can update Loghi Ristoratori" ON storage.objects;
CREATE POLICY "Tenant owners can update Loghi Ristoratori"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'Loghi Ristoratori' AND
  (storage.foldername(name))[1] IN (
    SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'Loghi Ristoratori' AND
  (storage.foldername(name))[1] IN (
    SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
  )
);

-- 5. Policy: Tenant Owner Delete
-- Allow authenticated users to delete files in their folder
DROP POLICY IF EXISTS "Tenant owners can delete from Loghi Ristoratori" ON storage.objects;
CREATE POLICY "Tenant owners can delete from Loghi Ristoratori"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'Loghi Ristoratori' AND
  (storage.foldername(name))[1] IN (
    SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
  )
);
