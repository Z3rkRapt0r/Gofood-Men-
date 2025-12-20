'use client';

import { useState, useEffect } from 'react';
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
interface Category {
    id: string;
    name: string;
    slug: string;
    display_order: number;
    is_visible: boolean;
}

interface StepCategoriesProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
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
export function StepCategories({ tenantId }: StepCategoriesProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [addingIds, setAddingIds] = useState<string[]>([]); // Track which chips are adding

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const SUGGESTED = ["Antipasti", "Primi", "Secondi", "Contorni", "Dolci", "Bevande", "Vini"];

    useEffect(() => {
        if (tenantId) {
            loadCategories();
        }
    }, [tenantId]);

    async function loadCategories() {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('display_order', { ascending: true });

        if (data) setCategories(data);
        setLoading(false);
    }

    function generateSlug(text: string): string {
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    async function addCategory(name: string) {
        if (!name.trim() || !tenantId) return;

        // Optimistic UI for Quick Add
        const tempId = 'temp-' + Date.now();
        const newCategory = {
            id: tempId,
            name: name,
            slug: generateSlug(name),
            display_order: categories.length,
            is_visible: true,
            tenant_id: tenantId
        };

        // Prevent duplicates in UI
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            toast.error('Categoria già esistente');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCategories(prev => [...prev, newCategory as any]);
        setInputValue('');

        try {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('categories') as any)
                .insert({
                    tenant_id: tenantId,
                    name: name,
                    slug: generateSlug(name),
                    display_order: categories.length,
                    is_visible: true
                })
                .select()
                .single();

            if (error) throw error;

            // Replace optimistic item with real one
            setCategories(prev => prev.map(c => c.id === tempId ? data : c));
            toast.success(`Categoria "${name}" aggiunta!`);
        } catch (err) {
            console.error(err);
            toast.error('Errore creazione categoria');
            setCategories(prev => prev.filter(c => c.id !== tempId));
        }
    }

    async function deleteCategory(id: string) {
        if (!confirm("Eliminare questa categoria?")) return;

        setCategories(prev => prev.filter(c => c.id !== id));

        const supabase = createClient();
        await supabase.from('categories').delete().eq('id', id);
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
                    tenant_id: tenantId,
                    name: item.name,
                    slug: item.slug,
                    display_order: index,
                    updated_at: new Date().toISOString(),
                }));

                const supabase = createClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (supabase.from('categories') as any).upsert(updates, { onConflict: 'id' }).then(({ error }: any) => {
                    if (error) console.error("Reorder error", error);
                });

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
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="h-full aspect-square bg-orange-500 hover:bg-orange-600"
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </div>

            {/* Categories List */}
            <div className="space-y-2 max-w-2xl">
                {loading ? (
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
