'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { usePhotos, useUploadPhoto, useDeletePhotos } from '@/hooks/usePhotos';
import { useCategories, useDishes, useUpdateDish, Dish, Category } from '@/hooks/useMenu';

interface PhotoManagerProps {
    tenantId: string;
    onValidationChange?: (isValid: boolean) => void;
    highlightUnassigned?: boolean;
}

interface CategoryWithDishes extends Category {
    dishes: Dish[];
}

export default function PhotoManager({ tenantId, onValidationChange, highlightUnassigned = false }: PhotoManagerProps) {
    const { data: photos = [], isLoading: photosLoading } = usePhotos(tenantId);
    const { data: serverCats = [], isLoading: catsLoading } = useCategories(tenantId);
    const { data: serverDishes = [], isLoading: dishesLoading } = useDishes(tenantId);

    const uploadMutation = useUploadPhoto();
    const deleteMutation = useDeletePhotos();
    const updateDishMutation = useUpdateDish();

    // Derived Menu Data
    const categories: CategoryWithDishes[] = useMemo(() => {
        if (!serverCats) return [];
        return serverCats.map(c => ({
            ...c,
            dishes: serverDishes?.filter(d => d.category_id === c.id) || []
        }));
    }, [serverCats, serverDishes]);

    const menuLoading = catsLoading || dishesLoading;

    // Derived state for highlighting
    const assignedUrls = useMemo(() => {
        const set = new Set<string>();
        serverDishes.forEach(dish => {
            if (dish.image_url) set.add(dish.image_url);
        });
        return set;
    }, [serverDishes]);

    // Selection State
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Dialog States
    const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
    const [showCleanupDialog, setShowCleanupDialog] = useState(false);
    const [dishToRemoveImage, setDishToRemoveImage] = useState<Dish | null>(null);

    // Validation
    useEffect(() => {
        if (onValidationChange) onValidationChange(true);
    }, [onValidationChange]);

    // Dropzone Logic
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!tenantId) return;
        const promises = acceptedFiles.map(file => uploadMutation.mutateAsync({ tenantId, file }));
        try {
            await Promise.all(promises);
        } catch (e) {
            // Error handled by mutation
        }
    }, [tenantId, uploadMutation]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxSize: 10 * 1024 * 1024, // 10MB
        onDropRejected: (fileRejections) => {
            fileRejections.forEach((rejection) => {
                const { file, errors } = rejection;
                if (errors[0]?.code === 'file-too-large') {
                    toast.error(`File troppo grande: ${file.name}. Max 10MB.`);
                } else {
                    toast.error(`Errore caricamento: ${file.name}`);
                }
            });
        }
    });

    // Cleanup Logic
    async function handleDeletePhotoClick(photoName: string) {
        setPhotoToDelete(photoName);
    }

    async function confirmDeletePhoto() {
        if (!photoToDelete) return;
        deleteMutation.mutate({ tenantId, photoNames: [photoToDelete] });
        setPhotoToDelete(null);
    }

    async function handleCleanupUnusedClick() {
        if (photos.length === 0) return;
        setShowCleanupDialog(true);
    }

    async function confirmCleanupUnused() {

        const filesToDelete: string[] = [];

        photos.forEach((photo: any) => {
            if (!assignedUrls.has(photo.url)) {
                filesToDelete.push(photo.name);
            }
        });

        if (filesToDelete.length === 0) {
            toast("Tutte le foto sono attualmente in uso!", { icon: '👍' });
        } else {
            deleteMutation.mutate({ tenantId, photoNames: filesToDelete });
        }
        setShowCleanupDialog(false);
    }

    // Assignment Logic
    function openGalleryForDish(dishId: string) {
        setSelectedDishId(dishId);
        setIsGalleryOpen(true);
    }

    async function assignPhotoToDish(photoUrl: string) {
        if (!selectedDishId) return;

        try {
            await updateDishMutation.mutateAsync({
                id: selectedDishId,
                updates: { image_url: photoUrl }
            });
            setIsGalleryOpen(false);
            setSelectedDishId(null);
            toast.success(`Foto assegnata!`);
        } catch (e) {
            toast.error('Errore assegnazione foto');
        }
    }

    async function handleRemoveImageFromDishClick(dish: Dish) {
        setDishToRemoveImage(dish);
    }

    async function confirmRemoveImageFromDish() {
        if (!dishToRemoveImage) return;

        try {
            await updateDishMutation.mutateAsync({
                id: dishToRemoveImage.id,
                updates: { image_url: null }
            });
            toast.success("Foto rimossa dal piatto");
        } catch (e) {
            toast.error('Errore rimozione foto');
        } finally {
            setDishToRemoveImage(null);
        }
    }

    const isLoading = photosLoading || menuLoading;

    if (isLoading && photos.length === 0 && categories.length === 0) return (
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
                                {uploadMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Carica Foto</p>
                                <p className="text-xs text-gray-500">Trascina qui o clicca per caricare le foto nel tuo archivio. Max 10MB.</p>
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
                                onClick={handleCleanupUnusedClick}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7"
                                title="Elimina foto non assegnate a nessun piatto"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                                Pulisci Inutilizzate
                            </Button>
                        </div>

                        {photos.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-xl">
                                Nessuna foto caricata
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {photos.map((photo: any) => {
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
                                                onClick={() => handleDeletePhotoClick(photo.name)}
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
                                                                        onClick={() => handleRemoveImageFromDishClick(dish)}
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
                                {photos.map((photo: any) => (
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

            {/* Delete Photo Dialog */}
            <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare questa foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            L'azione è irreversibile. La foto verrà rimossa dall'archivio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPhotoToDelete(null)}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeletePhoto}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Elimina
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cleanup Dialog */}
            <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Pulizia Archivio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Stai per eliminare tutte le foto che NON sono assegnate a nessun piatto. Questa operazione non può essere annullata.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowCleanupDialog(false)}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCleanupUnused}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Pulisci Tutto
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Image From Dish Dialog */}
            <AlertDialog open={!!dishToRemoveImage} onOpenChange={(open) => !open && setDishToRemoveImage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rimuovere foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La foto verrà rimossa dal piatto {dishToRemoveImage?.name}, ma rimarrà disponibile nel tuo archivio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDishToRemoveImage(null)}>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemoveImageFromDish}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Rimuovi dal Piatto
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div >
    );
}
