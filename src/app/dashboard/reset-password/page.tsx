'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

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

            toast.success('Password aggiornata con successo!');
            router.push('/dashboard');
        } catch (err) {
            console.error('Update password error:', err);
            toast.error('Errore durante l\'aggiornamento. Riprova.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-orange-100">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <CardTitle className="text-2xl font-black text-gray-900">Nuova Password</CardTitle>
                    <CardDescription>
                        Inserisci la tua nuova password per accedere al tuo account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nuova Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nuova password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Conferma Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ripeti password"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-6 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Aggiornamento...' : 'Imposta Nuova Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
