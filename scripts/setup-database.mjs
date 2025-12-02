#!/usr/bin/env node

/**
 * Setup Database Script
 *
 * Questo script inizializza il database Supabase eseguendo le migrations
 * in modo programmatico usando il Supabase client.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Carica .env.local
dotenv.config({ path: join(rootDir, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenziali Supabase mancanti!');
  process.exit(1);
}

// Crea client con service_role (bypassa RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSqlFile(filename) {
  const filepath = join(rootDir, 'supabase/migrations', filename);
  const sql = readFileSync(filepath, 'utf-8');

  console.log(`\n📝 Eseguendo ${filename}...`);

  // Split SQL in statements (dividi per ";")
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    // Salta commenti e statements vuoti
    if (stmt.startsWith('/*') || stmt.trim() === ';') continue;

    try {
      // Usa rpc per eseguire SQL raw (se disponibile)
      const { error } = await supabase.rpc('exec', { query: stmt });

      if (error && error.code !== 'PGRST202') { // Ignora "non trovato"
        console.error(`⚠️  Warning: ${error.message}`);
      }
    } catch (err) {
      // Ignora errori di "già esiste"
      if (!err.message?.includes('already exists')) {
        console.error(`❌ Errore: ${err.message}`);
      }
    }
  }

  console.log(`✅ ${filename} completato`);
}

console.log('🚀 Setup Database Supabase\n');
console.log('⚠️  NOTA: Questo script potrebbe non funzionare correttamente.');
console.log('Se fallisce, esegui manualmente i file SQL tramite dashboard:\n');
console.log('1. Vai su: https://supabase.com/dashboard');
console.log('2. SQL Editor → New Query');
console.log('3. Copia/Incolla il contenuto di ogni file .sql');
console.log('4. Clicca "Run"\n');
console.log('File da eseguire in ordine:');
console.log('  1. supabase/migrations/001_schema.sql');
console.log('  2. supabase/migrations/002_seed.sql');
console.log('  3. supabase/migrations/003_policies.sql\n');
console.log('='.repeat(60));

// Per ora, saltiamo l'esecuzione automatica e diciamo all'utente di farlo manualmente
console.log('\n✅ Esegui manualmente i file SQL tramite dashboard Supabase');
console.log('✅ Poi ritorna qui per migrare i dati\n');

process.exit(0);
