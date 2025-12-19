'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Utensils, User, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      {/* Decorative background blobs - maintained but subtle */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-[440px] relative z-10">

        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <img
              src="/logo-gofood-new.svg"
              alt="GO! FOOD"
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        <Card className="border-orange-100 shadow-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Crea il tuo Account</CardTitle>
            <CardDescription className="text-base">
              Crea il tuo menu digitale in pochi minuti.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Nome Ristorante</Label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="restaurantName"
                    placeholder="Es. Trattoria da Mario"
                    type="text"
                    required
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    className="pl-10 h-10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome e Cognome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    placeholder="Mario Rossi"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 h-10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    placeholder="mario@ristorante.it"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-10 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    placeholder="Minimo 6 caratteri"
                    type="password"
                    minLength={6}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 h-10 bg-white"
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  La password deve contenere almeno 6 caratteri.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Hai già un account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 font-medium bg-orange-50/50"
              asChild
            >
              <Link href="/login">
                Accedi al tuo account
              </Link>
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 p-6 rounded-b-xl">


            <p className="text-xs text-center text-gray-500 leading-relaxed mt-2">
              Registrandoti accetti i nostri{' '}
              <a href="#" className="font-medium text-orange-600 hover:underline">Termini di Servizio</a>
              {' '}e la{' '}
              <a href="https://www.iubenda.com/privacy-policy/23100081" className="font-medium text-orange-600 hover:underline">Privacy Policy</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
