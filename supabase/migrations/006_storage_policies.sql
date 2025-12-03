-- Create dishes bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('dishes', 'dishes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public read access
DROP POLICY IF EXISTS "Public read access to dish images" ON storage.objects;
CREATE POLICY "Public read access to dish images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dishes');

-- Policy: Tenant owners can upload to their specific folder
-- Path: [slug]/immagini piatti/[filename]
DROP POLICY IF EXISTS "Tenant owners can upload dish images" ON storage.objects;
CREATE POLICY "Tenant owners can upload dish images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'immagini piatti'
  );

-- Policy: Tenant owners can update their images
DROP POLICY IF EXISTS "Tenant owners can update dish images" ON storage.objects;
CREATE POLICY "Tenant owners can update dish images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'immagini piatti'
  )
  WITH CHECK (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'immagini piatti'
  );

-- Policy: Tenant owners can delete their images
DROP POLICY IF EXISTS "Tenant owners can delete dish images" ON storage.objects;
CREATE POLICY "Tenant owners can delete dish images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
    AND (storage.foldername(name))[2] = 'immagini piatti'
  );
