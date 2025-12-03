# 🔧 Fix Registrazione - Row Level Security

## Problema
Errore durante la registrazione:
```
new row violates row-level security policy for table "profiles"
```

## Causa
Quando un utente si registra, **non è ancora autenticato** fino a quando non conferma l'email. Quindi il tentativo di creare manualmente il profile fallisce a causa delle RLS policies.

## ✅ Soluzione Applicata

### 1. Creato Trigger SQL Auto-Profile
Ho creato il file: `supabase/migrations/004_auto_create_profile.sql`

Questo trigger crea **automaticamente** il profile quando un utente si registra tramite Supabase Auth, bypassando le RLS policies.

### 2. Rimosso Codice Manuale
Il codice di registrazione NON prova più a creare manualmente il profile - viene creato dal trigger.

---

## 📋 Passi da Seguire

### Step 1: Applica la Migration del Trigger

Vai su **Supabase Dashboard → SQL Editor**:
```
https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf/sql
```

1. Clicca **"New query"**
2. Apri il file: `supabase/migrations/004_auto_create_profile.sql`
3. **Copia TUTTO** il contenuto
4. Incolla nell'editor SQL
5. Clicca **"Run"** (o `Ctrl+Enter`)

✅ **Risultato atteso:**
```
Success. No rows returned
```

### Step 2: Disabilita Conferma Email (Solo per Testing)

Per velocizzare il testing, disabilita la conferma email:

1. Vai su: **Supabase Dashboard → Authentication → Settings**
   ```
   https://supabase.com/dashboard/project/sgdxmtqrjgxuajxxvajf/auth/settings
   ```

2. Scorri fino a **"Email"** section

3. **Disabilita** l'opzione:
   - ❌ **"Enable email confirmations"**

4. Clicca **"Save"**

⚠️ **NOTA:** In produzione, riattiva questa opzione!

---

## 🧪 Testa la Registrazione

1. Vai su: `http://localhost:3000/register`

2. Compila il form:
   - **Nome Ristorante:** `Test Restaurant`
   - **Nome e Cognome:** `Mario Rossi`
   - **Email:** `test@example.com`
   - **Password:** `password123`

3. Clicca **"Inizia Gratis"**

4. **Controlla la console del browser** (F12 → Console)

✅ **Dovresti vedere:**
```
✓ User created: [uuid]
✓ Profile created automatically by trigger
✓ Slug available: test-restaurant
✓ Tenant created: [uuid]
✓ Registration complete! Redirecting to onboarding...
```

5. **Verifica nel Database**

Vai su: **Supabase Dashboard → Table Editor → profiles**

Dovresti vedere il nuovo profile creato automaticamente!

---

## 🔍 Verifica Trigger Installato

Per verificare che il trigger sia stato creato correttamente:

```sql
-- Esegui questa query nel SQL Editor
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

✅ **Risultato atteso:** 1 riga con:
- `trigger_name`: `on_auth_user_created`
- `event_object_table`: `users`
- `event_manipulation`: `INSERT`

---

## ❓ Se Non Funziona Ancora

### Controlla le RLS Policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'tenants')
ORDER BY tablename, policyname;
```

Dovresti vedere almeno:
- `tenants` → `Authenticated users can create tenants` → INSERT

### Verifica Utente Creato
```sql
SELECT id, email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

Se `confirmed_at` è NULL, significa che l'email non è stata confermata.

### Controlla Profile Creato
```sql
SELECT p.id, p.email, p.full_name, p.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
```

Se il profile NON esiste, il trigger non sta funzionando.

---

## 🎯 Prossimi Step

Dopo aver risolto la registrazione:

1. ✅ Testa il wizard onboarding (`/onboarding`)
2. ✅ Verifica redirect alla dashboard
3. ✅ Testa login con utente esistente (`/login`)

---

## 📚 Pattern Usato

Questo è il **pattern standard raccomandato da Supabase**:

> When a user signs up via Supabase Auth, a trigger automatically creates their profile in the public.profiles table using SECURITY DEFINER to bypass RLS policies.

**Vantaggi:**
- ✅ Nessun problema con RLS durante signup
- ✅ Profile sempre creato, anche se conferma email abilitata
- ✅ Codice client più semplice
- ✅ Meno errori possibili

---

**✅ Applica lo Step 1 (trigger) e Step 2 (disabilita conferma email), poi riprova la registrazione!**
