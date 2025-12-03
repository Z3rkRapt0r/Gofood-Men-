'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState('');

  const [formData, setFormData] = useState({
    restaurantName: '',
    slug: '',
    contactEmail: '',
    phone: '',
    address: '',
    city: '',
    primaryColor: '#8B0000',
    secondaryColor: '#D4AF37',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error || !tenant) return;

      setTenantId(tenant.id);
      setFormData({
        restaurantName: tenant.restaurant_name || '',
        slug: tenant.slug || '',
        contactEmail: tenant.contact_email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        city: tenant.city || '',
        primaryColor: tenant.primary_color || '#8B0000',
        secondaryColor: tenant.secondary_color || '#D4AF37',
      });
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('tenants')
        .update({
          restaurant_name: formData.restaurantName,
          slug: formData.slug,
          contact_email: formData.contactEmail,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
        })
        .eq('id', tenantId);

      if (error) throw error;

      alert('✅ Impostazioni salvate con successo!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('❌ Errore nel salvataggio: ' + (err instanceof Error ? err.message : 'Riprova'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Impostazioni ⚙️
        </h1>
        <p className="text-gray-600">
          Gestisci le impostazioni del tuo ristorante
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informazioni Ristorante */}
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
                Slug (URL) *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
                  placeholder="il-mio-ristorante"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Il menu sarà disponibile su: /{formData.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informazioni di Contatto
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email
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
                Telefono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="+39 06 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Via Roma, 123"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Città
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Roma"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Personalizzazione
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Colore Primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usato per header e accenti
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Colore Secondario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usato per badge e decorazioni
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
            <p className="text-sm font-bold text-gray-700 mb-3">Anteprima Colori:</p>
            <div className="flex gap-3">
              <div
                className="flex-1 h-20 rounded-lg shadow-sm flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Primario
              </div>
              <div
                className="flex-1 h-20 rounded-lg shadow-sm flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                Secondario
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Salva Modifiche</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
