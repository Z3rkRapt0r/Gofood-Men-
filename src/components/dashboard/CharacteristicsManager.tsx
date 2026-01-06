'use client';

import { useCategories, useDishes, useAllergens, useUpdateDish, useBulkUpdateDishes, Dish, Category } from '@/hooks/useMenu';
import { useDetectAllergens, AllergenResult } from '@/hooks/useDetectAllergens';
import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Wand2, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface CharacteristicsManagerProps {
    tenantId?: string;
    showIntro?: boolean;
}

interface CategoryWithDishes extends Category {
    dishes?: Dish[];
}

export function CharacteristicsManager({ tenantId, showIntro = true }: CharacteristicsManagerProps) {
    const { data: serverCats = [] } = useCategories(tenantId);
    const { data: serverDishes = [] } = useDishes(tenantId);
    const { data: allergens = [] } = useAllergens();

    const updateDishMutation = useUpdateDish();
    const { mutateAsync: bulkUpdateDishes } = useBulkUpdateDishes();
    const { mutateAsync: detectAllergens, isPending: isScanning } = useDetectAllergens();

    const [showScanModal, setShowScanModal] = useState(false);
    const [forceRescan, setForceRescan] = useState(false);
    const [aiResults, setAiResults] = useState<Map<string, AllergenResult>>(new Map());
    const [scanStats, setScanStats] = useState<{ analyzed: number, toReview: number } | null>(null);

    // Merge logic
    const categories: CategoryWithDishes[] = useMemo(() => {
        if (!serverCats) return [];
        return serverCats.map(c => ({
            ...c,
            dishes: serverDishes?.filter(d => d.category_id === c.id) || []
        })).filter(c => c.dishes && c.dishes.length > 0); // Only show categories with dishes
    }, [serverCats, serverDishes]);

    const handleToggleCharacteristic = async (dish: Dish, field: keyof Dish, value: boolean) => {
        try {
            await updateDishMutation.mutateAsync({
                id: dish.id,
                updates: { [field]: value }
            });
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

    const handleOpenScan = () => {
        setForceRescan(false);
        setShowScanModal(true);
    };

    const handleConfirmScan = async () => {
        setShowScanModal(false);

        // 1. Filter out dishes based on user preference
        const validDishes = serverDishes.filter(d => {
            if (forceRescan) return true; // Include everything if forced

            // Smart Skip Logic:
            const hasAllergens = d.allergen_ids && d.allergen_ids.length > 0;
            const hasCharacteristics = d.is_vegetarian || d.is_vegan || d.is_seasonal || d.is_homemade || d.is_frozen;

            // Skip if it has ANY meaningful data assigned
            return !(hasAllergens || hasCharacteristics);
        });

        const skippedCount = serverDishes.length - validDishes.length;

        if (validDishes.length === 0) {
            toast.info(forceRescan
                ? 'Nessun piatto trovato.'
                : 'Tutti i piatti hanno già dati assegnati. Usa "Riscansiona tutto" per forzare.'
            );
            return;
        }

        if (skippedCount > 0) {
            toast.info(`Scansione di ${validDishes.length} piatti (${skippedCount} saltati perché già curati)`);
        } else {
            toast.info(`Avvio scansione di ${validDishes.length} piatti...`);
        }

        setAiResults(new Map()); // Clear previous results
        setScanStats(null);

        // 2. Prepare dishes for analysis
        const dishesToAnalyze = validDishes.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            ingredients: d.description // Fallback
        }));

        // BATCHING LOGIC
        const BATCH_SIZE = 20;
        const batches = [];
        for (let i = 0; i < dishesToAnalyze.length; i += BATCH_SIZE) {
            batches.push(dishesToAnalyze.slice(i, i + BATCH_SIZE));
        }

        const resultsMap = new Map<string, AllergenResult>();
        let toReviewCount = 0;

        // Process batches sequentially
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchUpdates: Partial<Dish>[] = [];
            let retries = 0;
            let success = false;

            // Exponential Backoff Retry Loop
            while (!success && retries < 3) {
                try {
                    const baseDelay = 0;
                    const retryDelay = retries > 0 ? 2000 * Math.pow(2, retries) : 0;
                    const totalDelay = baseDelay + retryDelay;

                    if (totalDelay > 0) {
                        if (retries > 0) {
                            toast.warning(`Rate limit! Attendo ${totalDelay / 1000}s prima di riprovare...`, { id: 'ai-scan' });
                        } else {
                            toast.loading(`Analisi: batch ${i + 1}/${batches.length}...`, { id: 'ai-scan' });
                        }
                        await new Promise(resolve => setTimeout(resolve, totalDelay));
                    } else {
                        toast.loading(`Analisi: batch ${i + 1}/${batches.length}...`, { id: 'ai-scan' });
                    }

                    const response = await detectAllergens(batch);

                    // Process Response
                    response.results.forEach(result => {
                        const dish = dishesToAnalyze.find(d => d.name.toLowerCase() === result.dishName.toLowerCase());
                        if (!dish) return;

                        resultsMap.set(dish.id, {
                            ...result,
                            dish_id: dish.id // Ensure dish_id is present
                        } as any); // Type cast if needed depending on AllergenResult definition in component vs hook

                        if (result.needs_review) toReviewCount++;

                        // Auto-assign always ON
                        {
                            const fullDish = serverDishes.find(d => d.id === dish.id);
                            if (!fullDish) return;

                            let newAllergenIds = new Set(fullDish.allergen_ids || []);

                            if (result.allergens && result.allergens.length > 0) {
                                result.allergens.forEach(detectedName => {
                                    const matchedAllergen = allergens.find(a =>
                                        a.name.toLowerCase().includes(detectedName.toLowerCase()) ||
                                        detectedName.toLowerCase().includes(a.name.toLowerCase())
                                    );
                                    if (matchedAllergen) {
                                        newAllergenIds.add(matchedAllergen.id);
                                    }
                                });
                            }

                            let isGlutenFree = fullDish.is_gluten_free;
                            if (result.contains_gluten === true) {
                                isGlutenFree = false;
                                if (glutenAllergen) newAllergenIds.add(glutenAllergen.id);
                            } else if (result.contains_gluten === false) {
                                isGlutenFree = true;
                                if (glutenAllergen) newAllergenIds.delete(glutenAllergen.id);
                            }

                            batchUpdates.push({
                                id: dish.id,
                                tenant_id: fullDish.tenant_id,
                                category_id: fullDish.category_id,
                                slug: fullDish.slug,
                                name: fullDish.name,
                                price: fullDish.price,
                                display_order: fullDish.display_order,
                                allergen_ids: Array.from(newAllergenIds),
                                is_gluten_free: isGlutenFree
                            });
                        }
                    });

                    success = true;

                } catch (err: any) {
                    console.error(`Error in batch ${i}, retry ${retries}:`, err);
                    retries++;
                    if (retries >= 3) {
                        toast.error(`Impossibile analizzare il blocco ${i + 1}. Salto al prossimo.`, { id: 'ai-scan' });
                    }
                }
            }

            setAiResults(new Map(resultsMap));
            setScanStats({ analyzed: resultsMap.size, toReview: toReviewCount });

            if (success && batchUpdates.length > 0) {
                await bulkUpdateDishes({ updates: batchUpdates });
            }
        }

        toast.dismiss('ai-scan');
        toast.success("Analisi completata. Controlla i risultati.");

    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {showIntro && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                                🏷️ Caratteristiche e Allergeni
                            </h2>
                            <p className="text-blue-800/80 text-sm leading-relaxed max-w-2xl">
                                Personalizza i piatti. Usa l'AI per rilevare automaticamente gli allergeni dai nomi e ingredienti.
                            </p>
                        </div>
                        <Button
                            onClick={handleOpenScan}
                            disabled={isScanning || serverDishes.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                        >
                            {isScanning ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisi in corso...</>
                            ) : (
                                <><Wand2 className="w-4 h-4 mr-2" /> Scansiona Allergeni AI</>
                            )}
                        </Button>
                    </div>

                    {scanStats && (
                        <div className="mt-4 flex gap-4 text-sm animate-in fade-in slide-in-from-top-2">
                            <div className="px-3 py-1.5 bg-white/60 rounded-lg text-indigo-900 border border-indigo-100">
                                <b>{scanStats.analyzed}</b> piatti analizzati
                            </div>
                            {scanStats.toReview > 0 && (
                                <div className="px-3 py-1.5 bg-amber-50 rounded-lg text-amber-800 border border-amber-100 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    <b>{scanStats.toReview}</b> da rivedere
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Scan Modal */}
            <AlertDialog open={showScanModal} onOpenChange={setShowScanModal}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            <Wand2 className="w-6 h-6 text-indigo-600" />
                            Assegnazione Automatica
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 pt-2 text-left" asChild>
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    L'intelligenza artificiale (Gemini) analizzerà <b>{forceRescan ? serverDishes.length : serverDishes.filter(d => !((d.allergen_ids && d.allergen_ids.length > 0) || (d.is_vegetarian || d.is_vegan || d.is_seasonal || d.is_homemade || d.is_frozen))).length} piatti</b> (su {serverDishes.length} totali) per identificare possibili allergeni e glutine.
                                </p>

                                <div className="flex items-start space-x-3 p-3 border rounded-md bg-white">
                                    <Checkbox
                                        id="force-rescan"
                                        checked={forceRescan}
                                        onCheckedChange={(checked) => setForceRescan(checked as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="force-rescan"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Riscansiona tutto (ignora dati esistenti)
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Se attivo, analizza anche i piatti che hanno già caratteristiche o allergeni assegnati, sovrascrivendoli.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 text-xs flex gap-2">
                                    <AlertTriangle className="w-10 h-10 shrink-0 opacity-50" />
                                    <div>
                                        <b>Attenzione:</b> L'analisi è automatica e può contenere errori. Ti invitiamo sempre a verificare i risultati, specialmente per allergie gravi.
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex gap-3 items-start">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="flex-1 leading-relaxed">
                                        Per default, <b>saltiamo i piatti già curati</b> (con allergeni o caratteristiche). Attiva l'opzione sopra per forzare una scansione completa.
                                    </div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmScan}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            Avvia Scansione
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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

                                        {aiResults.size > 0 && category.dishes?.some(d => aiResults.get(d.id)?.needs_review) && (
                                            <Badge variant="outline" className="text-[10px] border-amber-200 bg-amber-50 text-amber-700 gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Da Rivedere
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-6">
                                    <Accordion type="single" collapsible className="space-y-2">
                                        {category.dishes?.map(dish => {
                                            const containsGluten = !!glutenAllergen && dish.allergen_ids?.includes(glutenAllergen.id);
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
                                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                                    {dish.name}
                                                                    {aiResults.has(dish.id) && (
                                                                        <span className="cursor-default inline-flex ml-1">
                                                                            {aiResults.get(dish.id)?.confidence === 'high' ? (
                                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                            ) : (
                                                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dish.description}</div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
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
                                                        {aiResults.has(dish.id) && (
                                                            <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                                                                        <Wand2 className="w-4 h-4 text-indigo-600" />
                                                                    </div>
                                                                    <div className="space-y-2 w-full">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="font-bold text-indigo-900 text-sm">Analisi Intelligenza Artificiale</h4>
                                                                            <Badge variant={aiResults.get(dish.id)?.confidence === 'high' ? "default" : "outline"} className={aiResults.get(dish.id)?.confidence === 'high' ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-amber-700 border-amber-200 bg-amber-50"}>
                                                                                {aiResults.get(dish.id)?.confidence === 'high' ? 'Alta Confidenza' : '⚠️ Da Revisionare'}
                                                                            </Badge>
                                                                        </div>

                                                                        <p className="text-sm text-indigo-900/80 leading-relaxed italic">
                                                                            "{aiResults.get(dish.id)?.rationale}"
                                                                        </p>

                                                                        {(aiResults.get(dish.id)?.allergens?.length || 0) > 0 && (
                                                                            <div className="flex flex-wrap gap-2 pt-1">
                                                                                <span className="text-xs font-semibold text-indigo-900 mt-1">Rilevati:</span>
                                                                                {aiResults.get(dish.id)?.allergens.map(a => (
                                                                                    <Badge key={a} variant="secondary" className="bg-white text-indigo-700 border border-indigo-100 text-xs shadow-sm">
                                                                                        {a}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-3">
                                                                <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Filtri Speciali</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_seasonal ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_seasonal', !dish.is_seasonal)}>
                                                                        <span className="text-2xl mb-1">🍂</span>
                                                                        <span className={`text-xs font-bold ${dish.is_seasonal ? 'text-orange-700' : 'text-gray-500'}`}>Stagionale</span>
                                                                    </div>
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${containsGluten ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleGlutenToggle(dish, !containsGluten)}>
                                                                        <span className="text-2xl mb-1">🌾</span>
                                                                        <span className={`text-xs font-bold ${containsGluten ? 'text-red-700' : 'text-gray-500'}`}>Contiene Glutine</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <Label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Caratteristiche</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_homemade ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_homemade', !dish.is_homemade)}>
                                                                        <span className="text-2xl mb-1">🏠</span>
                                                                        <span className={`text-xs font-bold ${dish.is_homemade ? 'text-blue-700' : 'text-gray-500'}`}>Fatto in casa</span>
                                                                    </div>
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_frozen ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_frozen', !dish.is_frozen)}>
                                                                        <span className="text-2xl mb-1">❄️</span>
                                                                        <span className={`text-xs font-bold ${dish.is_frozen ? 'text-cyan-700' : 'text-gray-500'}`}>Surgelato</span>
                                                                    </div>
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_vegetarian ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_vegetarian', !dish.is_vegetarian)}>
                                                                        <span className="text-2xl mb-1">🥗</span>
                                                                        <span className={`text-xs font-bold ${dish.is_vegetarian ? 'text-green-700' : 'text-gray-500'}`}>Vegetariano</span>
                                                                    </div>
                                                                    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${dish.is_vegan ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}
                                                                        onClick={() => handleToggleCharacteristic(dish, 'is_vegan', !dish.is_vegan)}>
                                                                        <span className="text-2xl mb-1">🌱</span>
                                                                        <span className={`text-xs font-bold ${dish.is_vegan ? 'text-emerald-700' : 'text-gray-500'}`}>Vegano</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

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
