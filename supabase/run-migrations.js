/**
 * Script per eseguire le migrations Supabase
 *
 * Usage: node supabase/run-migrations.js
 *
 * Questo script esegue automaticamente tutte le migrations SQL
 * sul database Supabase usando le credenziali da .env.local
 */

const fs = require('fs');
const path = require('path');

// Carica environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Errore: Credenziali Supabase mancanti in .env.local');
  console.error('Assicurati di avere:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration(filename) {
  const migrationPath = path.join(__dirname, 'migrations', filename);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ File non trovato: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`\n📝 Eseguendo ${filename}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // Fallback: prova query diretta (funziona con service_role)
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        console.error(`❌ Errore: ${error.message}`);
        console.error('⚠️  Esegui manualmente questo file tramite SQL Editor nella dashboard Supabase');
        return false;
      }
    }

    console.log(`✅ ${filename} eseguito con successo`);
    return true;
  } catch (err) {
    console.error(`❌ Errore durante l'esecuzione di ${filename}:`, err.message);
    console.error('⚠️  Esegui manualmente questo file tramite SQL Editor nella dashboard Supabase');
    return false;
  }
}

async function main() {
  console.log('🚀 Avvio migrations Supabase...\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log('🔑 Service Role Key: Presente\n');

  const migrations = [
    '001_schema.sql',
    '002_seed.sql',
    '003_policies.sql',
    '004_auto_create_profile.sql',
    '005_add_tagline.sql',
    '006_storage_policies.sql',
    '007_remove_limits.sql',
  ];

  let success = 0;
  let failed = 0;

  for (const migration of migrations) {
    const result = await runMigration(migration);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migrations completate: ${success}/${migrations.length}`);

  if (failed > 0) {
    console.log(`❌ Migrations fallite: ${failed}/${migrations.length}`);
    console.log('\n⚠️  NOTA: Se le migrations falliscono con questo script,');
    console.log('esegui i file SQL manualmente tramite SQL Editor:');
    console.log('Dashboard Supabase → SQL Editor → New Query → Incolla SQL → Run');
  }

  console.log('='.repeat(50));

  console.log('\n📚 Prossimi step:');
  console.log('1. Crea i bucket Storage (dishes e logos) tramite dashboard');
  console.log('2. Esegui storage-policies.sql tramite SQL Editor');
  console.log('3. Aggiungi NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  console.log('4. Testa la connessione con: npm run dev');

  console.log('\n✨ Setup completato!');
}

main().catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
