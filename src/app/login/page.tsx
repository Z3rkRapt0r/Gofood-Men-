'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Clear any existing cache to prevent data leakage from previous sessions
    queryClient.clear();
    queryClient.removeQueries();

    try {
      const supabase = createClient();

      // Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        throw authError;
      }

      if (!data.user) {
        throw new Error('Login fallito. Riprova.');
      }

      // Check if user has a tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('onboarding_completed, restaurant_name')
        .eq('owner_id', data.user.id)
        .single();

      if (tenantError || !tenant) {
        console.log('No tenant found - user needs to complete initial setup');
        router.push('/onboarding');
        return;
      }

      const tenantData = tenant as { onboarding_completed: boolean; restaurant_name: string };

      if (!tenantData.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error && err.message.includes('Invalid login credentials')) {
        setError('Email o password non validi. Riprova.');
      } else {
        setError(err instanceof Error ? err.message : 'Errore durante il login. Riprova.');
      }
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
            <img
              src="/logo-gofood-new.svg"
              alt="GO! FOOD"
              className="h-14 w-auto mx-auto mb-4"
            />
          </Link>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Bentornato! 👋
          </h2>
          <p className="text-gray-600">
            Accedi per gestire il tuo menu
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-orange-100 overflow-hidden">
          <CardHeader className="space-y-1 pt-10 pb-6">
            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Accedi</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Continua a personalizzare il tuo menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 border-2 border-destructive/20 text-destructive rounded-xl p-4 mb-6 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Email *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xl">📧</span>
                  </div>
                  <Input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 py-6 text-base"
                    placeholder="mario@ristorante.it"
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
                    type={showPassword ? "text" : "password"}
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 py-6 text-base"
                    placeholder="La tua password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-orange-600 font-semibold hover:underline">
                  Password dimenticata?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 text-lg transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    Accedi
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-5 pt-4 pb-10 px-8">
            <div className="relative w-full text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-bold tracking-wider">Non hai un account?</span>
              </div>
            </div>

            <Link href="/register" className="w-full">
              <Button
                variant="outline"
                className="w-full py-7 font-black border-2 border-orange-100 hover:border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all text-base rounded-xl"
              >
                Crea un account gratis
              </Button>
            </Link>
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
