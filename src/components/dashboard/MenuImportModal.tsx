'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// Define types from Database definition
// type DbCategoryInsert = Database['public']['Tables']['categories']['Insert'];
// type DbDishInsert = Database['public']['Tables']['dishes']['Insert'];
// type InsertedCategory = Database['public']['Tables']['categories']['Row'];

// Remove top-level import
// import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Dish {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    selected?: boolean;
}

interface MenuImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MenuImportModal({ isOpen, onClose, onSuccess, tenantId, categories }: MenuImportModalProps & { categories: any[] }) {
    const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [previews, setPreviews] = useState<string[]>([]);
    const [analyzedDishes, setAnalyzedDishes] = useState<Dish[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isReadingFile, setIsReadingFile] = useState(false); // New state for file reading
    // ... existing state ...
    const [readingProgress, setReadingProgress] = useState({ current: 0, total: 0 });
    const [draftFound, setDraftFound] = useState(false); // New state to track if draft exists
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load draft on mount
    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem('menu-import-draft');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setDraftFound(true);
                    }
                } catch (e) {
                    console.error('Failed to parse draft', e);
                    localStorage.removeItem('menu-import-draft');
                }
            } else {
                setDraftFound(false);
            }

            // Reset other states
            setStep('upload');
            setPreviews([]);
            setAnalyzedDishes([]);
            setError(null);
            setProcessingProgress({ current: 0, total: 0 });
            setIsReadingFile(false);
            setReadingProgress({ current: 0, total: 0 });
        }
    }, [isOpen]);

    // Auto-save analyzed dishes
    useEffect(() => {
        if (analyzedDishes.length > 0) {
            localStorage.setItem('menu-import-draft', JSON.stringify(analyzedDishes));
        }
    }, [analyzedDishes]);

    const handleRestoreDraft = () => {
        try {
            const savedDraft = localStorage.getItem('menu-import-draft');
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                setAnalyzedDishes(parsed);
                setStep('review');
                setDraftFound(false); // Hide prompt
            }
        } catch (e) {
            console.error(e);
            setError('Impossibile ripristinare la bozza.');
        }
    };

    const handleDiscardDraft = () => {
        localStorage.removeItem('menu-import-draft');
        setDraftFound(false);
    };



    if (!isOpen) return null;

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const convertPdfToImages = async (file: File, onProgress: (current: number, total: number) => void): Promise<string[]> => {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const images: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                // @ts-expect-error - pdfjs-dist type mismatch
                await page.render(renderContext).promise;
                images.push(canvas.toDataURL('image/jpeg', 0.8));
            }

            // Report progress
            onProgress(i, pdf.numPages);
        }

        return images;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsReadingFile(true);
            setReadingProgress({ current: 0, total: 0 });

            const newFiles = Array.from(e.target.files);
            setError(null);

            // Generate previews
            const newPreviews: string[] = [];
            for (const file of newFiles) {
                if (file.type === 'application/pdf') {
                    try {
                        const pdfImages = await convertPdfToImages(file, (c, t) => {
                            setReadingProgress({ current: c, total: t });
                        });
                        newPreviews.push(...pdfImages);
                    } catch (err) {
                        console.error('Error converting PDF:', err);
                        setError('Errore nella lettura del PDF. Riprova.');
                    }
                } else {
                    const base64 = await convertFileToBase64(file);
                    newPreviews.push(base64);
                }
            }
            setPreviews(prev => [...prev, ...newPreviews]);
            setIsReadingFile(false);
        }
    };

    const handleAnalyze = async () => {
        if (previews.length === 0) return;

        setStep('processing');
        setError(null);
        setAnalyzedDishes([]); // Clear previous

        try {
            const imagesToSend = previews.map(p => p.split(',')[1]);
            const BATCH_SIZE = 3; // Process 3 pages at a time to avoid AI limits
            const chunks = [];

            for (let i = 0; i < imagesToSend.length; i += BATCH_SIZE) {
                chunks.push(imagesToSend.slice(i, i + BATCH_SIZE));
            }

            // Initialize progress
            setProcessingProgress({ current: 0, total: imagesToSend.length });

            const allProcessedDishes: Dish[] = [];
            let processedCount = 0;

            for (const chunk of chunks) {
                try {
                    const response = await fetch('/api/ai/analyze-menu', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            images: chunk,
                            categories: categories.map(c => ({ id: c.id, name: c.name }))
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Batch error:', errorData);
                        // Continue with other batches if one fails?
                        // Or maybe just log it and show partial results?
                        // For now let's just log and continue.
                    } else {
                        const data = await response.json();
                        if (data.dishes && Array.isArray(data.dishes)) {
                            // Map dishes from this batch
                            const batchDishes = data.dishes.map((dish: Dish) => ({
                                ...dish,
                                selected: true,
                                categoryId: categories.find(c => c.id === dish.categoryId)?.id || categories[0]?.id || ''
                            }));
                            allProcessedDishes.push(...batchDishes);
                        }
                    }
                } catch (batchErr) {
                    console.error('Error processing batch:', batchErr);
                }

                processedCount += chunk.length;
                setProcessingProgress({ current: Math.min(processedCount, imagesToSend.length), total: imagesToSend.length });
            }

            if (allProcessedDishes.length === 0) {
                throw new Error('Non è stato possibile estrarre nessun piatto. Riprova con immagini più chiare o meno pagine.');
            }

            setAnalyzedDishes(allProcessedDishes);
            setStep('review');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Si è verificato un errore durante l\'analisi. Riprova.');
            setStep('upload');
        }
    };

    const handleSave = async () => {
        try {
            const supabase = createClient() as SupabaseClient<Database>;

            // Filter selected items and valid categories
            const dishesToImport = analyzedDishes.filter(d => d.selected && d.categoryId);

            if (dishesToImport.length > 0) {
                // 1. Prepare items with slugs
                const preparedItems = dishesToImport.map(dish => ({
                    tenant_id: tenantId,
                    category_id: dish.categoryId,
                    name: dish.name,
                    description: dish.description,
                    price: dish.price,
                    is_visible: true,
                    slug: dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                })) as any[];

                // 2. Deduplicate within the batch (prefer last or first? First is fine)
                // We key by `${category_id}-${slug}` to ensure uniqueness per category
                const uniqueItemsMap = new Map();
                preparedItems.forEach(item => {
                    const key = `${item.category_id}-${item.slug}`;
                    if (!uniqueItemsMap.has(key)) {
                        uniqueItemsMap.set(key, item);
                    }
                });
                const uniqueItems = Array.from(uniqueItemsMap.values());

                // 3. Insert with ignoreDuplicates to skip existing DB items
                const { error: dishesError } = await supabase
                    .from('dishes')
                    .upsert(uniqueItems, {
                        onConflict: 'tenant_id,category_id,slug',
                        ignoreDuplicates: true
                    });

                if (dishesError) throw dishesError;

                // Show warning if some items were skipped?
                if (uniqueItems.length < dishesToImport.length) {
                    // Logic to detect skipping isn't trivial with ignoreDuplicates unless we check count.
                    // But for now, success is enough.
                }
            }

            // Clear draft on success
            localStorage.removeItem('menu-import-draft');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Errore durante il salvataggio: ' + (err instanceof Error ? err.message : 'Dati duplicati o non validi'));
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Importa Menu Completo con AI ✨
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                            {error}
                        </div>
                    )}

                    {step === 'upload' && (
                        <div className="text-center py-12">
                            {draftFound && (
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4 max-w-lg mx-auto text-left animate-fade-in">
                                    <div>
                                        <p className="font-bold text-blue-900 text-sm">Hai un'importazione in sospeso!</p>
                                        <p className="text-blue-700 text-xs mt-1">L'ultima volta hai chiuso senza salvare. Vuoi recuperare i piatti?</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={handleDiscardDraft}
                                            className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                        >
                                            Scarta
                                        </button>
                                        <button
                                            onClick={handleRestoreDraft}
                                            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Ripristina
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mb-8 max-w-md mx-auto">
                                <p className="text-gray-600 mb-6">
                                    Carica il file PDF o le foto del tuo menu intero. Il sistema assegnerà automaticamente i piatti alle categorie che hai già creato ({categories.map(c => c.name).slice(0, 3).join(', ')}{categories.length > 3 ? '...' : ''}).
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">Carica Menu Completo</h3>
                                {categories.length === 0 && (
                                    <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
                                        ⚠️ Attenzione: Non hai ancora creato categorie. Crea prima le categorie (Antipasti, Primi, ecc.) per ottenere risultati migliori.
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isReadingFile}
                                    className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isReadingFile ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Lettura file...</span>
                                        </>
                                    ) : (
                                        'Scegli File'
                                    )}
                                </button>
                                {previews.length > 0 && !isReadingFile && (
                                    <button
                                        onClick={handleAnalyze}
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Analizza {previews.length} Immagini
                                    </button>
                                )}
                            </div>

                            {/* Processing Tip with Progress Bar */}
                            {isReadingFile && (
                                <div className="mt-6 w-full max-w-xs mx-auto">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                                        <span>Conversione PDF...</span>
                                        <span>{readingProgress.current}/{readingProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-300 ease-out"
                                            style={{ width: readingProgress.total > 0 ? `${(readingProgress.current / readingProgress.total) * 100}%` : '0%' }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-center text-gray-400">
                                        Attendere prego, stiamo preparando le immagini
                                    </p>
                                </div>
                            )}

                            {/* Previews Grid */}
                            {previews.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => {
                                                    setPreviews(prev => prev.filter((_, i) => i !== index));
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="text-center py-20 px-8">
                            <div className="mb-8 relative max-w-sm mx-auto">
                                {/* Outer Bar */}
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    {/* Inner Bar */}
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 ease-out"
                                        style={{ width: `${Math.round((processingProgress.current / Math.max(processingProgress.total, 1)) * 100)}%` }}
                                    />
                                </div>
                                {/* Percentage Text */}
                                <div className="mt-2 flex justify-between text-sm font-medium text-gray-500">
                                    <span>0%</span>
                                    <span>{Math.round((processingProgress.current / Math.max(processingProgress.total, 1)) * 100)}%</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Analisi in corso... ({processingProgress.current}/{processingProgress.total} pagine)
                            </h3>
                            <p className="text-gray-600">
                                Stiamo leggendo il tuo menu. L&apos;operazione potrebbe richiedere qualche secondo in base al numero di pagine.
                            </p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-sm">
                                Controlla i piatti estratti. L&apos;AI li ha assegnati automaticamente alle tue categorie, ma puoi cambiarle qui se necessario.
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <h3 className="font-bold text-lg text-gray-900">Piatti Trovati</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {analyzedDishes.map((dish, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg group hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200">
                                            <div className="pt-8">
                                                <input
                                                    type="checkbox"
                                                    checked={dish.selected || false}
                                                    onChange={(e) => {
                                                        const newData = [...analyzedDishes];
                                                        newData[index].selected = e.target.checked;
                                                        setAnalyzedDishes(newData);
                                                    }}
                                                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer"
                                                />
                                            </div>

                                            <div className="flex-1 grid grid-cols-12 gap-3 sm:gap-4">
                                                {/* Name: Span 8 (mobile) -> Span 5 (desktop) */}
                                                <div className="col-span-8 sm:col-span-6">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                                        Nome Piatto
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={dish.name || ''}
                                                        onChange={(e) => {
                                                            const newData = [...analyzedDishes];
                                                            newData[index].name = e.target.value;
                                                            setAnalyzedDishes(newData);
                                                        }}
                                                        className="w-full font-semibold bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                                                        placeholder="es. Carbonara"
                                                    />
                                                </div>

                                                {/* Price: Span 4 (mobile) -> Span 2 (desktop) - Moves next to Name on mobile */}
                                                <div className="col-span-4 sm:col-span-2 sm:order-last">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide text-right sm:text-left">
                                                        Prezzo
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                                                        <input
                                                            type="number"
                                                            value={dish.price || 0}
                                                            onChange={(e) => {
                                                                const newData = [...analyzedDishes];
                                                                newData[index].price = parseFloat(e.target.value);
                                                                setAnalyzedDishes(newData);
                                                            }}
                                                            className="w-full bg-white border border-gray-200 rounded-lg pl-6 pr-2 py-2 text-sm text-right font-mono font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                                                            step="0.50"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Category: Span 12 (mobile) -> Span 4 (desktop) */}
                                                <div className="col-span-12 sm:col-span-4">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                                        Categoria
                                                    </label>
                                                    <select
                                                        value={dish.categoryId || ''}
                                                        onChange={(e) => {
                                                            const newData = [...analyzedDishes];
                                                            newData[index].categoryId = e.target.value;
                                                            setAnalyzedDishes(newData);
                                                        }}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow cursor-pointer appearance-none"
                                                        style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)', backgroundPosition: 'calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
                                                    >
                                                        {categories.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Description: Span 12 */}
                                                <div className="col-span-12">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                                        Descrizione / Ingredienti
                                                    </label>
                                                    <textarea
                                                        value={dish.description || ''}
                                                        onChange={(e) => {
                                                            const newData = [...analyzedDishes];
                                                            newData[index].description = e.target.value;
                                                            setAnalyzedDishes(newData);
                                                        }}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-shadow"
                                                        placeholder="es. Uova, guanciale, pecorino..."
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'review' && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                        <button
                            onClick={() => setStep('upload')}
                            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-white transition-all"
                        >
                            Indietro
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                        >
                            Importa Selezionati
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
