
'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Recursively deletes all files and subfolders within a given path in a storage bucket.
 */
async function cleanBucketFolder(supabaseAdmin: any, bucket: string, path: string) {
    try {
        console.log(`[CLEANUP] Listing items in ${bucket}/${path}...`);

        // List all items in the current path
        const { data: items, error } = await supabaseAdmin.storage
            .from(bucket)
            .list(path);

        if (error) {
            console.warn(`[CLEANUP] Error listing ${bucket}/${path}:`, error.message);
            return;
        }

        if (!items || items.length === 0) {
            console.log(`[CLEANUP] No items found in ${bucket}/${path}`);
            return;
        }

        const filesToDelete: string[] = [];
        const foldersToProcess: string[] = [];

        for (const item of items) {
            if (item.id === null) {
                // It's a folder (Supabase/S3 convention usually returns null ID for folders in list)
                foldersToProcess.push(`${path}/${item.name}`);
            } else {
                // It's a file
                filesToDelete.push(`${path}/${item.name}`);
            }
        }

        // 1. Delete all files in this level
        if (filesToDelete.length > 0) {
            const { error: deleteError } = await supabaseAdmin.storage
                .from(bucket)
                .remove(filesToDelete);

            if (deleteError) {
                console.warn(`[CLEANUP] Error deleting files in ${bucket}/${path}:`, deleteError.message);
            } else {
                console.log(`[CLEANUP] Deleted ${filesToDelete.length} files in ${bucket}/${path}`);
            }
        }

        // 2. Recursively process subfolders
        for (const folder of foldersToProcess) {
            await cleanBucketFolder(supabaseAdmin, bucket, folder);
        }

    } catch (err) {
        console.error(`[CLEANUP] Critical error cleaning ${bucket}/${path}:`, err);
    }
}

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

    console.log(`[DELETE_ACCOUNT] Attempting to delete user ${user.id}`);

    try {
        // 1. Fetch tenant info for storage cleanup
        const { data: tenant } = await supabaseAdmin
            .from('tenants')
            .select('id, restaurant_name')
            .eq('owner_id', user.id)
            .single();

        if (tenant) {
            console.log(`[DELETE_ACCOUNT] Found tenant ${tenant.id}, starting storage cleanup...`);
            const rootFolder = tenant.id;

            // Clean 'logos' bucket (Recursive)
            await cleanBucketFolder(supabaseAdmin, 'logos', rootFolder);

            // Clean 'dishes' bucket (Recursive)
            await cleanBucketFolder(supabaseAdmin, 'dishes', rootFolder);
        }

        // 2. Manually delete the tenant first to ensure data cleanup and avoid FK constraints
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

    // 2. Sign out the user session
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.warn('[DELETE_ACCOUNT] SignOut failed (expected since user is deleted):', e);
    }

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
        // Use recursive cleanup starting from tenant root to catch everything
        // Although specifically for resetMenu we might only want to clean dishes? 
        // Logic says clean everything in tenant's dishes bucket space.
        const rootFolder = tenant.id;
        console.log(`[RESET_MENU] Cleaning dishes bucket for ${rootFolder}`);

        await cleanBucketFolder(supabaseAdmin, 'dishes', rootFolder);

        // 3. Delete DB Data
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
