-- Make slug nullable to allow empty slug on registration
ALTER TABLE public.tenants ALTER COLUMN slug DROP NOT NULL;
