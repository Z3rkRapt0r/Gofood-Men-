
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkShifts() {
    const slug = 'magnaromatrattoria';
    console.log(`Checking shifts for tenant: ${slug}`);

    // 1. Get Tenant ID
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, restaurant_name')
        .eq('slug', slug)
        .single();

    if (tenantError) {
        console.error("Error fetching tenant:", tenantError);
        return;
    }
    console.log("Tenant found:", tenant);

    // 2. Get Settings
    const { data: settings, error: settingsError } = await supabase
        .from('reservation_settings')
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

    if (settingsError) {
        console.log("Error or no settings found:", settingsError);
    } else {
        console.log("Settings:", settings);
    }

    // 3. Get Shifts
    const { data: shifts, error: shiftsError } = await supabase
        .from('reservation_shifts')
        .select('*')
        .eq('tenant_id', tenant.id);

    if (shiftsError) {
        console.error("Error fetching shifts:", shiftsError);
        return;
    }

    console.log(`Found ${shifts.length} shifts:`);
    shifts.forEach(s => {
        console.log(`- [${s.is_active ? 'ACTIVE' : 'INACTIVE'}] ${s.name}: ${s.start_time} - ${s.end_time} | Days: ${JSON.stringify(s.days_of_week)}`);
    });
}

checkShifts();
