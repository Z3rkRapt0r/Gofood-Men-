'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Le password non coincidono');
            return;
        }
        if (password.length < 6) {
            toast.error('La password deve essere di almeno 6 caratteri');
            return;
        }

        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                throw error;
            }

            toast.success('Password aggiornata con successo! Reindirizzamento in corso...');
            // Wait a moment for the toast to be readable
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Update password error:', err);
            toast.error('Errore durante l\'aggiornamento. Riprova.');
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
                        Nuova Password 🔐
                    </h2>
                    <p className="text-gray-600">
                        Inserisci la tua nuova password
                    </p>
                </div>

                {/* Card */}
                <Card className="shadow-2xl border-orange-100">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-black text-gray-900">Imposta Password</CardTitle>
                        <CardDescription className="text-gray-600">
                            Scegli una password sicura per il tuo account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-bold">Nuova Password *</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-xl">🔒</span>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 py-6 text-base"
                                        placeholder="Nuova password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-bold">Conferma Password *</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-xl">🔒</span>
                                    </div>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 py-6 text-base"
                                        placeholder="Ripeti password"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 text-lg transition-all hover:scale-[1.02]"
                            >
                                {loading ? 'Aggiornamento...' : 'Imposta Nuova Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
