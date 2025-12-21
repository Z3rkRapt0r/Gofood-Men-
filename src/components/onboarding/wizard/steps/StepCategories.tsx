'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, GripVertical, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types ---


interface StepCategoriesProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

// --- Sortable Item Component ---
function SortableCategoryItem({
    category,
    onDelete,
}: {
    category: Category;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm transition-all ${isDragging ? 'shadow-xl ring-2 ring-orange-500' : 'hover:border-orange-200'}`}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 touch-none"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex flex-col truncate">
                    <span className="font-semibold text-gray-800 truncate">{category.name}</span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50"
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}

// --- Main Component ---
import { useCategories, useAddCategory, useDeleteCategory, useReorderCategories, Category } from '@/hooks/useMenu';

export function StepCategories({ tenantId, onValidationChange }: StepCategoriesProps) {
    const { data: serverCategories = [], isLoading } = useCategories(tenantId);
    const addMutation = useAddCategory();
    const deleteMutation = useDeleteCategory();
    const reorderMutation = useReorderCategories();

    const [categories, setCategories] = useState<Category[]>([]);
    const [inputValue, setInputValue] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const SUGGESTED = ["Antipasti", "Primi", "Secondi", "Contorni", "Dolci", "Bevande", "Vini"];

    // Sync server data to local state for DND
    // Only update if server has data. 
    // Sync server data to local state
    // Use deep comparison to prevent infinite loops if serverCategories reference changes
    const prevServerCategoriesRef = useRef<string>('');

    useEffect(() => {
        if (!serverCategories) return;

        const serialized = JSON.stringify(serverCategories);
        if (prevServerCategoriesRef.current !== serialized) {
            setCategories(serverCategories);
            prevServerCategoriesRef.current = serialized;
        }
    }, [serverCategories]);

    // Validation Effect
    const isValidRef = useRef<boolean | null>(null);
    useEffect(() => {
        const isValid = categories.length > 0;
        if (isValidRef.current !== isValid) {
            onValidationChange(isValid);
            isValidRef.current = isValid;
        }
    }, [categories, onValidationChange]);

    async function addCategory(name: string) {
        if (!name.trim() || !tenantId) return;

        // Prevent duplicates in UI
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            toast.error('Categoria già esistente');
            return;
        }

        try {
            await addMutation.mutateAsync({
                tenantId,
                name,
                displayOrder: categories.length
            });
            setInputValue('');
            toast.success(`Categoria "${name}" aggiunta!`);
        } catch (err) {
            console.error(err);
            toast.error('Errore creazione categoria');
        }
    }

    async function deleteCategory(id: string) {
        if (!confirm("Eliminare questa categoria?")) return;
        try {
            await deleteMutation.mutateAsync({ id });
            // Local state update handled by useEffect sync from server invalidation
            // But for instant feedback we could filter locally too, but invalidation is fast.
        } catch (e) {
            toast.error("Errore cancellazione");
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update Order in DB
                if (!tenantId) return newItems;

                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    tenant_id: tenantId!,
                    name: item.name,
                    slug: item.slug,
                    display_order: index,
                    updated_at: new Date().toISOString(),
                }));

                reorderMutation.mutate({ updates });

                return newItems;
            });
        }
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900">Il Tuo Menu 🍔</h2>
                <p className="text-gray-600 mt-1">
                    Crea le categorie per il tuo menu. Es: Antipasti, Primi, Pizze.
                </p>
            </div>

            {/* Suggested Chips */}
            <div className="flex flex-wrap gap-2">
                {SUGGESTED.map(s => {
                    const exists = categories.some(c => c.name.toLowerCase() === s.toLowerCase());
                    return (
                        <Badge
                            key={s}
                            variant={exists ? "secondary" : "outline"}
                            className={`cursor-pointer px-3 py-1 text-sm ${exists
                                ? 'opacity-50 cursor-default'
                                : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transaction-colors'
                                }`}
                            onClick={() => !exists && addCategory(s)}
                        >
                            {exists ? <span className="mr-1">✓</span> : <Plus className="w-3 h-3 mr-1" />}
                            {s}
                        </Badge>
                    )
                })}
            </div>

            {/* Input Form */}
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory(inputValue)}
                    placeholder="Nuova categoria (es. Pizze Speciali)"
                    className="md:max-w-md py-6 text-lg"
                />
                <Button
                    onClick={() => addCategory(inputValue)}
                    disabled={!inputValue.trim() || addMutation.isPending}
                    size="icon"
                    className="h-full aspect-square bg-orange-500 hover:bg-orange-600"
                >
                    {addMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                </Button>
            </div>

            {/* Categories List */}
            <div className="space-y-2 max-w-2xl">
                {isLoading && categories.length === 0 ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                        Nessuna categoria creata.
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={categories.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="grid gap-2">
                                {categories.map((category) => (
                                    <SortableCategoryItem
                                        key={category.id}
                                        category={category}
                                        onDelete={deleteCategory}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

        </div>
    );
}
