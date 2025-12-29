'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        toast.success('Account creato! Controlla la tua email per confermare la registrazione.', { duration: 6000 });
        router.push('/login');
        return;
      }

      // Se arriviamo qui, l'utente è autenticato (email confirmation disabilitata)
      console.log('✓ User authenticated, proceeding with tenant creation');

      // 3. Create tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Supabase client type inference issue
        .insert({
          owner_id: authData.user.id,
          restaurant_name: formData.restaurantName,
          slug: null, // Slug is now nullable and assigned on payment
          onboarding_completed: false,
          onboarding_step: 1,
          subscription_tier: 'free',
          subscription_status: 'active'
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

      const tenant = tenantData as { id: string };
      console.log('✓ Tenant created:', tenant.id);
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
      {/* Decorative background blobs - maintained but subtle */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src="/logo-gofood-new.svg"
              alt="GO! FOOD"
              className="h-14 w-auto mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Inizia la tua avventura! 🚀
          </h2>
          <p className="text-gray-600">
            Crea il tuo menu digitale in pochi minuti
          </p>
        </div>

        <Card className="shadow-2xl border-orange-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-black text-gray-900">Registrati</CardTitle>
            <CardDescription className="text-gray-600">
              Inserisci i tuoi dati per iniziare
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="font-bold">Nome Ristorante *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">🍽️</span>
                  </div>
                  <Input
                    id="restaurantName"
                    placeholder="Es. Trattoria da Mario"
                    type="text"
                    required
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    className="pl-10 py-6 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-bold">Nome e Cognome *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">👤</span>
                  </div>
                  <Input
                    id="fullName"
                    placeholder="Mario Rossi"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 py-6 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Email *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">📧</span>
                  </div>
                  <Input
                    id="email"
                    placeholder="mario@ristorante.it"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 py-6 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold">Password *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">🔒</span>
                  </div>
                  <Input
                    id="password"
                    placeholder="Minimo 6 caratteri"
                    type="password"
                    minLength={6}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 py-6 text-base"
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground ml-1">
                  La password deve contenere almeno 6 caratteri.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 text-lg transition-all hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione account...
                  </>
                ) : (
                  <>
                    Inizia Ora <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="relative w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">Hai già un account?</span>
              </div>
            </div>

            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full py-6 font-bold border-2 border-orange-200 hover:border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                Accedi al tuo account
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-500 leading-relaxed mt-2 px-6">
              Registrandoti accetti i nostri{' '}
              <Link href="/termini-e-condizioni" className="font-medium text-orange-600 hover:underline">Termini di Servizio</Link>
              {' '}e la{' '}
              <a href="https://www.iubenda.com/privacy-policy/23100081" className="font-medium text-orange-600 hover:underline">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-medium">
            ← Torna alla home
          </Link>
        </div>

      </div>
    </div>
  );
}
