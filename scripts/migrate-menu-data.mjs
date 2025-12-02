#!/usr/bin/env node

/**
 * Script Migrazione Dati: menu.json → Supabase
 *
 * Questo script migra i dati esistenti di Magna Roma
 * dal file JSON statico al database Supabase.
 *
 * PREREQUISITI:
 * 1. Database Supabase deve essere già inizializzato (migrations eseguite)
 * 2. Tabelle: profiles, tenants, categories, dishes, dish_allergens devono esistere
 * 3. Allergens devono essere già popolati (002_seed.sql)
 *
 * USAGE:
 * node scripts/migrate-menu-data.mjs
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
  console.error('❌ Credenziali Supabase mancanti in .env.local!');
  process.exit(1);
}

// Crea client con service_role (bypassa RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Carica menu.json
const menuPath = join(rootDir, 'src/data/menu.json');
const menuData = JSON.parse(readFileSync(menuPath, 'utf-8'));

console.log('🚀 Migrazione Dati: menu.json → Supabase\n');
console.log(`📊 Dati da migrare:`);
console.log(`   - Categorie: ${menuData.categories.length}`);
console.log(`   - Piatti totali: ${menuData.categories.reduce((sum, cat) => sum + cat.dishes.length, 0)}\n`);

// ID utente fittizio per Magna Roma (useremo questo per il tenant)
const MAGNA_ROMA_USER_ID = '00000000-0000-0000-0000-000000000001';
const MAGNA_ROMA_SLUG = 'magna-roma';

let stats = {
  tenantCreated: false,
  categoriesCreated: 0,
  dishesCreated: 0,
  allergensLinked: 0,
  errors: 0
};

async function createMagnaRomaTenant() {
  console.log('1️⃣  Creando tenant "Magna Roma"...');

  // 1. Crea profilo utente fittizio
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: MAGNA_ROMA_USER_ID,
      email: 'magna-roma@example.com',
      full_name: 'Magna Roma Trattoria'
    }, { onConflict: 'id' });

  if (profileError && !profileError.message.includes('duplicate')) {
    console.error(`   ❌ Errore creazione profilo: ${profileError.message}`);
    stats.errors++;
    return null;
  }

  // 2. Crea tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .upsert({
      owner_id: MAGNA_ROMA_USER_ID,
      restaurant_name: 'Magna Roma Trattoria',
      slug: MAGNA_ROMA_SLUG,
      primary_color: '#8B0000',
      secondary_color: '#D4AF37',
      default_language: 'it',
      supported_languages: ['it', 'en'],
      subscription_tier: 'premium', // Premium per demo
      max_dishes: 999,
      max_categories: 99,
      onboarding_completed: true
    }, { onConflict: 'slug' })
    .select()
    .single();

  if (tenantError) {
    console.error(`   ❌ Errore creazione tenant: ${tenantError.message}`);
    stats.errors++;
    return null;
  }

  console.log(`   ✅ Tenant creato: ${tenant.id}`);
  stats.tenantCreated = true;
  return tenant;
}

async function migrateCategories(tenantId) {
  console.log('\n2️⃣  Migrando categorie...');

  const categoryMap = {}; // Mappa slug → UUID

  for (let i = 0; i < menuData.categories.length; i++) {
    const cat = menuData.categories[i];

    const { data, error } = await supabase
      .from('categories')
      .upsert({
        tenant_id: tenantId,
        slug: cat.id,
        name: cat.name,
        display_order: i,
        is_visible: true
      }, { onConflict: 'tenant_id,slug' })
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Errore categoria "${cat.id}": ${error.message}`);
      stats.errors++;
      continue;
    }

    categoryMap[cat.id] = data.id;
    stats.categoriesCreated++;
    console.log(`   ✅ Categoria "${cat.id}" creata`);
  }

  return categoryMap;
}

async function migrateDishes(tenantId, categoryMap) {
  console.log('\n3️⃣  Migrando piatti...');

  // Lista piatti stagionali (hardcoded nell'app originale)
  const seasonalDishes = ['carciofi-romana', 'carciofo-giudia'];

  for (const cat of menuData.categories) {
    const categoryId = categoryMap[cat.id];
    if (!categoryId) continue;

    console.log(`\n   📂 Categoria: ${cat.name.it}`);

    for (let i = 0; i < cat.dishes.length; i++) {
      const dish = cat.dishes[i];

      // Crea piatto
      const { data: newDish, error: dishError } = await supabase
        .from('dishes')
        .upsert({
          tenant_id: tenantId,
          category_id: categoryId,
          slug: dish.id,
          name: dish.name,
          description: dish.description,
          price: parseFloat(dish.price),
          image_url: dish.image, // Path originale: /images/dishes/...
          is_visible: true,
          is_seasonal: seasonalDishes.includes(dish.id),
          is_gluten_free: !dish.allergens?.includes('glutine'),
          display_order: i
        }, { onConflict: 'tenant_id,category_id,slug' })
        .select()
        .single();

      if (dishError) {
        console.error(`      ❌ Errore piatto "${dish.id}": ${dishError.message}`);
        stats.errors++;
        continue;
      }

      stats.dishesCreated++;

      // Link allergeni
      if (dish.allergens && dish.allergens.length > 0) {
        for (const allergenId of dish.allergens) {
          const { error: allergenError } = await supabase
            .from('dish_allergens')
            .upsert({
              dish_id: newDish.id,
              allergen_id: allergenId,
              tenant_id: tenantId
            }, { onConflict: 'dish_id,allergen_id' });

          if (!allergenError) {
            stats.allergensLinked++;
          }
        }
      }

      console.log(`      ✅ Piatto "${dish.name.it}" creato (allergeni: ${dish.allergens?.length || 0})`);
    }
  }
}

// Main execution
async function main() {
  try {
    const tenant = await createMagnaRomaTenant();
    if (!tenant) {
      console.error('\n❌ Impossibile creare tenant. Verifica che le migrations siano state eseguite.');
      process.exit(1);
    }

    const categoryMap = await migrateCategories(tenant.id);
    await migrateDishes(tenant.id, categoryMap);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO MIGRAZIONE:');
    console.log('='.repeat(60));
    console.log(`✅ Tenant creato: ${stats.tenantCreated ? 'Sì' : 'No'}`);
    console.log(`✅ Categorie migrate: ${stats.categoriesCreated}`);
    console.log(`✅ Piatti migrati: ${stats.dishesCreated}`);
    console.log(`✅ Collegamenti allergeni: ${stats.allergensLinked}`);
    console.log(`❌ Errori: ${stats.errors}`);
    console.log('='.repeat(60));

    console.log('\n🎉 Migrazione completata!');
    console.log('\n📝 Prossimi step:');
    console.log('1. Verifica i dati nel database Supabase');
    console.log('2. Controlla il menu pubblico su: http://localhost:3000/magna-roma');
    console.log('3. Le immagini sono ancora in /public/images/dishes/');
    console.log('   (opzionale: migrare su Supabase Storage in futuro)\n');

  } catch (err) {
    console.error('\n❌ Errore fatale:', err);
    process.exit(1);
  }
}

main();
