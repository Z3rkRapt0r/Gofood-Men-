'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, Upload, Trash2, Check, X, ImagePlus, RefreshCw, AlertTriangle } from 'lucide-react';
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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





    const deletePhotosMutation = useDeletePhotos();

    // Selection State
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [photosToDelete, setPhotosToDelete] = useState<Set<string>>(new Set());

    // Warning Dialog for deleting assigned photos
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);

    // Dialog States

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



    // Assignment Logic
    function openGalleryForDish(dishId: string) {
        setSelectedDishId(dishId);
        setIsGalleryOpen(true);
        setIsDeleteMode(false);
        setPhotosToDelete(new Set());
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

    const togglePhotoSelection = (photoName: string) => {
        setPhotosToDelete(prev => {
            const next = new Set(prev);
            if (next.has(photoName)) {
                next.delete(photoName);
            } else {
                next.add(photoName);
            }
            return next;
        });
    };

    const handleDeleteSelectedPhotos = async () => {
        if (photosToDelete.size === 0) return;

        // Check if any selected photo is currently assigned
        const assignedPhotosSelected = photos.filter(p =>
            photosToDelete.has(p.name) && assignedUrls.has(p.url)
        );

        if (assignedPhotosSelected.length > 0) {
            setShowDeleteWarning(true);
            return;
        }

        await executeDeletePhotos();
    };

    const executeDeletePhotos = async () => {
        try {
            await deletePhotosMutation.mutateAsync({
                tenantId,
                photoNames: Array.from(photosToDelete)
            });
            setPhotosToDelete(new Set());
            setShowDeleteWarning(false);
            // Optional: exit delete mode
            // setIsDeleteMode(false); 
        } catch (e) {
            // Error handled by mutation
        }
    };

    const isLoading = photosLoading || menuLoading;

    if (isLoading && photos.length === 0 && categories.length === 0) return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    );

    return (
        <div className="flex flex-col gap-6">

            <div className="flex flex-col gap-6">

                {/* Top Section: Upload Area */}
                <Card className="border-y md:border border-gray-100 shadow-none md:shadow-sm flex flex-col bg-white rounded-none md:rounded-xl">
                    <div
                        {...getRootProps()}
                        className={`p-4 md:p-8 border-2 border-dashed transition-colors cursor-pointer flex flex-col justify-center items-center h-28 md:h-48
                        ${isDragActive ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="text-center space-y-2 md:space-y-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-orange-500">
                                {uploadMutation.isPending ? <Loader2 className="w-5 h-5 md:w-7 md:h-7 animate-spin" /> : <Upload className="w-5 h-5 md:w-7 md:h-7" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-base md:text-lg">Carica Foto</p>
                                <p className="text-xs md:text-sm text-gray-500 hidden md:block">Trascina qui o clicca per caricare le foto nel tuo archivio. Max 10MB.</p>
                                <p className="text-xs text-gray-500 md:hidden">Tocca per caricare (Max 10MB)</p>
                            </div>
                        </div>
                    </div>
                </Card>


                {/* Bottom Section: Dishes List */}
                <Card className="border-y md:border border-gray-100 shadow-none md:shadow-sm flex flex-col bg-white rounded-none md:rounded-xl">
                    <div className="p-4 border-b border-gray-100 bg-white z-10">
                        <h2 className="text-xl font-bold text-gray-900">Assegna Foto ai Piatti</h2>
                    </div>

                    <div className="flex-1 p-4 bg-gray-50/30">
                        <div className="max-w-3xl mx-auto pb-8">
                            <Accordion type="single" collapsible className="space-y-4" defaultValue={categories.length > 0 ? categories[0].id : undefined}>
                                {categories.map(cat => {
                                    const missingPhotosCount = cat.dishes.filter(d => !d.image_url).length;
                                    const isComplete = missingPhotosCount === 0 && cat.dishes.length > 0;

                                    return (
                                        <AccordionItem
                                            key={cat.id}
                                            value={cat.id}
                                            className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isComplete ? 'border-green-100' : 'border-gray-100'}`}
                                        >
                                            <AccordionTrigger className="px-3 md:px-4 py-3 hover:bg-gray-50 hover:no-underline">
                                                <div className="flex items-center gap-2 md:gap-4 flex-1 text-left">
                                                    <h3 className="font-black text-sm md:text-lg text-gray-800 flex items-center gap-2">
                                                        <span className={`w-1 h-6 rounded-full ${isComplete ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                        {cat.name}
                                                        <span className="ml-1 md:ml-2 text-[10px] md:text-xs font-normal text-gray-400 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded-full">
                                                            {cat.dishes.length}
                                                        </span>
                                                    </h3>


                                                    {/* Intelligent Status Indicators - Tooltips */}
                                                    {cat.dishes.length > 0 && (
                                                        <div className="flex items-center gap-1 md:gap-2">
                                                            <TooltipProvider>
                                                                {missingPhotosCount > 0 ? (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 cursor-help transition-colors hover:bg-red-200">
                                                                                <ImagePlus className="w-3.5 h-3.5" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="bg-red-600 text-white border-red-700">
                                                                            <p className="font-bold">Mancano {missingPhotosCount} foto</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 cursor-help transition-colors hover:bg-green-200">
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="bg-green-600 text-white border-green-700">
                                                                            <p className="font-bold">Categoria Completa</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </TooltipProvider>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionTrigger>

                                            <AccordionContent className="px-2 md:px-4 pb-4 pt-0 border-t border-gray-50">
                                                {cat.dishes.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                        {cat.dishes.map(dish => (
                                                            <div
                                                                key={dish.id}
                                                                className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white hover:border-orange-200 transition-colors"
                                                            >
                                                                {/* Dish Image Area */}
                                                                <div className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                                                                    {dish.image_url ? (
                                                                        <div className="relative w-full h-full group">
                                                                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="text-white hover:bg-white/20 hover:text-blue-400 w-8 h-8"
                                                                                    onClick={(e) => { e.stopPropagation(); openGalleryForDish(dish.id); }}
                                                                                    title="Cambia foto"
                                                                                >
                                                                                    <RefreshCw className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    className="text-white hover:bg-white/20 hover:text-red-400 w-8 h-8"
                                                                                    onClick={(e) => { e.stopPropagation(); handleRemoveImageFromDishClick(dish); }}
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
                                                                            onClick={(e) => { e.stopPropagation(); openGalleryForDish(dish.id); }}
                                                                        >
                                                                            <ImagePlus className="w-6 h-6 mb-1" />
                                                                            <span className="text-[10px] font-bold">Aggiungi</span>
                                                                        </Button>
                                                                    )}
                                                                </div>

                                                                {/* Dish Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-gray-900 leading-tight text-wrap">{dish.name}</h4>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        {dish.image_url ? (
                                                                            <>
                                                                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                                                                                    <Check className="w-3 h-3 mr-1" /> OK
                                                                                </Badge>
                                                                                <div className="flex items-center gap-1 md:hidden">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-6 w-6 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                                                        onClick={(e) => { e.stopPropagation(); openGalleryForDish(dish.id); }}
                                                                                        title="Cambia foto"
                                                                                    >
                                                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                                        onClick={(e) => { e.stopPropagation(); handleRemoveImageFromDishClick(dish); }}
                                                                                        title="Rimuovi foto"
                                                                                    >
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                                                                onClick={(e) => { e.stopPropagation(); openGalleryForDish(dish.id); }}
                                                                            >
                                                                                <ImagePlus className="w-3 h-3 mr-1" />
                                                                                Scegli Foto
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-8 text-center text-gray-400 text-sm italic">
                                                        Nessun piatto in questa categoria
                                                    </div>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Gallery Picker Logic Modal */}
            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-4 md:p-6 border-b shrink-0 space-y-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mr-8 md:mr-0">
                            <DialogTitle className="text-lg">Archivio Foto</DialogTitle>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                                {isDeleteMode && photosToDelete.size > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDeleteSelectedPhotos}
                                        disabled={deletePhotosMutation.isPending}
                                        className="h-8 text-xs md:text-sm"
                                    >
                                        Elimina ({photosToDelete.size})
                                    </Button>
                                )}
                                <Button
                                    variant={isDeleteMode ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => {
                                        setIsDeleteMode(!isDeleteMode);
                                        if (isDeleteMode) setPhotosToDelete(new Set());
                                    }}
                                    title={isDeleteMode ? "Esci da elimina" : "Elimina foto"}
                                    className={`h-8 px-2 md:px-3 gap-2 ${isDeleteMode ? "bg-red-100 text-red-700 hover:bg-red-200" : "text-gray-500"}`}
                                >
                                    {isDeleteMode ? (
                                        <>
                                            <X className="w-4 h-4" />
                                            <span className="hidden md:inline">Annulla</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden md:inline">Gestisci</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
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
                                {[...photos].sort((a: any, b: any) => {
                                    const aAssigned = assignedUrls.has(a.url);
                                    const bAssigned = assignedUrls.has(b.url);

                                    // If assignment status is different, unassigned (false) comes first
                                    if (aAssigned !== bAssigned) {
                                        return aAssigned ? 1 : -1;
                                    }
                                    // Otherwise sort by name
                                    return a.name.localeCompare(b.name);
                                }).map((photo: any) => {
                                    const isSelectedForDeletion = photosToDelete.has(photo.name);
                                    const isAssigned = assignedUrls.has(photo.url);

                                    return (
                                        <div
                                            key={photo.name}
                                            className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white
                                                ${isDeleteMode
                                                    ? (isSelectedForDeletion ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-red-300 cursor-pointer')
                                                    : (isAssigned
                                                        ? 'opacity-30 cursor-not-allowed border-gray-200'
                                                        : 'border-transparent hover:border-orange-500 cursor-pointer shadow-sm hover:shadow-md'
                                                    )
                                                }
                                            `}
                                            onClick={() => {
                                                if (isDeleteMode) {
                                                    togglePhotoSelection(photo.name);
                                                } else {
                                                    if (!isAssigned) assignPhotoToDish(photo.url);
                                                }
                                            }}
                                        >
                                            <img src={photo.url} alt="Selection" className="w-full h-full object-cover" />

                                            {/* Overlays */}
                                            {isDeleteMode ? (
                                                <div className={`absolute inset-0 transition-colors flex items-center justify-center ${isSelectedForDeletion ? 'bg-red-500/20' : 'group-hover:bg-red-500/10'}`}>
                                                    {isAssigned && (
                                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" /> In Uso
                                                        </div>
                                                    )}
                                                    {isSelectedForDeletion && (
                                                        <div className="bg-red-500 text-white p-2 rounded-full transform scale-110 shadow-lg z-10">
                                                            <Trash2 className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    {isAssigned ? (
                                                        <Badge variant="secondary" className="bg-gray-800 text-white">In Uso</Badge>
                                                    ) : (
                                                        <span className="opacity-0 group-hover:opacity-100 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                            Seleziona
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Warning Dialog for Assigned Photos */}
            <AlertDialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="w-5 h-5" />
                            Foto in uso rilevate
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Hai selezionato una o più foto che sono attualmente assegnate a dei piatti nel menu.
                            <br /><br />
                            <strong>Se procedi, queste foto verranno rimosse anche dai piatti associati.</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeDeletePhotos}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Elimina Comunque
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
