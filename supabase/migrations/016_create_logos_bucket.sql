-- Create logos bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public read access
DROP POLICY IF EXISTS "Public read access to logos" ON storage.objects;
CREATE POLICY "Public read access to logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Policy: Tenant owners can upload to their specific folder
-- Path: [slug]/[filename]
DROP POLICY IF EXISTS "Tenant owners can upload logos" ON storage.objects;
CREATE POLICY "Tenant owners can upload logos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy: Tenant owners can update their logos
DROP POLICY IF EXISTS "Tenant owners can update logos" ON storage.objects;
CREATE POLICY "Tenant owners can update logos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy: Tenant owners can delete their logos
DROP POLICY IF EXISTS "Tenant owners can delete logos" ON storage.objects;
CREATE POLICY "Tenant owners can delete logos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] IN (
      SELECT slug FROM public.tenants WHERE owner_id = auth.uid()
    )
  );
