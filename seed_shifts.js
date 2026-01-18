
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars (need service role key)");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedShifts() {
    const slug = 'magnaromatrattoria';
    console.log(`Seeding shifts for tenant: ${slug}`);

    // 1. Get Tenant ID
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single();

    if (tenantError) {
        console.error("Error fetching tenant:", tenantError);
        return;
    }

    // 2. Insert Shifts (Lunch and Dinner)
    const shifts = [
        {
            id: uuidv4(),
            tenant_id: tenant.id,
            name: 'Pranzo',
            start_time: '12:00:00',
            end_time: '15:00:00',
            days_of_week: [0, 1, 2, 3, 4, 5, 6], // All days
            is_active: true
        },
        {
            id: uuidv4(),
            tenant_id: tenant.id,
            name: 'Cena',
            start_time: '19:00:00',
            end_time: '23:00:00',
            days_of_week: [0, 1, 2, 3, 4, 5, 6], // All days
            is_active: true
        }
    ];

    const { data, error } = await supabase
        .from('reservation_shifts')
        .insert(shifts)
        .select();

    if (error) {
        console.error("Error inserting shifts:", error);
    } else {
        console.log("Success! Inserted shifts:", data);
    }
}

seedShifts();
