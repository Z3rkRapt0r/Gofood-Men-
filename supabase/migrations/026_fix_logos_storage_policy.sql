-- Create a new migration to ensure proper RLS policies for the 'logos' bucket
-- This is necessary because the previous policies might have been restrictive or missing
-- for the specific 'insert' operation during onboarding.

-- Ensure the bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for SELECT: Allow public access to view logos
DROP POLICY IF EXISTS "Give public access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Acces to logos" ON storage.objects; -- potential typo in old migrations

CREATE POLICY "Public Access to Logos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'logos' );

-- Policy for INSERT: Allow authenticated users to upload logos
DROP POLICY IF EXISTS "Allow authenticated uploads to logos" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] <> 'private' -- Optional: prevents uploading to a 'private' folder if one existed
);

-- Policy for UPDATE: Allow users to update their own files (optional, but good practice)
-- Note: This is tricky with random filenames, but generally we want Insert mainly.
-- Checking owner might be required if we track ownership in metadata.
-- For now, INSERT is the critical one failing.

-- Policy for DELETE: Allow users to delete their own files 
-- (Assuming they know the path or we trust authenticated users for this bucket scope)
DROP POLICY IF EXISTS "Allow authenticated deletes on logos" ON storage.objects;

CREATE POLICY "Allow authenticated deletes on logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'logos' );
