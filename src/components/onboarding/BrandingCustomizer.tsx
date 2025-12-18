'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface BrandingCustomizerProps {
  formData: {
    restaurant_name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    hero_title_color?: string;
    hero_tagline_color?: string;
  };
  onUpdate: (updates: Partial<BrandingCustomizerProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BrandingCustomizer({ formData, onUpdate, onNext, onBack }: BrandingCustomizerProps) {
  const [slugError, setSlugError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showCustomPickers, setShowCustomPickers] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // Genera slug da nome ristorante
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Per favore carica un\'immagine valida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'immagine deve essere inferiore a 2MB');
      return;
    }

    if (!formData.slug) {
      toast.error("Inserisci prima il nome del ristorante per generare l'URL");
      return;
    }

    // DEBUG: Verify slug is present and valid
    console.log('[LOGO_UPLOAD] Current Slug:', formData.slug);
    if (!formData.slug || formData.slug.trim() === '') {
      alert('Attenzione: Lo slug non è stato generato correttamente via software. Riprova a scrivere il nome.');
      return;
    }

    setUploadingLogo(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${formData.slug}/${fileName}`;
      console.log('[LOGO_UPLOAD] Generated filePath:', filePath); // DEBUG LOG

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      onUpdate({ logo_url: data.publicUrl });
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      toast.error('Errore durante l\'upload del logo: ' + (err.message || 'Errore sconosciuto'));
    } finally {
      setUploadingLogo(false);
    }
  }

  // Genera slug unico verificando nel DB
  async function generateUniqueSlug(name: string) {
    if (!name) return;
    setIsGeneratingSlug(true);
    setSlugError('');

    const baseSlug = generateSlug(name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    const supabase = createClient();

    try {
      while (true) {
        // Controlla se lo slug esiste
        const { data } = await supabase
          .from('tenants')
          .select('slug')
          .eq('slug', uniqueSlug)
          .neq('slug', formData.slug) // Esclude se stesso (utile in caso di update futuri)
          .maybeSingle(); // Usa maybeSingle per evitare errori se non trova nulla

        if (!data) {
          // Slug disponibile!
          break;
        }

        // Slug occupato, prova con suffisso
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      onUpdate({ slug: uniqueSlug });
    } catch (error) {
      console.error('Error generating slug:', error);
      setSlugError('Errore nella generazione dello slug');
    } finally {
      setIsGeneratingSlug(false);
    }
  }

  async function handleNext() {
    if (!formData.slug) {
      await generateUniqueSlug(formData.restaurant_name);
    }
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
              onChange={(e) => onUpdate({ restaurant_name: e.target.value })}
              onBlur={(e) => generateUniqueSlug(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Es. Trattoria da Mario"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
              URL Menu (Generato automaticamente)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">gofoodmenu.it/</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  id="slug"
                  readOnly
                  value={formData.slug}
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed focus:outline-none"
                  placeholder="Generazione automatica..."
                />
                {isGeneratingSlug && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            {slugError && <p className="text-sm text-red-600">{slugError}</p>}
            {!slugError && formData.slug && !isGeneratingSlug && (
              <p className="text-sm text-green-600">✓ URL disponibile e riservato per te</p>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

          {/* Temi e Colori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Scegli lo stile del tuo menu
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'elegant', name: 'Elegant', primary: '#1a1a1a', secondary: '#c0a062', heroTitle: '#FFFFFF', heroTagline: '#E5E7EB' }, // Fine Dining
                { id: 'organic', name: 'Organic', primary: '#2c5f2d', secondary: '#97bc62', heroTitle: '#FFFFFF', heroTagline: '#E5E7EB' }, // Healthy/Vegan
                { id: 'bistro', name: 'Bistro', primary: '#8b4513', secondary: '#e6ccb2', heroTitle: '#FFFFFF', heroTagline: '#E5E7EB' }, // Bakery/Cafe
                { id: 'minimal', name: 'Minimal', primary: '#2d3436', secondary: '#dfe6e9', heroTitle: '#FFFFFF', heroTagline: '#9CA3AF' }, // Modern
                { id: 'italian', name: 'Italian', primary: '#c0392b', secondary: '#f1c40f', heroTitle: '#FFFFFF', heroTagline: '#E5E7EB' }, // Pizzeria
                { id: 'ocean', name: 'Ocean', primary: '#006994', secondary: '#7ed6df', heroTitle: '#FFFFFF', heroTagline: '#E5E7EB' }, // Seafood
                { id: 'custom', name: 'Custom', primary: null, secondary: null, heroTitle: null, heroTagline: null },
              ].map((theme) => {
                const isSelected =
                  theme.id === 'custom'
                    ? showCustomPickers
                    : !showCustomPickers && formData.primary_color === theme.primary && formData.secondary_color === theme.secondary;

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      if (theme.primary && theme.secondary) {
                        onUpdate({
                          primary_color: theme.primary,
                          secondary_color: theme.secondary,
                          hero_title_color: theme.heroTitle,
                          hero_tagline_color: theme.heroTagline
                        });
                        setShowCustomPickers(false);
                      } else {
                        setShowCustomPickers(true);
                      }
                    }}
                    className={`relative p-3 rounded-xl border-2 transition-all hover:shadow-md text-left group h-full flex flex-col justify-between ${isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-20 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3 w-full">
                      <span className={`text-sm font-bold truncate pr-2 ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                        {theme.name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 -mt-1 -mr-1 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {theme.id !== 'custom' ? (
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded-full shadow-sm border border-black/10"
                          style={{ backgroundColor: theme.primary! }}
                          title="Colore Primario"
                        />
                        <div
                          className="w-8 h-8 rounded-full shadow-sm border border-black/10"
                          style={{ backgroundColor: theme.secondary! }}
                          title="Colore Secondario"
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 shadow-sm opacity-80" />
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white">
                          <span className="text-xs font-bold">+</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Pickers - Show only if custom is selected (or implied) */}
            {/* Custom Color Pickers - Show only if custom is selected (or implied) */}
            {showCustomPickers && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 animate-in fade-in slide-in-from-top-2">
                <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
                  Colori Personalizzati
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label htmlFor="primary_color" className="block text-xs font-bold text-gray-700 mb-2">
                    PRIMARIO
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <input
                        type="color"
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => onUpdate({ primary_color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full h-full rounded-lg border-2 border-gray-200 shadow-inner"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => onUpdate({ primary_color: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label htmlFor="secondary_color" className="block text-xs font-bold text-gray-700 mb-2">
                    SECONDARIO
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <input
                        type="color"
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full h-full rounded-lg border-2 border-gray-200 shadow-inner"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  /* eslint-disable-next-line @next/next/no-img-element */
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
              <span className="font-mono font-semibold">gofoodmenu.it/{formData.slug || 'tuo-slug'}</span>
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
