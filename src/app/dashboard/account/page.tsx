'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { deleteAccount, resetMenu } from '@/app/actions/account';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';

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
        footerData: {
            locations: [] as FooterLocation[],
            socials: [] as FooterSocial[],
            show_brand_column: true,
            brand_description: { it: '', en: '' }
        } as FooterData,
    });

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => {
        loadTenantData();
    }, []);

    async function loadTenantData() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: tenant, error } = await (supabase.from('tenants') as any)
                .select('*, tenant_locations(*)')
                .eq('owner_id', user.id)
                .single();

            if (error || !tenant) return;

            setTenantId(tenant.id);

            // Map tenant_locations to FooterLocation format for UI
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbLocations = tenant.tenant_locations || [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const uiLocations: FooterLocation[] = dbLocations.map((l: any) => ({
                city: l.city,
                address: l.address,
                phone: l.phone || '',
                opening_hours: l.opening_hours || ''
            }));

            setFormData({
                restaurantName: tenant.restaurant_name || '',
                tagline: tenant.tagline || '',
                slug: tenant.slug || '',
                contactEmail: tenant.contact_email || '',
                coverCharge: tenant.cover_charge || 0,
                footerData: {
                    ...(tenant.footer_data || {
                        socials: [],
                        show_brand_column: true,
                    }),
                    locations: uiLocations,
                },
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
            // 1. Update Tenant Info
            const { error: tenantError } = await (supabase.from('tenants') as any)
                .update({
                    restaurant_name: formData.restaurantName,
                    // tagline: formData.tagline, // Removed column write
                    slug: formData.slug.trim() === '' ? null : formData.slug,
                    contact_email: formData.contactEmail,
                    cover_charge: formData.coverCharge,
                    footer_data: {
                        ...formData.footerData,
                        locations: [] // We don't store locations in the JSON column anymore, but keep structure for UI consistency if needed elsewhere
                    }
                })
                .eq('id', tenantId);

            if (tenantError) {
                console.error('Supabase update error:', tenantError);
                throw new Error(tenantError.message || 'Errore sconosciuto durante l\'aggiornamento');
            }

            // 2. Update Locations (Delete Old -> Insert New)
            // Delete old
            const { error: deleteError } = await (supabase.from('tenant_locations') as any)
                .delete()
                .eq('tenant_id', tenantId);

            if (deleteError) {
                throw new Error(`Locations Delete Error: ${deleteError.message}`);
            }

            // Insert new
            const locationsToInsert = formData.footerData.locations.map((loc, idx) => ({
                tenant_id: tenantId,
                city: loc.city,
                address: loc.address,
                phone: loc.phone || null,
                opening_hours: loc.opening_hours || null,
                is_primary: idx === 0
            }));

            if (locationsToInsert.length > 0) {
                const { error: insertError } = await (supabase.from('tenant_locations') as any)
                    .insert(locationsToInsert);

                if (insertError) {
                    throw new Error(`Locations Insert Error: ${insertError.message}`);
                }
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

    async function handlePasswordChange() {
        if (!newPassword || !confirmPassword) {
            toast.error('Compila entrambi i campi password');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Le password non coincidono');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La password deve essere lunga almeno 6 caratteri');
            return;
        }

        setIsUpdatingPassword(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                throw error;
            }

            toast.success('Password aggiornata con successo!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(`Errore: ${error.message}`);
        } finally {
            setIsUpdatingPassword(false);
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

                    {/* Footer Customization (Moved from Design Studio) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personalizzazione Footer</CardTitle>
                            <CardDescription>Gestisci le informazioni visualizzate nel footer del tuo menu digitale.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Brand Description */}
                            <div className="space-y-2">
                                <Label htmlFor="brand-desc">Descrizione Brand</Label>
                                <p className="text-xs text-muted-foreground">
                                    Questa descrizione apparirà nel footer sotto il logo.
                                </p>
                                <Textarea
                                    id="brand-desc"
                                    value={formData.footerData.brand_description?.it || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        footerData: {
                                            ...formData.footerData,
                                            brand_description: {
                                                ...formData.footerData.brand_description,
                                                it: e.target.value,
                                                en: e.target.value
                                            }
                                        }
                                    })}
                                    placeholder="Scopri i nostri piatti e le nostre specialità..."
                                    className="resize-none h-24"
                                />
                            </div>

                            {/* Locations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Sedi</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({
                                            ...formData,
                                            footerData: {
                                                ...formData.footerData,
                                                locations: [...formData.footerData.locations, { city: '', address: '', phone: '', opening_hours: '' }]
                                            }
                                        })}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Aggiungi Sede
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {formData.footerData.locations.map((loc, index) => (
                                        <Card key={index} className="bg-muted/30">
                                            <CardContent className="p-4 flex gap-3 items-start">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                                                    <Input
                                                        placeholder="Città"
                                                        value={loc.city}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].city = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Indirizzo"
                                                        value={loc.address}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].address = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Telefono (opzionale)"
                                                        value={loc.phone || ''}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].phone = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Orari (es. Lun-Dom: 12-23)"
                                                        value={loc.opening_hours || ''}
                                                        onChange={(e) => {
                                                            const newLocs = [...formData.footerData.locations];
                                                            newLocs[index].opening_hours = e.target.value;
                                                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newLocs = formData.footerData.locations.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                                                    }}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {formData.footerData.locations.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                            Nessuna sede aggiunta.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Social Network</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({
                                            ...formData,
                                            footerData: {
                                                ...formData.footerData,
                                                socials: [...formData.footerData.socials, { platform: 'other', url: '' }]
                                            }
                                        })}
                                        className="gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Aggiungi Social
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {formData.footerData.socials.map((social, index) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                                <Select
                                                    value={social.platform}
                                                    onValueChange={(value) => {
                                                        const newSocials = [...formData.footerData.socials];
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        newSocials[index].platform = value as any;
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Social" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="facebook">Facebook</SelectItem>
                                                        <SelectItem value="instagram">Instagram</SelectItem>
                                                        <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                                                        <SelectItem value="website">Sito Web</SelectItem>
                                                        <SelectItem value="other">Altro</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Input
                                                    className="md:col-span-2"
                                                    placeholder="URL Profilo"
                                                    value={social.url}
                                                    onChange={(e) => {
                                                        const newSocials = [...formData.footerData.socials];
                                                        newSocials[index].url = e.target.value;
                                                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                    }}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newSocials = formData.footerData.socials.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                                                }}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {formData.footerData.socials.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                                            Nessun social aggiunto.
                                        </p>
                                    )}
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

            {/* Sicurezza e Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Sicurezza</CardTitle>
                    <CardDescription>Aggiorna la password del tuo account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nuova Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Conferma Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            type="button" // Important: type button prevents form submit of the main form
                            onClick={handlePasswordChange}
                            disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                            variant="secondary"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-900"
                        >
                            {isUpdatingPassword ? 'Aggiornamento...' : 'Aggiorna Password'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
