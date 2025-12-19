
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

            // Construct folder name: restaurant-name-id
            const baseName = tenant.restaurant_name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') || 'temp-uploads';

            const folderPath = `${baseName}-${tenant.id}`;

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
                console.warn('[DELETE_ACCOUNT] Error cleaning logos:', storageErr);
            }

            // Clean 'dishes' bucket
            try {
                // Dishes has nested structure: folderPath/dishes/filename
                // First list the main folder
                // Note: 'list' is shallow. If dishes are in subfolder 'dishes', we need to check that.
                // Our structure: prefix/dishes/file.png

                // Warning: list() might not show subfolders correctly depending on implementation.
                // But generally: list(folderPath) should return 'dishes' as a folder logic?
                // Actually, standard list returns objects in that prefix.
                // Let's list deep? No, supabase list doesn't recurse easily.
                // But we know structure: ${folderPath}/dishes

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
                console.warn('[DELETE_ACCOUNT] Error cleaning dishes:', storageErr);
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
