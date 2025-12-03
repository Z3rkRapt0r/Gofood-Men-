'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurantName: '',
    fullName: ''
  });

  // Generate slug from restaurant name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            full_name: formData.fullName,
            restaurant_name: formData.restaurantName
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message || 'Errore durante la registrazione');
      }

      if (!authData.user) {
        throw new Error('Registrazione fallita. Riprova.');
      }

      console.log('✓ User created:', authData.user.id);
      console.log('✓ Profile created automatically by trigger');

      // Verifica se l'utente deve confermare l'email
      if (authData.session === null) {
        // Email confirmation richiesta
        console.log('⚠️ Email confirmation required - tenant will be created after confirmation');

        // Mostra messaggio all'utente
        setError(null);
        alert('✅ Account creato! Controlla la tua email per confermare la registrazione. Dopo la conferma potrai accedere e completare il setup.');
        router.push('/login');
        return;
      }

      // Se arriviamo qui, l'utente è autenticato (email confirmation disabilitata)
      console.log('✓ User authenticated, proceeding with tenant creation');

      // NOTA: Il profile viene creato automaticamente dal trigger SQL
      // handle_new_user() quando l'utente si registra.
      // Non è necessario crearlo manualmente qui.

      // 2. Generate unique slug
      let slug = generateSlug(formData.restaurantName);
      let slugAttempt = 0;

      console.log('Generating unique slug from:', formData.restaurantName);

      while (true) {
        const testSlug = slugAttempt === 0 ? slug : `${slug}-${slugAttempt}`;

        const { data: existing } = await supabase
          .from('tenants')
          .select('slug')
          .eq('slug', testSlug)
          .single();

        if (!existing) {
          slug = testSlug;
          console.log('✓ Slug available:', slug);
          break;
        }

        slugAttempt++;
      }

      // 3. Create tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          owner_id: authData.user.id,
          restaurant_name: formData.restaurantName,
          slug: slug,
          onboarding_completed: false,
          onboarding_step: 1,
          subscription_tier: 'free',
          max_dishes: 50,
          max_categories: 10
        })
        .select()
        .single();

      if (tenantError) {
        console.error('Tenant creation error:', JSON.stringify(tenantError, null, 2));
        throw new Error(`Errore creazione ristorante: ${tenantError.message || 'Errore sconosciuto'}`);
      }

      if (!tenantData) {
        throw new Error('Errore: Tenant non creato');
      }

      console.log('✓ Tenant created:', tenantData.id);
      console.log('✓ Registration complete! Redirecting to onboarding...');

      // 4. Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      {/* Decorative background blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-gofood.png"
              alt="GO! FOOD"
              width={150}
              height={60}
              className="h-14 w-auto mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Inizia la tua avventura digitale! 🚀
          </h2>
          <p className="text-gray-600">
            Crea il tuo menu in 5 minuti
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Inizia Ora
            </h1>
            <p className="text-gray-600 text-sm">
              Solo <span className="font-bold text-orange-600">€19.90/mese</span> · Cancella quando vuoi
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-bold text-gray-900 mb-2">
                Nome Ristorante *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl">🍽️</span>
                </div>
                <input
                  type="text"
                  id="restaurantName"
                  required
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                  placeholder="Es. Trattoria da Mario"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-bold text-gray-900 mb-2">
                Nome e Cognome *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl">👤</span>
                </div>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                  placeholder="Mario Rossi"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl">📧</span>
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                  placeholder="mario@ristorante.it"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-xl">🔒</span>
                </div>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                  placeholder="Minimo 6 caratteri"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Minimo 6 caratteri, consigliamo l&apos;uso di caratteri speciali
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creazione account...</span>
                </>
              ) : (
                <>
                  <span>Inizia Ora</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium">Hai già un account?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="w-full block text-center bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold py-3.5 px-6 rounded-xl transition-all border-2 border-orange-200 hover:border-orange-300"
          >
            Accedi al tuo account
          </Link>

          {/* Terms */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Registrandoti accetti i nostri{' '}
              <a href="#" className="text-orange-600 font-semibold hover:underline">Termini di Servizio</a>
              {' '}e la{' '}
              <a href="#" className="text-orange-600 font-semibold hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-black text-gray-900 text-lg">
              Tutto incluso a €19.90/mese
            </h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-orange-600 font-black text-lg">✓</span>
              <span className="font-semibold">Fino a 50 piatti e 10 categorie</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-orange-600 font-black text-lg">✓</span>
              <span className="font-semibold">Menu multilingua (IT, EN)</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-orange-600 font-black text-lg">✓</span>
              <span className="font-semibold">Personalizzazione completa</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-orange-600 font-black text-lg">✓</span>
              <span className="font-semibold">Gestione allergeni EU</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-orange-600 font-black text-lg">✓</span>
              <span className="font-semibold">Cancella quando vuoi</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
