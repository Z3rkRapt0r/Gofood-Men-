'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback/reset`,
            });

            if (error) {
                throw error;
            }

            setSuccess(true);
            toast.success('Email di recupero inviata!');
        } catch (err) {
            console.error('Reset password error:', err);
            toast.error('Errore durante l\'invio. Riprova più tardi.');
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
                        Recupera Password 🔐
                    </h2>
                    <p className="text-gray-600">
                        Inserisci la tua email per reimpostare la password
                    </p>
                </div>

                {/* Card */}
                <Card className="shadow-2xl border-orange-100">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-black text-gray-900">Recupero</CardTitle>
                        <CardDescription className="text-gray-600">
                            Ti invieremo un link per creare una nuova password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="bg-green-50 border-2 border-green-100 text-green-700 rounded-xl p-6 text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">✅</span>
                                </div>
                                <h3 className="font-bold text-lg">Email Inviata!</h3>
                                <p className="text-sm">
                                    Controlla la tua casella di posta (e lo spam). Troverai un link per reimpostare la tua password.
                                </p>
                                <Link href="/login">
                                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold">
                                        Torna al Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 py-6 text-base"
                                            placeholder="mario@ristorante.it"
                                        />
                                    </div>
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
                                            Invio in corso...
                                        </>
                                    ) : (
                                        <>
                                            Invia Link
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    {!success && (
                        <CardFooter className="flex flex-col space-y-4 pt-2">
                            <Link href="/login" className="w-full">
                                <Button variant="outline" className="w-full py-6 font-bold border-2 border-gray-200 hover:border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-orange-700">
                                    Torna al Login
                                </Button>
                            </Link>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
