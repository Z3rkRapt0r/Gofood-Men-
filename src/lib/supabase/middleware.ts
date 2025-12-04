/**
 * Supabase Middleware Client
 *
 * Usa questo client nel middleware Next.js per:
 * - Refresh automatico delle sessioni utente
 * - Protezione route (redirect se non autenticato)
 * - Gestione cookie attraverso le richieste
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Refresh della sessione
  // Questo mantiene l'utente loggato aggiornando automaticamente i token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protezione route /dashboard/*
  // Se l'utente non è autenticato, redirect a /login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Protezione route /onboarding
  // Se l'utente non è autenticato, redirect a /login
  if (request.nextUrl.pathname.startsWith('/onboarding') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Se l'utente è autenticato e va a /login o /signup, redirect a /dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
