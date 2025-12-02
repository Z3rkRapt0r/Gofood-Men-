-- ============================================================
-- SUPABASE STORAGE POLICIES
-- ============================================================
-- Version: 1.0.0
-- Description: Policies per bucket dishes e logos
-- Database: PostgreSQL (Supabase Storage)
-- ============================================================

-- NOTA: Questi comandi vanno eseguiti DOPO aver creato i bucket
-- tramite Supabase Dashboard o API

-- ============================================================
-- BUCKET CONFIGURATION
-- ============================================================

/*
BUCKET 1: dishes (PUBLIC)
- Description: Immagini piatti per menu
- Public: YES
- File size limit: 5 MB
- Allowed MIME types: image/jpeg, image/png, image/webp

Creazione tramite Dashboard:
Storage → New Bucket → Nome: "dishes" → Public: ON

Creazione tramite SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('dishes', 'dishes', true)
ON CONFLICT (id) DO NOTHING;

---

BUCKET 2: logos (PUBLIC)
- Description: Loghi ristoranti
- Public: YES
- File size limit: 2 MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/svg+xml

Creazione tramite Dashboard:
Storage → New Bucket → Nome: "logos" → Public: ON

Creazione tramite SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================
-- STORAGE STRUCTURE
-- ============================================================

/*
BUCKET: dishes/
├── {tenant_id_1}/
│   └── dishes/
│       ├── {dish_uuid_1}.jpg
│       ├── {dish_uuid_2}.png
│       └── {dish_uuid_3}.webp
└── {tenant_id_2}/
    └── dishes/
        └── ...

Pattern: {tenant_id}/dishes/{dish_id}.{ext}
Example: 550e8400-e29b-41d4-a716-446655440000/dishes/a1b2c3d4.jpg

---

BUCKET: logos/
├── {tenant_id_1}.png
├── {tenant_id_2}.jpg
└── ...

Pattern: {tenant_id}.{ext}
Example: 550e8400-e29b-41d4-a716-446655440000.png
*/

-- ============================================================
-- POLICIES: Bucket "dishes"
-- ============================================================

-- Policy 1: Pubblico può leggere tutte le immagini piatti
CREATE POLICY "Public read access to dish images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dishes');

-- Policy 2: Owner può uploadare solo nella propria cartella tenant
CREATE POLICY "Tenant owners can upload dish images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy 3: Owner può aggiornare solo le proprie immagini
CREATE POLICY "Tenant owners can update dish images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy 4: Owner può eliminare solo le proprie immagini
CREATE POLICY "Tenant owners can delete dish images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dishes'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: Bucket "logos"
-- ============================================================

-- Policy 1: Pubblico può leggere tutti i loghi
CREATE POLICY "Public read access to logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Policy 2: Owner può uploadare solo il proprio logo
-- Pattern: {tenant_id}.(jpg|png|webp|svg)
CREATE POLICY "Tenant owners can upload logo"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (
      -- Verifica che il nome file corrisponda al tenant_id dell'owner
      SUBSTRING(name FROM '^([0-9a-f-]+)\.(jpg|png|webp|svg)$') IN (
        SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
      )
    )
  );

-- Policy 3: Owner può aggiornare solo il proprio logo
CREATE POLICY "Tenant owners can update logo"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      SUBSTRING(name FROM '^([0-9a-f-]+)\.(jpg|png|webp|svg)$') IN (
        SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    bucket_id = 'logos'
    AND (
      SUBSTRING(name FROM '^([0-9a-f-]+)\.(jpg|png|webp|svg)$') IN (
        SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
      )
    )
  );

-- Policy 4: Owner può eliminare solo il proprio logo
CREATE POLICY "Tenant owners can delete logo"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (
      SUBSTRING(name FROM '^([0-9a-f-]+)\.(jpg|png|webp|svg)$') IN (
        SELECT id::text FROM public.tenants WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================================
-- ESEMPIO CODICE: Upload immagini da TypeScript
-- ============================================================

/*
// Upload dish image
async function uploadDishImage(
  tenantId: string,
  dishId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${tenantId}/dishes/${dishId}.${ext}`;

  const { data, error } = await supabase.storage
    .from('dishes')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true // Sostituisce se esiste
    });

  if (error) throw error;

  // Ottieni URL pubblico
  const { data: { publicUrl } } = supabase.storage
    .from('dishes')
    .getPublicUrl(path);

  return publicUrl;
}

// Upload logo
async function uploadLogo(
  tenantId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${tenantId}.${ext}`;

  const { data, error } = await supabase.storage
    .from('logos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(path);

  return publicUrl;
}

// Delete dish image
async function deleteDishImage(path: string) {
  const { error } = await supabase.storage
    .from('dishes')
    .remove([path]);

  if (error) throw error;
}

// Get public URL (no authentication needed for public buckets)
function getDishImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('dishes')
    .getPublicUrl(path);

  return data.publicUrl;
}
*/

-- ============================================================
-- TESTING STORAGE POLICIES
-- ============================================================

/*
-- Test 1: Utente non autenticato può leggere immagini
-- GET https://[project].supabase.co/storage/v1/object/public/dishes/[tenant_id]/dishes/[dish_id].jpg
-- Dovrebbe funzionare (public bucket)

-- Test 2: Owner autenticato può uploadare nella propria cartella
-- POST /storage/v1/object/dishes/[owned_tenant_id]/dishes/[dish_id].jpg
-- Dovrebbe avere successo

-- Test 3: Owner NON può uploadare in cartella di altro tenant
-- POST /storage/v1/object/dishes/[other_tenant_id]/dishes/[dish_id].jpg
-- Dovrebbe fallire con 403 Forbidden

-- Test 4: Owner può eliminare solo proprie immagini
-- DELETE /storage/v1/object/dishes/[owned_tenant_id]/dishes/[dish_id].jpg
-- Dovrebbe avere successo

-- Test 5: Owner NON può eliminare immagini di altri
-- DELETE /storage/v1/object/dishes/[other_tenant_id]/dishes/[dish_id].jpg
-- Dovrebbe fallire con 403 Forbidden
*/

-- ============================================================
-- IMAGE OPTIMIZATION (Optional)
-- ============================================================

/*
Supabase Storage Image Transformation:
Per ottimizzare le immagini, usa l'API di trasformazione:

URL originale:
https://[project].supabase.co/storage/v1/object/public/dishes/[path]

URL ottimizzato (800px width, 80% quality):
https://[project].supabase.co/storage/v1/render/image/public/dishes/[path]?width=800&quality=80

Parametri disponibili:
- width: larghezza in px
- height: altezza in px
- quality: 0-100 (default: 80)
- format: webp, avif (conversione automatica)

Esempio:
const optimizedUrl = `${publicUrl}?width=800&quality=80&format=webp`;
*/

-- ============================================================
-- CLEANUP: Rimozione file orfani (Optional)
-- ============================================================

/*
Script per trovare immagini non referenziate nel database:

-- Trova file in storage non referenziati da dishes.image_url
WITH storage_files AS (
  SELECT name FROM storage.objects WHERE bucket_id = 'dishes'
),
db_images AS (
  SELECT image_url FROM public.dishes
)
SELECT sf.name
FROM storage_files sf
LEFT JOIN db_images db ON db.image_url LIKE '%' || sf.name || '%'
WHERE db.image_url IS NULL;

-- Per eliminarle, usare funzione batch delete:
SELECT storage.delete_object('dishes', name)
FROM storage.objects
WHERE bucket_id = 'dishes'
AND name NOT IN (
  SELECT SUBSTRING(image_url FROM '[^/]+$')
  FROM public.dishes
  WHERE image_url IS NOT NULL
);
*/

-- ============================================================
-- FINE STORAGE POLICIES
-- ============================================================
