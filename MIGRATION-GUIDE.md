# 📦 Guida Migrazione: JSON → Supabase Database

Questa guida ti aiuta a migrare i dati esistenti dal file `menu.json` al database Supabase.

---

## 🎯 Obiettivo

Trasformare il menu statico (hardcoded in `menu.json`) in un menu dinamico fetched dal database Supabase, mantenendo tutti i dati esistenti.

---

## 📋 Step-by-Step

### Step 1: Esegui Migrations Database (MANUALE)

Le migrations automatiche falliscono perché Supabase non espone una funzione `exec_sql` via API. Devi eseguire i file SQL **manualmente** tramite dashboard.

#### 1.1 Vai alla Dashboard SQL Editor
```
https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf/sql
```

#### 1.2 Esegui `001_schema.sql`
1. Clicca **"New query"**
2. Apri il file: `supabase/migrations/001_schema.sql`
3. Copia **TUTTO** il contenuto
4. Incolla nell'editor SQL
5. Clicca **"Run"** (o `Ctrl+Enter`)

✅ **Risultato atteso:**
```
Success. No rows returned
```

Questo crea:
- ✅ Tabelle: `profiles`, `tenants`, `allergens`, `categories`, `dishes`, `dish_allergens`
- ✅ Trigger: `update_updated_at`, `check_category_tenant_match`, etc.
- ✅ Indexes per performance
- ✅ View `menu_with_allergens`

#### 1.3 Esegui `002_seed.sql`
1. **New query**
2. Apri: `supabase/migrations/002_seed.sql`
3. Copia e incolla
4. **Run**

✅ **Risultato atteso:**
```
NOTICE: ✅ 14 allergeni EU inseriti correttamente
INSERT 0 14
```

Verifica:
```sql
SELECT id, number, name->>'it' as nome FROM allergens ORDER BY number;
```
Dovresti vedere 14 righe (glutine, crostacei, uova, etc.)

#### 1.4 Esegui `003_policies.sql`
1. **New query**
2. Apri: `supabase/migrations/003_policies.sql`
3. Copia e incolla
4. **Run**

✅ **Risultato atteso:**
```
Success. No rows returned
```

Verifica RLS:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tenants', 'categories', 'dishes');
```
Tutte dovrebbero avere `rowsecurity = true`

---

### Step 2: Migra i Dati da menu.json

Una volta create le tabelle, esegui lo script di migrazione:

```bash
npm run migrate:menu
```

Questo script:
1. ✅ Crea un tenant "Magna Roma" con slug `magna-roma`
2. ✅ Migra tutte le 12 categorie
3. ✅ Migra tutti i 107 piatti
4. ✅ Link allergeni per ogni piatto
5. ✅ Preserva l'ordine di visualizzazione

✅ **Output atteso:**
```
🚀 Migrazione Dati: menu.json → Supabase

📊 Dati da migrare:
   - Categorie: 12
   - Piatti totali: 107

1️⃣  Creando tenant "Magna Roma"...
   ✅ Tenant creato: [UUID]

2️⃣  Migrando categorie...
   ✅ Categoria "antipasti" creata
   ✅ Categoria "bruschette" creata
   ...

3️⃣  Migrando piatti...
   📂 Categoria: Per cominciare
      ✅ Piatto "Tagliere Magna Roma" creato (allergeni: 2)
      ✅ Piatto "Supplì al telefono" creato (allergeni: 3)
      ...

📊 RIEPILOGO MIGRAZIONE:
✅ Tenant creato: Sì
✅ Categorie migrate: 12
✅ Piatti migrati: 107
✅ Collegamenti allergeni: [N]
❌ Errori: 0

🎉 Migrazione completata!
```

---

### Step 3: Verifica i Dati nel Database

Vai su: https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf/editor

#### Verifica Tenant
```sql
SELECT * FROM tenants WHERE slug = 'magna-roma';
```
✅ Dovresti vedere 1 riga con `restaurant_name = "Magna Roma Trattoria"`

#### Verifica Categorie
```sql
SELECT id, slug, name->>'it' as nome, display_order
FROM categories
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'magna-roma')
ORDER BY display_order;
```
✅ Dovresti vedere 12 righe (antipasti, bruschette, primi, etc.)

#### Verifica Piatti
```sql
SELECT d.id, d.slug, d.name->>'it' as nome, d.price, c.name->>'it' as categoria
FROM dishes d
JOIN categories c ON d.category_id = c.id
WHERE d.tenant_id = (SELECT id FROM tenants WHERE slug = 'magna-roma')
LIMIT 10;
```
✅ Dovresti vedere 10 piatti con nomi, prezzi e categorie

#### Verifica Allergeni Linkati
```sql
SELECT d.name->>'it' as piatto, COUNT(da.allergen_id) as num_allergeni
FROM dishes d
LEFT JOIN dish_allergens da ON d.id = da.dish_id
WHERE d.tenant_id = (SELECT id FROM tenants WHERE slug = 'magna-roma')
GROUP BY d.id, d.name
HAVING COUNT(da.allergen_id) > 0
LIMIT 10;
```
✅ Dovresti vedere piatti con i relativi conteggi allergeni

---

### Step 4: Testa il Menu Pubblico

**Il menu pubblico sarà accessibile su:**
```
http://localhost:3000/magna-roma
```

Dopo aver completato Step 1 e Step 2, la homepage fetcherà i dati dal database invece che da `menu.json`.

---

## 🔍 Troubleshooting

### Errore: "relation does not exist"
**Problema:** Tabelle non create

**Soluzione:**
- Esegui manualmente `001_schema.sql` tramite SQL Editor
- Verifica che tutte le tabelle esistano:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
  ```

### Errore: "duplicate key value violates unique constraint"
**Problema:** Dati già migrati

**Soluzione:**
- I dati esistono già! Vai direttamente a Step 4 per testare
- Se vuoi reimportare, elimina prima i dati:
  ```sql
  DELETE FROM dish_allergens;
  DELETE FROM dishes;
  DELETE FROM categories;
  DELETE FROM tenants WHERE slug = 'magna-roma';
  DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
  ```
- Poi ri-esegui `npm run migrate:menu`

### Script di Migrazione Fallisce
**Problema:** Credenziali o connessione

**Soluzione:**
1. Verifica `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` presente
   - `SUPABASE_SERVICE_ROLE_KEY` presente
2. Verifica connessione internet
3. Verifica che le migrations siano state eseguite (Step 1)

### Menu Non Appare su /magna-roma
**Problema:** Frontend non ancora aggiornato o dati non migrati

**Soluzione:**
1. Verifica che i dati esistano nel database (query sopra)
2. Controlla console browser per errori
3. Verifica che il server sia in esecuzione: `npm run dev`

---

## 📊 Cosa Succede Dopo

Una volta completati tutti gli step, avrai:

✅ **Database Supabase popolato** con:
- 1 tenant "Magna Roma"
- 12 categorie
- 107 piatti
- ~300 collegamenti allergeni

✅ **Menu dinamico** accessibile su:
- `http://localhost:3000/magna-roma` (menu pubblico)

✅ **Dati modificabili** tramite:
- SQL Editor (manuale)
- Dashboard (futura implementazione)

✅ **Infrastruttura SaaS** pronta per:
- Aggiungere altri ristoranti
- Implementare dashboard per ristoratori
- Autenticazione e gestione utenti

---

## 🚀 Prossimi Step Sviluppo

Dopo la migrazione, posso procedere con:

1. **Aggiornare Homepage** → Fetch da DB invece di JSON
2. **Creare Dynamic Route** → `/[slug]/page.tsx` per menu pubblici
3. **Landing Page** → Homepage con CTA per ristoratori
4. **Auth Pages** → Signup/Login per ristoratori
5. **Dashboard** → CRUD categorie e piatti
6. **Onboarding** → Wizard setup per nuovi ristoranti

---

## 📚 File Riferimento

- **Migrations**: `supabase/migrations/*.sql`
- **Script Migrazione**: `scripts/migrate-menu-data.mjs`
- **Dati Originali**: `src/data/menu.json`
- **Guida Setup**: `SETUP-SUPABASE.md`
- **Schema DB**: `supabase/README.md`

---

**✅ Segui questi step e poi dimmi quando hai completato, così procedo con l'aggiornamento del frontend!**
