-- Definitive Fix for Logos Storage Policy
-- Previous policies might have been too restrictive regarding folder names matching slugs
-- or missing UPDATE permissions for upserts.

-- 1. Enable RLS on objects (REMOVED: causes permission error 42501, usually already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop all conflicting policies for the 'logos' bucket to start fresh
DROP POLICY IF EXISTS "Give public access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Acces to logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Logos" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Tenant owners can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes on logos" ON storage.objects;

-- 3. Re-create simplified and permissive policies for authenticated users

-- PUBLIC READ: Everyone can view logos
CREATE POLICY "Public Read Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- AUTHENTICATED INSERT: Any logged-in user can upload to 'logos'
-- We removed the strict folder-slug match check to prevent errors during onboarding
-- when slug might be in flux or different from what DB expects.
CREATE POLICY "Authenticated Insert Logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'logos' );

-- AUTHENTICATED UPDATE: Needed for upsert: true
CREATE POLICY "Authenticated Update Logos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'logos' );

-- AUTHENTICATED DELETE: Allow users to delete files (e.g. replacing logo)
CREATE POLICY "Authenticated Delete Logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'logos' );
