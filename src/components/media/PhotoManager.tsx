'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, Trash2, Check, X, ImagePlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import toast from 'react-hot-toast';

interface PhotoManagerProps {
    tenantId: string;
    onValidationChange?: (isValid: boolean) => void;
    highlightUnassigned?: boolean;
}

interface Photo {
    name: string;
    url: string;
}

interface Dish {
    id: string;
    name: string;
    image_url?: string | null;
    category_id: string;
}

interface Category {
    id: string;
    name: string;
    dishes: Dish[];
}

export default function PhotoManager({ tenantId, onValidationChange, highlightUnassigned = false }: PhotoManagerProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Derived state for highlighting
    const assignedUrls = React.useMemo(() => {
        const set = new Set<string>();
        categories.forEach(cat => cat.dishes.forEach(dish => {
            if (dish.image_url) set.add(dish.image_url);
        }));
        return set;
    }, [categories]);

    // Selection State
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Initialize
    useEffect(() => {
        if (!tenantId) return;
        loadData();
    }, [tenantId]);

    // Validation
    useEffect(() => {
        if (onValidationChange) onValidationChange(true);
    }, [onValidationChange]);

    async function loadData() {
        setLoading(true);
        const supabase = createClient();
        const folderPath = `${tenantId}/dishes`;

        try {
            // 1. Load Photos from Bucket 'dishes'
            const { data: fileList, error: storageError } = await supabase.storage
                .from('dishes')
                .list(folderPath, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

            if (storageError) throw storageError;

            const loadedPhotos: Photo[] = (fileList || [])
                .filter(f => f.name !== '.emptyFolderPlaceholder')
                .map(f => {
                    const { data } = supabase.storage.from('dishes').getPublicUrl(`${folderPath}/${f.name}`);
                    return { name: f.name, url: data.publicUrl };
                });
            setPhotos(loadedPhotos);

            // 2. Load Categories & Dishes
            const { data: cats } = await supabase
                .from('categories')
                .select('id, name')
                .eq('tenant_id', tenantId)
                .order('display_order');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: dishes } = await (supabase.from('dishes') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .order('display_order');


            if (cats && dishes) {
                const merged = cats.map((cat: any) => ({
                    ...cat,
                    dishes: dishes.filter((d: any) => d.category_id === cat.id)
                }));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setCategories(merged as any);
            }

        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Errore caricamento dati");
        } finally {
            setLoading(false);
        }
    }

    // Dropzone Logic
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!tenantId) return;
        setUploading(true);
        const supabase = createClient();
        const folderPath = `${tenantId}/dishes`;
        let newCount = 0;

        try {
            await Promise.all(acceptedFiles.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${folderPath}/${fileName}`;

                const { error } = await supabase.storage
                    .from('dishes')
                    .upload(filePath, file);

                if (!error) newCount++;
            }));

            if (newCount > 0) {
                toast.success(`${newCount} foto caricate!`);
                loadData(); // Reload to see new photos
            }

        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Errore durante il caricamento");
        } finally {
            setUploading(false);
        }
    }, [tenantId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] }
    });

    // Cleanup Logic
    async function handleDeletePhoto(photoName: string) {
        if (!confirm("Eliminare definitivamente questa foto?")) return;
        const supabase = createClient();
        const folderPath = `${tenantId}/dishes`;

        await supabase.storage.from('dishes').remove([`${folderPath}/${photoName}`]);
        setPhotos(prev => prev.filter(p => p.name !== photoName));
    }

    async function handleCleanupUnused() {
        if (photos.length === 0) return;
        if (!confirm("Eliminare tutte le foto che NON sono state assegnate a nessun piatto?")) return;

        setLoading(true);
        const supabase = createClient();
        const folderPath = `${tenantId}/dishes`;

        try {
            // Use local assignedUrls for optimistic/fast check
            // Only fetch from DB if needed, but local state is usually fresh enough

            const filesToDelete: string[] = [];
            const newPhotosList: Photo[] = [];

            photos.forEach(photo => {
                if (!assignedUrls.has(photo.url)) {
                    filesToDelete.push(`${folderPath}/${photo.name}`);
                } else {
                    newPhotosList.push(photo);
                }
            });

            if (filesToDelete.length === 0) {
                toast("Tutte le foto sono attualmente in uso!", { icon: '👍' });
            } else {
                const { error } = await supabase.storage.from('dishes').remove(filesToDelete);
                if (error) throw error;

                setPhotos(newPhotosList);
                toast.success(`${filesToDelete.length} foto inutilizzate eliminate.`);
            }

        } catch (error) {
            console.error("Cleanup error:", error);
            toast.error("Errore durante la pulizia");
        } finally {
            setLoading(false);
        }
    }

    // Assignment Logic
    function openGalleryForDish(dishId: string) {
        setSelectedDishId(dishId);
        setIsGalleryOpen(true);
    }

    async function assignPhotoToDish(photoUrl: string) {
        if (!selectedDishId) return;

        // Optimistic Update
        updateDishImageLocally(selectedDishId, photoUrl);
        setIsGalleryOpen(false); // Close immediately for snappiness

        // Server Update
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('dishes') as any)
            .update({ image_url: photoUrl })
            .eq('id', selectedDishId);

        toast.success(`Foto assegnata!`);
        setSelectedDishId(null);
    }

    function updateDishImageLocally(dishId: string, url: string | null) {
        setCategories(prev => prev.map(cat => ({
            ...cat,
            dishes: cat.dishes.map(d => d.id === dishId ? { ...d, image_url: url } : d)
        })));
    }

    async function handleRemoveImageFromDish(dish: Dish) {
        if (!confirm(`Rimuovere foto da ${dish.name}?`)) return;

        updateDishImageLocally(dish.id, null);
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('dishes') as any).update({ image_url: null }).eq('id', dish.id);
        toast.success("Foto rimossa dal piatto");
    }


    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    );

    return (
        <div className="flex flex-col h-auto min-h-[500px] gap-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">

                {/* Left Column: Upload Area & Quick Gallery Preview */}
                <Card className="col-span-1 border-2 border-gray-100 shadow-sm flex flex-col h-full min-h-0 overflow-hidden bg-white">
                    {/* ... (Upload Dropzone) ... */}
                    <div
                        {...getRootProps()}
                        className={`p-6 border-b-2 border-dashed transition-colors cursor-pointer shrink-0
                        ${isDragActive ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-orange-500">
                                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Carica Foto</p>
                                <p className="text-xs text-gray-500">Trascina qui o clicca per caricare le foto nel tuo archivio.</p>
                            </div>
                        </div>
                    </div>

                    {/* Mini Gallery (ReadOnly/Manage) */}
                    <div className="flex-1 min-h-0 bg-gray-50/50 p-4">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Archivio ({photos.length})</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCleanupUnused}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                                title="Elimina foto non assegnate a nessun piatto"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Pulisci Inutilizzate
                            </Button>
                        </div>

                        {photos.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-xl">
                                Nessuna foto caricata
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map(photo => {
                                    const isAssigned = assignedUrls.has(photo.url);
                                    const showWarning = highlightUnassigned && !isAssigned;

                                    return (
                                        <div
                                            key={photo.name}
                                            className={`relative group aspect-square rounded-md overflow-hidden bg-gray-200 transition-all
                                                ${showWarning ? 'ring-4 ring-red-500 scale-95' : ''}
                                                ${isAssigned ? 'opacity-40 grayscale pointer-events-none' : ''}
                                            `}
                                        >
                                            <img src={photo.url} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />

                                            {showWarning && (
                                                <div className="absolute inset-0 border-4 border-red-500 rounded-md animate-pulse pointer-events-none" />
                                            )}

                                            <button
                                                onClick={() => handleDeletePhoto(photo.name)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10 scale-75"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>


                {/* Right Column: Dishes List */}
                <Card className="col-span-1 lg:col-span-2 border-2 border-gray-100 shadow-sm flex flex-col h-full min-h-0 bg-white">
                    <div className="p-4 border-b border-gray-100 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900">Assegna Foto ai Piatti</h2>
                        <p className="text-sm text-gray-500">Clicca su "Aggiungi Foto" per scegliere un'immagine dall'archivio.</p>
                    </div>

                    <div className="flex-1 p-4 bg-gray-50/30">
                        <div className="space-y-6 max-w-3xl mx-auto pb-8">
                            {categories.map(cat => (
                                <div key={cat.id} className="space-y-3">
                                    <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                        {cat.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {cat.dishes.length > 0 ? (
                                            cat.dishes.map(dish => (
                                                <div
                                                    key={dish.id}
                                                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    {/* Dish Image Area */}
                                                    <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                                                        {dish.image_url ? (
                                                            <div className="relative w-full h-full group">
                                                                <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="text-white hover:bg-white/20 hover:text-blue-400 w-8 h-8"
                                                                        onClick={() => openGalleryForDish(dish.id)}
                                                                        title="Cambia foto"
                                                                    >
                                                                        <RefreshCw className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="text-white hover:bg-white/20 hover:text-red-400 w-8 h-8"
                                                                        onClick={() => handleRemoveImageFromDish(dish)}
                                                                        title="Rimuovi foto"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                                                                onClick={() => openGalleryForDish(dish.id)}
                                                            >
                                                                <ImagePlus className="w-6 h-6 mb-1" />
                                                                <span className="text-[10px] font-bold">Aggiungi</span>
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Dish Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 truncate">{dish.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {dish.image_url ? (
                                                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                                                                    <Check className="w-3 h-3 mr-1" /> Foto OK
                                                                </Badge>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                    onClick={() => openGalleryForDish(dish.id)}
                                                                >
                                                                    <ImagePlus className="w-3 h-3 mr-1" />
                                                                    Scegli Foto
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-4 text-center text-gray-400 text-sm bg-white/50 rounded-lg border border-dashed border-gray-200">
                                                Nessun piatto in questa categoria
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

            </div>

            {/* Gallery Picker Logic Modal */}
            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b shrink-0">
                        <DialogTitle>Seleziona una foto dall'archivio</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <ImagePlus className="w-12 h-12 mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Nessuna foto disponibile</p>
                                <p className="text-sm">Carica prima le foto nel pannello a sinistra.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {photos.map(photo => (
                                    <div
                                        key={photo.name}
                                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 border-transparent transition-all bg-white
                                            ${assignedUrls.has(photo.url)
                                                ? 'opacity-30 cursor-not-allowed border-gray-200'
                                                : 'hover:border-orange-500 cursor-pointer shadow-sm hover:shadow-md'
                                            }
                                        `}
                                        onClick={() => {
                                            if (!assignedUrls.has(photo.url)) assignPhotoToDish(photo.url);
                                        }}
                                    >
                                        <img src={photo.url} alt="Selection" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            {assignedUrls.has(photo.url) ? (
                                                <Badge variant="secondary" className="bg-gray-800 text-white">In Uso</Badge>
                                            ) : (
                                                <span className="opacity-0 group-hover:opacity-100 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                    Seleziona
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
