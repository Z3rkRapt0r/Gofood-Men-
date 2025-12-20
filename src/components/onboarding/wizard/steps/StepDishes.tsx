'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Sparkles, Image as ImageIcon, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import MenuImportModal from '@/components/dashboard/MenuImportModal';
import toast from 'react-hot-toast';

interface Dish {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id: string;
    is_visible: boolean;
}

interface Category {
    id: string;
    name: string;
    dishes?: Dish[];
}

interface StepDishesProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
}

export function StepDishes({ tenantId }: StepDishesProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Manual Add State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [editingDish, setEditingDish] = useState<Dish | null>(null);
    const [dishForm, setDishForm] = useState({ name: '', description: '', price: '' });

    useEffect(() => {
        if (tenantId) loadData();
    }, [tenantId]);

    async function loadData() {
        if (!tenantId) return;
        setLoading(true);
        const supabase = createClient();

        // 1. Get Categories
        const { data: cats } = await supabase
            .from('categories') // Use 'any' if types are strict
            .select('id, name, display_order')
            .eq('tenant_id', tenantId)
            .order('display_order');

        if (!cats) {
            setLoading(false);
            return;
        }

        // 2. Get Dishes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dishes } = await (supabase.from('dishes') as any)
            .select('*')
            .eq('tenant_id', tenantId)
            .order('display_order'); // or created_at

        // Merge
        const merged = cats.map((c: any) => ({
            ...c,
            dishes: dishes?.filter((d: any) => d.category_id === c.id) || []
        }));

        setCategories(merged);
        setLoading(false);
    }

    function openAddModal(categoryId: string, dish?: Dish) {
        setSelectedCategoryId(categoryId);
        if (dish) {
            setEditingDish(dish);
            setDishForm({
                name: dish.name,
                description: dish.description || '',
                price: dish.price.toString()
            });
        } else {
            setEditingDish(null);
            setDishForm({ name: '', description: '', price: '' });
        }
        setIsAddModalOpen(true);
    }

    async function handleSaveDish() {
        if (!selectedCategoryId || !tenantId || !dishForm.name) return;

        try {
            const supabase = createClient();
            const slug = dishForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const priceVal = parseFloat(dishForm.price.replace(',', '.')) || 0;

            if (editingDish) {
                // Update
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase.from('dishes') as any)
                    .update({
                        name: dishForm.name,
                        description: dishForm.description,
                        price: priceVal,
                        slug: slug
                    })
                    .eq('id', editingDish.id);
                if (error) throw error;
            } else {
                // Insert
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase.from('dishes') as any).insert({
                    tenant_id: tenantId,
                    category_id: selectedCategoryId,
                    name: dishForm.name,
                    description: dishForm.description,
                    price: priceVal,
                    slug: slug,
                    is_visible: true,
                    // display_order...
                });
                if (error) throw error;
            }

            setIsAddModalOpen(false);
            loadData();
            toast.success(editingDish ? 'Piatto aggiornato' : 'Piatto aggiunto');
        } catch (err) {
            console.error(err);
            toast.error('Errore salvataggio piatto');
        }
    }

    async function handleDeleteDish(id: string) {
        if (!confirm("Eliminare il piatto?")) return;
        const supabase = createClient();
        await supabase.from('dishes').delete().eq('id', id);
        loadData();
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">I Tuoi Piatti 🍝</h2>
                    <p className="text-gray-600 mt-1">
                        Aggiungi i piatti al tuo menu. Usa l'AI per fare prima!
                    </p>
                </div>
                <Button
                    onClick={() => setIsAiModalOpen(true)}
                    className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg border-0"
                >
                    <Sparkles className="w-4 h-4 mr-2" /> Importa con AI
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">Nessuna categoria trovata. Torna indietro e crea le categorie.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <Accordion type="multiple" defaultValue={categories.map(c => c.id)} className="space-y-4">
                        {categories.map(category => (
                            <AccordionItem key={category.id} value={category.id} className="border border-gray-100 bg-white rounded-xl shadow-sm px-4">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-lg text-gray-800">{category.name}</div>
                                        <Badge variant="secondary" className="text-xs">{category.dishes?.length || 0}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4 space-y-3">
                                    {(category.dishes && category.dishes.length > 0) ? (
                                        <div className="grid gap-3">
                                            {category.dishes.map(dish => (
                                                <div key={dish.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-orange-50 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-gray-900">{dish.name}</div>
                                                        <div className="text-sm text-gray-500">{dish.description}</div>
                                                        <div className="text-sm font-mono font-medium text-orange-600 mt-1">€ {dish.price}</div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => openAddModal(category.id, dish)}>
                                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDish(dish.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-gray-400 text-sm italic">
                                            Nessun piatto in questa categoria
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        onClick={() => openAddModal(category.id)}
                                        className="w-full border-dashed text-gray-500 hover:text-orange-600 hover:border-orange-300"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Aggiungi Piatto a {category.name}
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {/* AI Import Modal */}
            {tenantId && (
                <MenuImportModal
                    isOpen={isAiModalOpen}
                    onClose={() => setIsAiModalOpen(false)}
                    onSuccess={() => {
                        loadData();
                        toast.success("Menu importato con successo!");
                    }}
                    tenantId={tenantId}
                    categories={categories}
                />
            )}

            {/* Manual Add/Edit Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDish ? 'Modifica Piatto' : 'Nuovo Piatto'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Piatto</Label>
                            <Input
                                value={dishForm.name}
                                onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                                placeholder="es. Spaghetti Carbonara"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrizione</Label>
                            <Input
                                value={dishForm.description}
                                onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                                placeholder="Ingredienti, allergeni..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Prezzo (€)</Label>
                            <Input
                                type="number"
                                step="0.50"
                                value={dishForm.price}
                                onChange={e => setDishForm({ ...dishForm, price: e.target.value })}
                                placeholder="12.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annulla</Button>
                        <Button onClick={handleSaveDish} disabled={!dishForm.name} className="bg-orange-500 hover:bg-orange-600">Salva</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
