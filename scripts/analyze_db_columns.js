const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log("🔍 Analyzing Database Columns...\n");

    const tables = ['tenants', 'categories', 'dishes'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.error(`❌ Error fetching ${table}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            console.log(`📋 Table: '${table}'`);
            console.log("   Columns:", Object.keys(data[0]).join(', '));
            console.log("------------------------------------------------");
        } else {
            console.log(`⚠️ Table '${table}' is active but empty.`);
        }
    }
}

main();
