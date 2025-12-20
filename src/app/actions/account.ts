
'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function deleteAccount() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Non autenticato');
    }

    // Initialize Admin Client for deletion
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    console.log(`[DELETE_ACCOUNT] (v3) Attempting to delete user ${user.id}`);

    try {
        // 1. Fetch tenant info for storage cleanup
        const { data: tenant } = await supabaseAdmin
            .from('tenants')
            .select('id, restaurant_name')
            .eq('owner_id', user.id)
            .single();

        if (tenant) {
            console.log(`[DELETE_ACCOUNT] Found tenant ${tenant.id}, starting storage cleanup...`);

            // NEW: ID-Only Path
            const folderPath = tenant.id;
            console.log(`[DELETE_ACCOUNT] Cleaning storage for folder: ${folderPath}`);

            // Clean 'logos' bucket
            try {
                const { data: logoFiles } = await supabaseAdmin.storage
                    .from('logos')
                    .list(folderPath);

                if (logoFiles && logoFiles.length > 0) {
                    const filesToRemove = logoFiles.map(f => `${folderPath}/${f.name}`);
                    await supabaseAdmin.storage.from('logos').remove(filesToRemove);
                    console.log(`[DELETE_ACCOUNT] Cleaned ${filesToRemove.length} files from logos/${folderPath}`);
                }
            } catch (storageErr) {
                console.warn(`[DELETE_ACCOUNT] Error cleaning logos for path ${folderPath}:`, storageErr);
            }

            // Clean 'dishes' bucket
            try {
                const dishesSubfolder = `${folderPath}/dishes`;
                const { data: dishFiles } = await supabaseAdmin.storage
                    .from('dishes')
                    .list(dishesSubfolder);

                if (dishFiles && dishFiles.length > 0) {
                    const filesToRemove = dishFiles.map(f => `${dishesSubfolder}/${f.name}`);
                    await supabaseAdmin.storage.from('dishes').remove(filesToRemove);
                    console.log(`[DELETE_ACCOUNT] Cleaned ${filesToRemove.length} files from dishes/${dishesSubfolder}`);
                }
            } catch (storageErr) {
                console.warn(`[DELETE_ACCOUNT] Error cleaning dishes for path ${folderPath}:`, storageErr);
            }
        }

        // 2. Manually delete the tenant first to ensure data cleanup and avoid FK constraints
        // This assumes 1:1 relationship or similar. 
        // We use supabaseAdmin to bypass RLS if needed, although user should be owner.
        const { error: tenantDeleteError } = await supabaseAdmin
            .from('tenants')
            .delete()
            .eq('owner_id', user.id);

        if (tenantDeleteError) {
            console.error('[DELETE_ACCOUNT] Error deleting tenant:', tenantDeleteError);
            throw new Error(`Errore durante l'eliminazione dei dati: ${tenantDeleteError.message}`);
        }

        console.log(`[DELETE_ACCOUNT] Tenant data for user ${user.id} deleted successfully`);

        // 3. Delete user from auth.users
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            console.error('[DELETE_ACCOUNT] Error deleting user:', deleteError);
            throw new Error(`Errore durante l'eliminazione dell'utente Auth: ${deleteError.message}`);
        }

        console.log(`[DELETE_ACCOUNT] User ${user.id} deleted successfully`);

    } catch (error: any) {
        console.error('[DELETE_ACCOUNT] Unexpected error:', error);
        throw new Error(error.message || 'Errore sconosciuto durante l\'eliminazione');
    }

    // 2. Sign out the user session (ignore errors as user is already deleted)
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.warn('[DELETE_ACCOUNT] SignOut failed (expected since user is deleted):', e);
    }

    // 3. Return success signal. Client will handle redirect.
    return { success: true };
}

export async function resetMenu() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Non autenticato');
    }

    // Initialize Admin Client for storage operations
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    console.log(`[RESET_MENU] Attempting to reset menu for user ${user.id}`);

    try {
        // 1. Fetch tenant info
        const { data: tenant } = await supabaseAdmin
            .from('tenants')
            .select('id, restaurant_name')
            .eq('owner_id', user.id)
            .single();

        if (!tenant) throw new Error('Tenant non trovato');

        // 2. Clean 'dishes' bucket
        // NEW: ID-Only Path
        const folderPath = `${tenant.id}/dishes`;
        console.log(`[RESET_MENU] Cleaning dishes from ${folderPath}`);

        try {
            const { data: dishFiles } = await supabaseAdmin.storage
                .from('dishes')
                .list(folderPath);

            if (dishFiles && dishFiles.length > 0) {
                const filesToRemove = dishFiles.map(f => `${folderPath}/${f.name}`);
                const { error: removeError } = await supabaseAdmin.storage
                    .from('dishes')
                    .remove(filesToRemove);

                if (removeError) console.warn(`[RESET_MENU] Error removing files from ${folderPath}:`, removeError);
                else console.log(`[RESET_MENU] Cleaned ${filesToRemove.length} files from ${folderPath}`);
            }
        } catch (storageErr) {
            console.warn(`[RESET_MENU] Error cleaning dishes path ${folderPath}:`, storageErr);
        }

        // 3. Delete DB Data
        // Deleting all categories will cascade delete all dishes and dish_allergens
        const { error: deleteError } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('tenant_id', tenant.id);

        if (deleteError) {
            throw new Error(`Errore DB: ${deleteError.message}`);
        }

        console.log(`[RESET_MENU] DB data cleared for tenant ${tenant.id}`);

        revalidatePath('/dashboard/dishes');
        revalidatePath('/dashboard/categories');

        return { success: true };

    } catch (error: any) {
        console.error('[RESET_MENU] Unexpected error:', error);
        throw new Error(error.message || 'Errore sconosciuto durante il reset');
    }
}
