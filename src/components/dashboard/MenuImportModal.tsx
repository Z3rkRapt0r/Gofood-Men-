'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { SupabaseClient } from '@supabase/supabase-js';

// Define types from Database definition
type DbCategoryInsert = Database['public']['Tables']['categories']['Insert'];
type DbDishInsert = Database['public']['Tables']['dishes']['Insert'];
type InsertedCategory = Database['public']['Tables']['categories']['Row'];

// Remove top-level import
// import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Dish {
    name: string;
    description: string;
    price: number;
    selected?: boolean;
}

interface Category {
    name: string;
    dishes: Dish[];
    selected?: boolean;
}

interface MenuImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
}

export default function MenuImportModal({ isOpen, onClose, onSuccess, tenantId }: MenuImportModalProps) {
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    // const [files, setFiles] = useState<File[]>([]); // Removed unused state
    const [previews, setPreviews] = useState<string[]>([]);
    const [analyzedData, setAnalyzedData] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            // setFiles([]);
            setPreviews([]);
            setAnalyzedData([]);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const convertPdfToImages = async (file: File): Promise<string[]> => {
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
                // @ts-expect-error - pdfjs-dist type mismatch, render method expects a specific type for renderContext
                await page.render(renderContext).promise;
                images.push(canvas.toDataURL('image/jpeg', 0.8));
            }
        }

        return images;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            // setFiles(prev => [...prev, ...newFiles]);
            setError(null);

            // Generate previews
            const newPreviews: string[] = [];
            for (const file of newFiles) {
                if (file.type === 'application/pdf') {
                    try {
                        const pdfImages = await convertPdfToImages(file);
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
        }
    };

    const handleAnalyze = async () => {
        if (previews.length === 0) return;

        setStep('processing');
        setError(null);

        try {
            // Send base64 images directly (remove data:image/xxx;base64, prefix if needed by backend, 
            // but our backend handles it)
            const imagesToSend = previews.map(p => p.split(',')[1]);

            const response = await fetch('/api/ai/analyze-menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: imagesToSend }),
            });

            if (!response.ok) {
                throw new Error('Errore durante l\'analisi del menu');
            }

            const data = await response.json();

            // Add selected state to all items
            const processedData = data.categories.map((cat: Category) => ({
                ...cat,
                selected: true,
                dishes: cat.dishes.map((dish: Dish) => ({ ...dish, selected: true }))
            }));

            setAnalyzedData(processedData);
            setStep('review');
        } catch (err) {
            console.error(err);
            setError('Si è verificato un errore durante l\'analisi. Riprova.');
            setStep('upload');
        }
    };

    const handleSave = async () => {
        try {
            const supabase = createClient() as SupabaseClient<Database>;

            // Filter selected items
            const categoriesToImport = analyzedData.filter(cat => cat.selected);

            for (const cat of categoriesToImport) {
                // 1. Create Category
                const { data: categoryData, error: categoryError } = await supabase
                    .from('categories')
                    .insert({
                        tenant_id: tenantId,
                        name: { it: cat.name, en: cat.name }, // Default en to same name
                        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        is_visible: true,
                        display_order: 99, // Append to end
                    } as DbCategoryInsert)
                    .select()
                    .single();

                if (categoryError) throw categoryError;
                if (!categoryData) throw new Error('Category data not returned after insert.');

                // 2. Create Dishes
                const dishesToImport = cat.dishes.filter(d => d.selected);
                if (dishesToImport.length > 0) {
                    const { error: dishesError } = await supabase
                        .from('dishes')
                        .insert(
                            dishesToImport.map(dish => ({
                                tenant_id: tenantId,
                                category_id: (categoryData as InsertedCategory).id,
                                name: { it: dish.name, en: dish.name },
                                description: { it: dish.description, en: dish.description },
                                price: dish.price,
                                is_visible: true,
                                slug: dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            })) as DbDishInsert[]
                        );

                    if (dishesError) throw dishesError;
                }
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Errore durante il salvataggio dei dati.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Importa Menu con AI ✨
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
                            <div className="mb-8">
                                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Carica foto o PDF del menu</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Carica una o più foto, oppure un file PDF. L&apos;intelligenza artificiale analizzerà tutto insieme.
                                </p>
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
                                    className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
                                >
                                    Scegli File
                                </button>
                                {previews.length > 0 && (
                                    <button
                                        onClick={handleAnalyze}
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                                    >
                                        Analizza {previews.length} Immagini
                                    </button>
                                )}
                            </div>

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
                                                    // Note: Removing from 'files' state is harder because we don't map 1:1 if PDF pages
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
                        <div className="text-center py-20">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Analisi in corso...</h3>
                            <p className="text-gray-600">
                                Stiamo leggendo il tuo menu, potrebbe richiedere qualche secondo.
                            </p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 text-sm">
                                Controlla i dati estratti. Puoi modificare i testi e deselezionare gli elementi che non vuoi importare.
                            </div>

                            {analyzedData.map((category, catIndex) => (
                                <div key={catIndex} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={category.selected}
                                            onChange={(e) => {
                                                const newData = [...analyzedData];
                                                newData[catIndex].selected = e.target.checked;
                                                setAnalyzedData(newData);
                                            }}
                                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                        />
                                        <input
                                            type="text"
                                            value={category.name || ''}
                                            onChange={(e) => {
                                                const newData = [...analyzedData];
                                                newData[catIndex].name = e.target.value;
                                                setAnalyzedData(newData);
                                            }}
                                            className="font-bold text-lg bg-transparent border-none focus:ring-0 w-full"
                                        />
                                    </div>

                                    {category.selected && (
                                        <div className="p-4 space-y-4">
                                            {category.dishes.map((dish, dishIndex) => (
                                                <div key={dishIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={dish.selected || false}
                                                        onChange={(e) => {
                                                            const newData = [...analyzedData];
                                                            newData[catIndex].dishes[dishIndex].selected = e.target.checked;
                                                            setAnalyzedData(newData);
                                                        }}
                                                        className="mt-1 w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                                                    />
                                                    <div className="flex-1 grid gap-2">
                                                        <input
                                                            type="text"
                                                            value={dish.name || ''}
                                                            onChange={(e) => {
                                                                const newData = [...analyzedData];
                                                                newData[catIndex].dishes[dishIndex].name = e.target.value;
                                                                setAnalyzedData(newData);
                                                            }}
                                                            className="font-semibold bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                                                            placeholder="Nome Piatto"
                                                        />
                                                        <textarea
                                                            value={dish.description || ''}
                                                            onChange={(e) => {
                                                                const newData = [...analyzedData];
                                                                newData[catIndex].dishes[dishIndex].description = e.target.value;
                                                                setAnalyzedData(newData);
                                                            }}
                                                            className="bg-white border border-gray-200 rounded px-2 py-1 text-sm w-full"
                                                            placeholder="Descrizione"
                                                            rows={2}
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            value={dish.price || 0}
                                                            onChange={(e) => {
                                                                const newData = [...analyzedData];
                                                                newData[catIndex].dishes[dishIndex].price = parseFloat(e.target.value);
                                                                setAnalyzedData(newData);
                                                            }}
                                                            className="bg-white border border-gray-200 rounded px-2 py-1 text-sm w-full text-right"
                                                            step="0.50"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
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
