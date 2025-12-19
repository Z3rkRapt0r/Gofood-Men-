'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteAccount, resetMenu } from '@/app/actions/account';
import { createClient } from '@/lib/supabase/client';

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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Informazioni Ristorante
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Nome Ristorante *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.restaurantName}
                                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="Il Mio Ristorante"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Slogan (sotto il nome)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tagline}
                                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                    placeholder="Autentica cucina romana..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Slug (URL) *
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">/</span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
                                        placeholder="il-mio-ristorante"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Il menu sarà disponibile su: /{formData.slug}, se desideri cambiarlo contatta l&apos;assistenza
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Email Contatto
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        placeholder="info@ristorante.it"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Costo Coperto (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.10"
                                        min="0"
                                        value={formData.coverCharge}
                                        onChange={(e) => setFormData({ ...formData, coverCharge: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
                                        placeholder="2.50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Questo importo verrà mostrato nella pagina allergeni/legale.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Salvataggio...</span>
                                </>
                            ) : (
                                <span>Salva Modifiche</span>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Gestione Account */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 overflow-hidden">
                <div className="relative z-10">
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
                        <button
                            type="button"
                            onClick={() => setShowResetMenuModal(true)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                        >
                            Reset Menu
                        </button>
                    </div>

                    <div className="mt-6 bg-red-50 rounded-xl p-4 border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-red-800 mb-1">Elimina Account</h3>
                            <p className="text-sm text-red-600">
                                L&apos;eliminazione dell&apos;account è irreversibile. Tutti i tuoi dati, menu e impostazioni verranno cancellati permanentemente.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="whitespace-nowrap px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                        >
                            Elimina Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Reset Menu Confirmation Modal */}
            {showResetMenuModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🍽️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Resettare il Menu?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Verranno eliminati <span className="font-bold">tutti i piatti e le categorie</span>. Questa azione è irreversibile. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">RESET</span> per confermare.
                            </p>
                        </div>

                        <input
                            type="text"
                            value={resetMenuConfirmation}
                            onChange={(e) => setResetMenuConfirmation(e.target.value)}
                            placeholder="RESET"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-bold tracking-widest mb-6 uppercase"
                        />

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowResetMenuModal(false);
                                    setResetMenuConfirmation('');
                                }}
                                disabled={isResettingMenu}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Annulla
                            </button>
                            <button
                                type="button"
                                onClick={handleResetMenu}
                                disabled={resetMenuConfirmation.trim().toUpperCase() !== 'RESET' || isResettingMenu}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isResettingMenu ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Resettando...</span>
                                    </>
                                ) : (
                                    <span>Conferma Reset</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Sei assolutamente sicuro?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Questa azione non può essere annullata. Scrivi <span className="font-bold font-mono bg-gray-100 px-1 rounded">ELIMINA</span> qui sotto per confermare.
                            </p>
                        </div>

                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="ELIMINA"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-bold tracking-widest mb-6 uppercase"
                        />

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Annulla
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation.trim().toUpperCase() !== 'ELIMINA' || isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Eliminazione...</span>
                                    </>
                                ) : (
                                    <span>Elimina tutto</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
