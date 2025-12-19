'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteAccount, resetMenu } from '@/app/actions/account';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Reset Menu State
    const [showResetMenuModal, setShowResetMenuModal] = useState(false);
    const [resetMenuConfirmation, setResetMenuConfirmation] = useState('');
    const [isResettingMenu, setIsResettingMenu] = useState(false);

    // New State for Restaurant Info
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tenantId, setTenantId] = useState('');
    const [formData, setFormData] = useState({
        restaurantName: '',
        tagline: '',
        slug: '',
        contactEmail: '',
        coverCharge: 0,
    });

    useEffect(() => {
        loadTenantData();
    }, []);

    async function loadTenantData() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data: tenant, error } = await (supabase.from('tenants') as any)
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (error || !tenant) return;

            setTenantId(tenant.id);
            setFormData({
                restaurantName: tenant.restaurant_name || '',
                tagline: tenant.tagline || '',
                slug: tenant.slug || '',
                contactEmail: tenant.contact_email || '',
                coverCharge: tenant.cover_charge || 0,
            });
        } catch (err) {
            console.error('Error loading account data:', err);
            toast.error('Errore nel caricamento dei dati');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        try {
            const { error } = await (supabase.from('tenants') as any)
                .update({
                    restaurant_name: formData.restaurantName,
                    tagline: formData.tagline,
                    slug: formData.slug.trim() === '' ? null : formData.slug,
                    contact_email: formData.contactEmail,
                    cover_charge: formData.coverCharge,
                })
                .eq('id', tenantId);

            if (error) {
                console.error('Supabase update error:', error);
                throw new Error(error.message || 'Errore sconosciuto durante l\'aggiornamento');
            }
            toast.success('Informazioni salvate con successo!');
        } catch (err: any) {
            console.error('Error saving account data:', err);
            toast.error(`Errore durante il salvataggio: ${err.message || 'Dettagli non disponibili'}`);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteAccount() {
        if (deleteConfirmation.trim().toUpperCase() !== 'ELIMINA') {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount();
            // Redirect manually since the server action now returns instead of throwing redirect
            window.location.href = '/';
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Errore durante l\'eliminazione dell\'account');
            setIsDeleting(false);
        }
    }

    async function handleResetMenu() {
        if (resetMenuConfirmation.trim().toUpperCase() !== 'RESET') {
            return;
        }

        setIsResettingMenu(true);
        try {
            await resetMenu();
            toast.success('Menu resettato con successo');
            setShowResetMenuModal(false);
            setResetMenuConfirmation('');
        } catch (error) {
            console.error('Error resetting menu:', error);
            toast.error('Errore durante il reset del menu');
        } finally {
            setIsResettingMenu(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Il tuo Account 👤
                </h1>
                <p className="text-gray-600">
                    Gestisci le impostazioni del ristorante e del tuo account
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Informazioni Base Ristorante */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle>Informazioni Ristorante</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="restaurantName" className="font-bold">Nome Ristorante *</Label>
                                <Input
                                    id="restaurantName"
                                    type="text"
                                    required
                                    value={formData.restaurantName}
                                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                    placeholder="Il Mio Ristorante"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tagline" className="font-bold">Slogan (sotto il nome)</Label>
                                <Input
                                    id="tagline"
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    placeholder="Autentica cucina romana..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug" className="font-bold">Slug (URL) *</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 font-mono text-lg">/</span>
                                    <Input
                                        id="slug"
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        className="bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
                                        placeholder="il-mio-ristorante"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Il menu sarà disponibile su: /{formData.slug}, se desideri cambiarlo contatta l&apos;assistenza
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail" className="font-bold">Email Contatto</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        placeholder="info@ristorante.it"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="coverCharge" className="font-bold">Costo Coperto (€)</Label>
                                    <Input
                                        id="coverCharge"
                                        type="number"
                                        step="0.10"
                                        min="0"
                                        value={formData.coverCharge}
                                        onChange={(e) => setFormData({ ...formData, coverCharge: parseFloat(e.target.value) })}
                                        placeholder="2.50"
                                        className="font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Questo importo verrà mostrato nella pagina allergeni/legale.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-lg hover:scale-[1.02]"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    <span>Salvataggio...</span>
                                </>
                            ) : (
                                <span>Salva Modifiche</span>
                            )}
                        </Button>
                    </div>
                </form>
            )}

            {/* Gestione Account */}
            <Card className="shadow-sm border-red-200 overflow-hidden">
                <div className="relative z-10 p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">
                        ZONA PERICOLOSA ⚠️
                    </h2>
                    <p className="text-gray-600 mb-6">
                        In questa sezione puoi gestire le azioni sensibili relative al tuo account.
                    </p>

                    <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Reset Menu Completo</h3>
                            <p className="text-sm text-red-600">
                                Cancella TUTTI i piatti e le categorie. Le immagini verranno rimosse. Le impostazioni del ristorante rimangono.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowResetMenuModal(true)}
                            className="bg-white border text-red-600 hover:bg-red-50 border-red-200"
                        >
                            Reset Menu
                        </Button>
                    </div>

                    <div className="mt-6 bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Elimina Account</h3>
                            <p className="text-sm text-red-600">
                                L&apos;eliminazione dell&apos;account è irreversibile. Tutti i tuoi dati, menu e impostazioni verranno cancellati permanentemente.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-white border text-red-600 hover:bg-red-50 border-red-200"
                        >
                            Elimina Account
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Reset Menu Confirmation Modal */}
            {showResetMenuModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🍽️</span>
                            </div>
                            <CardTitle className="text-xl">Resettare il Menu?</CardTitle>
                            <CardDescription>
                                Verranno eliminati <span className="font-bold text-red-600">tutti i piatti e le categorie</span>. Questa azione è irreversibile. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">RESET</span> per confermare.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <Input
                                type="text"
                                value={resetMenuConfirmation}
                                onChange={(e) => setResetMenuConfirmation(e.target.value)}
                                placeholder="RESET"
                                className="text-center font-bold tracking-widest uppercase border-2 focus-visible:ring-red-500"
                            />
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowResetMenuModal(false);
                                        setResetMenuConfirmation('');
                                    }}
                                    disabled={isResettingMenu}
                                    className="flex-1"
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleResetMenu}
                                    disabled={resetMenuConfirmation.trim().toUpperCase() !== 'RESET' || isResettingMenu}
                                    className="flex-1"
                                >
                                    {isResettingMenu ? 'Resettando...' : 'Conferma Reset'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200 shadow-2xl">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <CardTitle className="text-xl">Sei assolutamente sicuro?</CardTitle>
                            <CardDescription>
                                Questa azione non può essere annullata. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">ELIMINA</span> qui sotto per confermare.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <Input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="ELIMINA"
                                className="text-center font-bold tracking-widest uppercase border-2 focus-visible:ring-red-500"
                            />
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                    }}
                                    disabled={isDeleting}
                                    className="flex-1"
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation.trim().toUpperCase() !== 'ELIMINA' || isDeleting}
                                    className="flex-1"
                                >
                                    {isDeleting ? 'Eliminazione...' : 'Elimina tutto'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
