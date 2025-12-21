'use client';

import { useCategories, useDishes, useAllergens, useUpdateDish, Dish, Category, Allergen } from '@/hooks/useMenu';
import { useMemo, useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StepCharacteristicsProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

interface CategoryWithDishes extends Category {
    dishes?: Dish[];
}

export function StepCharacteristics({ tenantId, onValidationChange }: StepCharacteristicsProps) {
    const { data: serverCats = [] } = useCategories(tenantId);
    const { data: serverDishes = [] } = useDishes(tenantId);
    const { data: allergens = [] } = useAllergens();

    const updateDishMutation = useUpdateDish();

    // Merge logic
    const categories: CategoryWithDishes[] = useMemo(() => {
        if (!serverCats) return [];
        return serverCats.map(c => ({
            ...c,
            dishes: serverDishes?.filter(d => d.category_id === c.id) || []
        })).filter(c => c.dishes && c.dishes.length > 0); // Only show categories with dishes
    }, [serverCats, serverDishes]);

    // Validation - always valid as these are optional enrichments?
    // Or maybe we want them to at least review it.
    // Let's assume valid by default once loaded.
    // Let's assume valid by default once loaded.
    useEffect(() => {
        onValidationChange(true);
    }, [onValidationChange]);

    const handleToggleCharacteristic = async (dish: Dish, field: keyof Dish, value: boolean) => {
        try {
            await updateDishMutation.mutateAsync({
                id: dish.id,
                updates: { [field]: value }
            });
            // Toast might be too spammy here? Let's skip for rapid toggling or use a subtle one
            // toast.success('Salvato');
        } catch (error) {
            console.error(error);
            toast.error('Errore aggiornamento');
        }
    };

    const handleAllergenChange = async (dish: Dish, allergenId: string, checked: boolean) => {
        const currentIds = dish.allergen_ids || [];
        let newIds;
        if (checked) {
            newIds = [...currentIds, allergenId];
        } else {
            newIds = currentIds.filter(id => id !== allergenId);
        }

        try {
            await updateDishMutation.mutateAsync({
                id: dish.id,
                updates: { allergen_ids: newIds }
            });
        } catch (error) {
            console.error(error);
            toast.error('Errore aggiornamento allergeni');
        }
    };

    const glutenAllergen = allergens.find(a => a.name.toLowerCase().includes('glutine') || a.name.toLowerCase().includes('cereali'));
    const otherAllergens = allergens.filter(a => a.id !== glutenAllergen?.id);

    const handleGlutenToggle = async (dish: Dish, containsGluten: boolean) => {
        const currentIds = dish.allergen_ids || [];
        let newIds = currentIds;

        if (glutenAllergen) {
            if (containsGluten) {
                // Add allergen if not present
                if (!newIds.includes(glutenAllergen.id)) {
                    newIds = [...newIds, glutenAllergen.id];
                }
            } else {
                // Remove allergen
                newIds = newIds.filter(id => id !== glutenAllergen.id);
            }
        }

        try {
            await updateDishMutation.mutateAsync({
                id: dish.id,
                updates: {
                    is_gluten_free: !containsGluten, // Inverted logic
                    allergen_ids: newIds
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Errore aggiornamento glutine');
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Intro Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-2">🏷️ Caratteristiche e Allergeni</h2>
                <p className="text-blue-800 leading-relaxed">
                    Personalizza i tuoi piatti indicando caratteristiche e allergeni.<br />
                    Queste icone aiuteranno i tuoi clienti a filtrare il menu.
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    Nessun piatto trovato. Torna indietro per aggiungere i piatti.
                </div>
            ) : (
                <div className="space-y-6">
                    <Accordion type="single" collapsible defaultValue={categories[0]?.id} className="space-y-4">
                        {categories.map(category => (
                            <AccordionItem key={category.id} value={category.id} className="border border-gray-100 bg-white rounded-xl shadow-sm px-4">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-lg text-gray-800">{category.name}</div>
                                        <Badge variant="secondary" className="text-xs">{category.dishes?.length || 0} piatti</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6">
                                    <Accordion type="single" collapsible className="space-y-2">
                                        {category.dishes?.map(dish => {
                                            const containsGluten = !dish.is_gluten_free; // Default assumption
                                            const activeTagsCount = [
                                                dish.is_vegetarian, dish.is_vegan, dish.is_seasonal,
                                                dish.is_homemade, dish.is_frozen
                                            ].filter(Boolean).length + (containsGluten ? 1 : 0);
                                            const allergenCount = dish.allergen_ids?.length || 0;

                                            return (
                                                <AccordionItem key={dish.id} value={dish.id} className="border border-gray-100 rounded-lg overflow-hidden">
                                                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline data-[state=open]:bg-blue-50/50">
                                                        <div className="flex items-center justify-between w-full pr-4 text-left">
                                                            <div>
                                                                <div className="font-bold text-gray-900">{dish.name}</div>
                                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dish.description}</div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                {/* Summary Icons/Badges */}
                                                                <div className="flex gap-2">
                                                                    {activeTagsCount > 0 && (
                                                                        <Badge variant="outline" className="text-[10px] bg-white text-gray-600 border-gray-200">
                                                                            {activeTagsCount} <span className="ml-1 text-xs">🏷️</span>
                                                                        </Badge>
                                                                    )}
                                                                    {allergenCount > 0 && (
                                                                        <Badge variant="outline" className="text-[10px] bg-white text-red-600 border-red-200">
                                                                            {allergenCount} <span className="ml-1 text-xs">⚠️</span>
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="font-mono font-bold text-gray-400">€ {dish.price}</div>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-4 bg-white border-t border-gray-100">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Filtri Speciali */}
                                                            <div className="space-y-3">
                                                                <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Filtri Speciali</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {/* Stagionale */}
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_seasonal ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_seasonal', !dish.is_seasonal)}>
                                                                        <span className="text-2xl mb-1">🍂</span>
                                                                        <span className={`text-xs font-bold ${dish.is_seasonal ? 'text-orange-700' : 'text-gray-500'}`}>Stagionale</span>
                                                                    </div>
                                                                    {/* Contiene Glutine (Special Logic) */}
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${containsGluten ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleGlutenToggle(dish, !containsGluten)}>
                                                                        <span className="text-2xl mb-1">🌾</span>
                                                                        <span className={`text-xs font-bold ${containsGluten ? 'text-red-700' : 'text-gray-500'}`}>Contiene Glutine</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Caratteristiche */}
                                                            <div className="space-y-3">
                                                                <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Caratteristiche</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {/* Fatto in casa */}
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_homemade ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_homemade', !dish.is_homemade)}>
                                                                        <span className="text-2xl mb-1">🏠</span>
                                                                        <span className={`text-xs font-bold ${dish.is_homemade ? 'text-blue-700' : 'text-gray-500'}`}>Fatto in casa</span>
                                                                    </div>
                                                                    {/* Surgelato */}
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_frozen ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_frozen', !dish.is_frozen)}>
                                                                        <span className="text-2xl mb-1">❄️</span>
                                                                        <span className={`text-xs font-bold ${dish.is_frozen ? 'text-cyan-700' : 'text-gray-500'}`}>Surgelato</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Allergeni Presenti */}
                                                        <div className="mt-6">
                                                            <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 block">Allergeni Presenti</Label>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                {otherAllergens.map((allergen: any) => {
                                                                    const isSelected = dish.allergen_ids?.includes(allergen.id);
                                                                    return (
                                                                        <div
                                                                            key={allergen.id}
                                                                            className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${isSelected ? 'bg-red-50 border-red-200 shadow-sm' : 'hover:bg-gray-50 border-gray-100'
                                                                                }`}
                                                                            onClick={() => handleAllergenChange(dish, allergen.id, !isSelected)}
                                                                        >
                                                                            <span className="text-xl">{allergen.icon}</span>
                                                                            <span className={`text-sm font-medium ${isSelected ? 'text-red-700' : 'text-gray-600'} leading-tight`}>
                                                                                {allergen.name}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
}
