# 🗄️ Supabase Database Setup

Questa guida spiega come configurare il database Supabase per la piattaforma SaaS multi-tenant di menu digitali per ristoranti.

## 📋 Indice

1. [Prerequisiti](#prerequisiti)
2. [Setup Iniziale](#setup-iniziale)
3. [Esecuzione Migrations](#esecuzione-migrations)
4. [Configurazione Storage](#configurazione-storage)
5. [Testing & Verifica](#testing--verifica)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisiti

- Account Supabase (gratuito): https://supabase.com
- Progetto Supabase creato
- Accesso al SQL Editor nella dashboard Supabase

---

## Setup Iniziale

### 1. Crea un Nuovo Progetto Supabase

1. Vai su https://app.supabase.com
2. Clicca su **"New Project"**
3. Compila i campi:
   - **Name**: `menu-builder` (o nome a scelta)
   - **Database Password**: Genera password sicura (salvala!)
   - **Region**: Scegli la più vicina ai tuoi utenti (es: `Europe West (Frankfurt)`)
4. Clicca **"Create new project"**
5. Attendi ~2 minuti per il provisioning

### 2. Ottieni le Credenziali

Nella dashboard del progetto, vai su **Settings → API**:

- ✅ **Project URL**: `https://xxx.supabase.co`
- ✅ **anon public key**: `eyJ...` (chiave pubblica)
- ✅ **service_role key**: `eyJ...` (chiave segreta, **NON committare in git!**)

Salva queste credenziali in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Esecuzione Migrations

Le migrations vanno eseguite **in ordine** tramite SQL Editor.

### Step 1: Schema Database

1. Vai su **SQL Editor** nella sidebar Supabase
2. Clicca **"+ New query"**
3. Copia il contenuto di `migrations/001_schema.sql`
4. Incolla nell'editor
5. Clicca **"Run"** (o `Ctrl+Enter`)

✅ **Risultato atteso:**
```
Success. No rows returned
```

Questo crea:
- Tabelle: `profiles`, `tenants`, `allergens`, `categories`, `dishes`, `dish_allergens`
- Trigger: Auto-update `updated_at`, validazioni tenant
- Indexes: Performance optimization
- View: `menu_with_allergens`

### Step 2: Seed Allergens

1. Nuova query in SQL Editor
2. Copia il contenuto di `migrations/002_seed.sql`
3. Incolla e **"Run"**

✅ **Risultato atteso:**
```
NOTICE: ✅ 14 allergeni EU inseriti correttamente
INSERT 0 14
```

Verifica l'inserimento:
```sql
SELECT id, number, name->>'it' as nome_it FROM public.allergens ORDER BY number;
```

Dovresti vedere 14 righe (glutine, crostacei, uova, etc.).

### Step 3: Row Level Security (RLS) Policies

1. Nuova query in SQL Editor
2. Copia il contenuto di `migrations/003_policies.sql`
3. Incolla e **"Run"**

✅ **Risultato atteso:**
```
Success. No rows returned
```

Verifica RLS:
```sql
-- Controlla che RLS sia abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tenants', 'categories', 'dishes');
```

Tutte le tabelle dovrebbero avere `rowsecurity = true`.

---

## Configurazione Storage

### Step 1: Crea Bucket per Immagini Piatti

1. Vai su **Storage** nella sidebar
2. Clicca **"Create a new bucket"**
3. Compila:
   - **Name**: `dishes`
   - **Public bucket**: ✅ **ON** (importante!)
4. Clicca **"Create bucket"**

#### Configurazione File Upload Restrictions

1. Clicca sul bucket `dishes` appena creato
2. Vai su **Configuration** (icona ingranaggio)
3. Imposta:
   - **File size limit**: `5 MB`
   - **Allowed MIME types**:
     ```
     image/jpeg
     image/png
     image/webp
     ```
4. Salva

### Step 2: Crea Bucket per Loghi Ristoranti

1. **Storage → Create a new bucket**
2. Compila:
   - **Name**: `logos`
   - **Public bucket**: ✅ **ON**
3. **Configuration**:
   - **File size limit**: `2 MB`
   - **Allowed MIME types**:
     ```
     image/jpeg
     image/png
     image/webp
     image/svg+xml
     ```

### Step 3: Applica Storage Policies

1. Vai su **SQL Editor**
2. Nuova query
3. Copia il contenuto di `storage-policies.sql`
4. Incolla e **"Run"**

✅ **Risultato atteso:**
```
Success. No rows returned
```

Verifica policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```

Dovresti vedere 8 policies (4 per `dishes`, 4 per `logos`).

---

## Testing & Verifica

### Test 1: Verifica Struttura Database

```sql
-- Lista tutte le tabelle
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ **Output atteso:**
- allergens
- categories
- dish_allergens
- dishes
- profiles
- tenants

### Test 2: Verifica Allergeni

```sql
SELECT COUNT(*) as total_allergens FROM public.allergens;
```

✅ **Output atteso:** `14`

### Test 3: Verifica Trigger

Crea un tenant di test:

```sql
-- Inserisci profilo test (usa un UUID valido o genera uno nuovo)
INSERT INTO public.profiles (id, email, full_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User');

-- Crea tenant
INSERT INTO public.tenants (owner_id, restaurant_name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Ristorante Test', 'ristorante-test')
RETURNING id, created_at, updated_at;
```

✅ **Verifica:** `created_at` e `updated_at` dovrebbero essere popolati automaticamente.

Aggiorna il tenant:

```sql
UPDATE public.tenants
SET restaurant_name = 'Ristorante Test Modificato'
WHERE slug = 'ristorante-test'
RETURNING updated_at;
```

✅ **Verifica:** `updated_at` dovrebbe essere aggiornato a NOW().

### Test 4: Verifica RLS (Isolamento Tenant)

Prova a leggere come utente pubblico:

```sql
SET ROLE anon;
SELECT * FROM public.tenants WHERE slug = 'ristorante-test';
RESET ROLE;
```

✅ **Verifica:** Query dovrebbe restituire la riga (pubblico può leggere tenants).

Prova a modificare come utente pubblico:

```sql
SET ROLE anon;
UPDATE public.tenants SET restaurant_name = 'Hack' WHERE slug = 'ristorante-test';
RESET ROLE;
```

✅ **Verifica:** Query dovrebbe fallire con `permission denied`.

### Test 5: Verifica Storage Buckets

1. Vai su **Storage**
2. Verifica che esistano:
   - ✅ `dishes` (public)
   - ✅ `logos` (public)

Prova upload manuale:
1. Clicca sul bucket `dishes`
2. Clicca **"Upload file"**
3. Seleziona un'immagine JPG di test
4. Verifica che si carichi correttamente

---

## Troubleshooting

### Errore: "relation already exists"

**Problema:** Stai eseguendo le migrations una seconda volta.

**Soluzione:**
- Se vuoi ricominciare da zero, elimina tutte le tabelle:
  ```sql
  DROP TABLE IF EXISTS public.dish_allergens CASCADE;
  DROP TABLE IF EXISTS public.dishes CASCADE;
  DROP TABLE IF EXISTS public.categories CASCADE;
  DROP TABLE IF EXISTS public.allergens CASCADE;
  DROP TABLE IF EXISTS public.tenants CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;
  ```
- Poi ri-esegui tutte le migrations in ordine.

### Errore: "permission denied for table X"

**Problema:** RLS è abilitato ma non ci sono policies per il ruolo corrente.

**Soluzione:**
- Verifica che le policies siano state create: vedi Test Verifica sopra
- Se usi service_role, bypassa RLS automaticamente
- Se usi anon/authenticated, controlla che la policy permetta l'operazione

### Errore: "violates foreign key constraint"

**Problema:** Stai provando a inserire un record che referenzia un ID inesistente.

**Esempio:** Creare un `dish` con `category_id` che non esiste.

**Soluzione:**
- Crea prima la categoria, poi il piatto
- Oppure usa un `category_id` valido esistente

### Storage Upload Fallisce

**Problema:** Upload file ritorna 403 Forbidden.

**Soluzione:**
1. Verifica che il bucket sia **public**
2. Verifica che le storage policies siano state applicate
3. Se usi autenticazione, verifica che il token JWT sia valido
4. Controlla che il path rispetti il pattern: `{tenant_id}/dishes/{dish_id}.ext`

### Query Lenta

**Problema:** Query su dishes/categories è lenta con molti dati.

**Soluzione:**
- Verifica che gli indexes siano stati creati (sono nel 001_schema.sql)
- Usa EXPLAIN ANALYZE per diagnosticare:
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM public.dishes WHERE tenant_id = 'xxx';
  ```
- Se necessario, aggiungi indexes custom

---

## Prossimi Step

Dopo aver completato il setup Supabase:

1. ✅ Installa dipendenze Supabase nel progetto Next.js:
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
   ```

2. ✅ Configura Supabase client in Next.js:
   - Crea `/src/lib/supabase/client.ts` (client-side)
   - Crea `/src/lib/supabase/server.ts` (server-side SSR)

3. ✅ Implementa autenticazione:
   - Signup page
   - Login page
   - Protected routes con middleware

4. ✅ Crea dashboard per ristoratori:
   - CRUD categorie
   - CRUD piatti
   - Upload immagini

5. ✅ Implementa menu pubblico:
   - Dynamic route `[slug]/page.tsx`
   - Fetch dati con RLS (pubblico)
   - Applica branding custom (colori, logo)

---

## 📚 Risorse

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🆘 Supporto

Se incontri problemi:

1. Controlla la [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Verifica i logs nel **Database → Logs** della dashboard
3. Usa il SQL Editor per query diagnostiche

---

**✅ Setup completato!** Il database è pronto per essere utilizzato dalla piattaforma SaaS.
