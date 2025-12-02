/**
 * Supabase Client (Client-Side)
 *
 * Usa questo client per operazioni client-side (browser):
 * - Fetch dati nelle componenti Client Components
 * - Autenticazione (login, signup, logout)
 * - Operazioni che richiedono interazione utente
 *
 * Questo client rispetta le Row Level Security (RLS) policies.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export singleton instance per convenience
export const supabase = createClient();
