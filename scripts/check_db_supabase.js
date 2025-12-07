const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Helper to read env file manually since dotenv might not override properly if conflicts exist
function getEnvLocal() {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

async function main() {
    const env = getEnvLocal();
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Or SERVICE_ROLE if available for admin tasks

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase credentials in .env.local");
        return;
    }

    console.log(`Connecting to Supabase: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check tenants
    const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, restaurant_name, slug'); // Select specific columns to check if old ones are gone by failing? No, select * is better to inspect

    if (tenantsError) {
        console.error("❌ Error fetching tenants:", tenantsError.message);
    } else {
        console.log(`\n✅ Connected! Found ${tenants.length} tenants.`);
        if (tenants.length > 0) {
            // Check keys of the first tenant to verify cleanup
            const keys = Object.keys(tenants[0]);
            console.log("Tenant Columns:", keys.join(', '));

            const legacyCols = ['primary_color', 'secondary_color', 'background_color', 'theme_options'];
            const foundLegacy = legacyCols.filter(c => keys.includes(c));
            if (foundLegacy.length === 0) {
                console.log("✅ CLEANUP CONFIRMED: No legacy columns in 'tenants'.");
            } else {
                console.log("⚠️ WARNING: Legacy columns still present:", foundLegacy);
            }
        }
    }

    // Check tenant_design_settings
    const { data: settings, error: settingsError } = await supabase
        .from('tenant_design_settings')
        .select('*');

    if (settingsError) {
        console.error("❌ Error fetching tenant_design_settings:", settingsError.message);
        // If error is 404 or "relation does not exist", table is missing
    } else {
        console.log(`\n✅ 'tenant_design_settings' table accessible. Found ${settings.length} records.`);
        if (settings.length > 0) {
            console.log("Sample Config:", JSON.stringify(settings[0].theme_config, null, 2));
        }
    }
}

main();
