const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database via Prisma...");

        // Check tenants count
        const tenantsCount = await prisma.tenants.count();
        console.log(`\n✅ Connected! Found ${tenantsCount} tenants.`);

        // Check if new table exists and has data
        // Note: Prisma might format the name differently (e.g. tenant_design_settings -> tenantDesignSettings)
        // We'll try dynamic access if specific types aren't known yet, or standard camelCase

        if (prisma.tenant_design_settings) {
            const settingsCount = await prisma.tenant_design_settings.count();
            console.log(`✅ 'tenant_design_settings' table found! Contains ${settingsCount} records.`);

            const settings = await prisma.tenant_design_settings.findMany({ take: 1 });
            if (settings.length > 0) {
                console.log("\nSample Design Settings (First Record):");
                console.dir(settings[0], { depth: null });
            } else {
                console.log("\n⚠️ 'tenant_design_settings' is empty.");
            }
        } else {
            console.log("\n❌ 'tenant_design_settings' table NOT found in Prisma client. Did you run 'db pull'?");
        }

        // Check columns in tenants (to verify cleanup)
        const tenant = await prisma.tenants.findFirst();
        if (tenant) {
            console.log("\nChecking 'tenants' table columns (Legacy cleanup check):");
            const keys = Object.keys(tenant);
            const legacyCols = ['primary_color', 'secondary_color', 'background_color', 'theme_options'];
            const foundLegacy = legacyCols.filter(col => keys.includes(col));

            if (foundLegacy.length === 0) {
                console.log("✅ CLEANUP VERIFIED: No legacy color/theme columns found in 'tenants'.");
            } else {
                console.log("⚠️ WARNING: Found legacy columns still present:", foundLegacy);
            }
        }

    } catch (e) {
        console.error("Error connecting:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
