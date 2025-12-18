
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
        // 1. Manually delete the tenant first to ensure data cleanup and avoid FK constraints
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

        // 2. Delete user from auth.users
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

    // 3. Redirect to home
    redirect('/');
}
