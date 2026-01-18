/**
 * Script per eseguire le migrations Supabase
 *
 * Usage: node supabase/run-migrations.js
 *
 * Questo script esegue automaticamente tutte le migrations SQL
 * sul database Supabase usando le credenziali da .env
 */

const fs = require('fs');
const path = require('path');

// Carica environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Errore: Credenziali Supabase mancanti in .env');
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
        // Se anche questo fallisce, prova via SQL REST endpoint standard se abilitato o stampa errore
        const errText = await response.text();
        console.error(`❌ Errore (Fallback REST): ${errText}`);
        return false;
      }
    }

    console.log(`✅ ${filename} eseguito con successo`);
    return true;
  } catch (err) {
    console.error(`❌ Errore durante l'esecuzione di ${filename}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Avvio migrations Supabase...\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log('🔑 Service Role Key: Presente\n');

  const migrations = [
    '034_seed_shifts_magnaroma.sql'
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
  }

  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
