'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BrandingCustomizerProps {
  formData: {
    restaurant_name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
  };
  onUpdate: (updates: Partial<BrandingCustomizerProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BrandingCustomizer({ formData, onUpdate, onNext, onBack }: BrandingCustomizerProps) {
  const [slugError, setSlugError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Genera slug da nome ristorante
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Verifica unicità slug
  async function checkSlugAvailability(slug: string) {
    if (!slug || slug.length < 3) {
      setSlugError('Lo slug deve essere di almeno 3 caratteri');
      return false;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('tenants')
      .select('slug')
      .eq('slug', slug)
      .neq('slug', formData.slug) // Esclude lo slug attuale
      .single();

    if (data) {
      setSlugError('Questo slug è già in uso. Prova con un altro.');
      return false;
    }

    setSlugError('');
    return true;
  }

  // Upload logo (placeholder - da implementare con Supabase Storage)
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione
    if (!file.type.startsWith('image/')) {
      alert('Per favore carica un\'immagine valida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('L\'immagine deve essere inferiore a 2MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // TODO: Implementare upload su Supabase Storage
      // Per ora usa data URL come placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading logo:', err);
      alert('Errore durante l\'upload del logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleNext() {
    // Verifica slug prima di procedere
    const isSlugValid = await checkSlugAvailability(formData.slug);
    if (!isSlugValid) return;

    onNext();
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Personalizza il tuo menu
        </h2>
        <p className="text-lg text-gray-600">
          Configura logo, colori e URL del tuo menu
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Form */}
        <div className="space-y-6">
          {/* Nome Ristorante */}
          <div>
            <label htmlFor="restaurant_name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Ristorante *
            </label>
            <input
              type="text"
              id="restaurant_name"
              required
              value={formData.restaurant_name}
              onChange={(e) => {
                onUpdate({ restaurant_name: e.target.value });
                // Auto-genera slug se non modificato manualmente
                if (!formData.slug || formData.slug === generateSlug(formData.restaurant_name)) {
                  onUpdate({ slug: generateSlug(e.target.value) });
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Es. Trattoria da Mario"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
              URL Menu (slug) *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">menubuilder.com/</span>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => onUpdate({ slug: e.target.value.toLowerCase() })}
                onBlur={(e) => checkSlugAvailability(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${slugError ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="trattoria-mario"
              />
            </div>
            {slugError && <p className="text-sm text-red-600">{slugError}</p>}
            {!slugError && formData.slug && (
              <p className="text-sm text-green-600">✓ Slug disponibile</p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo Ristorante
            </label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <div className="w-20 h-20 border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
                {uploadingLogo ? 'Caricamento...' : formData.logo_url ? 'Cambia Logo' : 'Carica Logo'}
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG o SVG. Max 2MB.</p>
          </div>

          {/* Colori */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary_color" className="block text-sm font-semibold text-gray-700 mb-2">
                Colore Primario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => onUpdate({ primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => onUpdate({ primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Header e accenti</p>
            </div>

            <div>
              <label htmlFor="secondary_color" className="block text-sm font-semibold text-gray-700 mb-2">
                Colore Secondario
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="secondary_color"
                  value={formData.secondary_color}
                  onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Badge e decorazioni</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="sticky top-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Anteprima Menu</h3>
            <div
              className="border-4 border-gray-300 rounded-2xl overflow-hidden shadow-xl"
              style={{
                '--preview-primary': formData.primary_color,
                '--preview-secondary': formData.secondary_color
              } as React.CSSProperties}
            >
              {/* Mock Header */}
              <div
                className="p-4 text-center"
                style={{ backgroundColor: formData.primary_color }}
              >
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="h-12 mx-auto object-contain"
                  />
                ) : (
                  <div className="text-white font-bold text-lg">
                    {formData.restaurant_name || 'Il Tuo Ristorante'}
                  </div>
                )}
              </div>

              {/* Mock Content */}
              <div className="bg-cream p-4 space-y-3">
                <div className="bg-white rounded-lg p-3 shadow">
                  <div
                    className="text-sm font-bold mb-1"
                    style={{ color: formData.primary_color }}
                  >
                    Categoria Esempio
                  </div>
                  <div className="text-xs text-gray-600">Piatto di esempio</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Descrizione breve</span>
                    <span
                      className="font-bold text-sm"
                      style={{ color: formData.primary_color }}
                    >
                      €12.00
                    </span>
                  </div>
                </div>

                <div
                  className="text-xs text-center py-2 px-3 rounded-full font-semibold text-white"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  Badge Esempio
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Il tuo menu sarà disponibile su:<br />
              <span className="font-mono font-semibold">menubuilder.com/{formData.slug || 'tuo-slug'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ← Indietro
        </button>
        <button
          onClick={handleNext}
          disabled={!formData.restaurant_name || !formData.slug || !!slugError}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          Continua →
        </button>
      </div>
    </div>
  );
}
