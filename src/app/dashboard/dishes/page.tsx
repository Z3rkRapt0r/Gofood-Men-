'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import MenuImportModal from '@/components/dashboard/MenuImportModal';
import { toast } from 'sonner';
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
import { Loader2, Plus, GripVertical, Trash2, Edit, Image as ImageIcon, Check } from 'lucide-react';

// Shadcn Imports
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Filter, X, Info, Search, Leaf, Wheat, Snowflake, Home } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DishInsert = Database['public']['Tables']['dishes']['Insert'];
type DishUpdate = Database['public']['Tables']['dishes']['Update'];

interface Dish {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  price: number;
  category_id: string;
  image_url?: string | null;
  slug: string;
  is_visible: boolean;
  is_seasonal: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_homemade: boolean;
  is_frozen: boolean;
  allergen_ids: string[];
  display_order: number;
  created_at?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Allergen {
  id: string;
  name: string;
  icon: string;
}

// ------------------------------------------------------------------
// SortableDishCard Component
// ------------------------------------------------------------------
function SortableDishCard({
  dish,
  category,
  onEdit,
  onDelete,
  onDeleteImage,
  selected,
  onSelect,
  isSelectionMode,
}: {
  dish: Dish;
  category?: Category;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
  onDeleteImage: (dish: Dish) => void;
  selected: boolean;
  onSelect: (id: string) => void;
  isSelectionMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'shadow-xl ring-2 ring-orange-500' : 'hover:shadow-md'}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Drag Handle & Content Wrapper */}
          <div className="flex items-start gap-4 flex-1 w-full sm:w-auto">
            {/* Checkbox for Selection - Only visible in Selection Mode */}
            {isSelectionMode && (
              <div className="mt-1 pt-1">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => onSelect(dish.id)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
              </div>
            )}

            {/* Drag Handle Icon - Hidden in Selection Mode */}
            {!isSelectionMode && (
              <div
                {...attributes}
                {...listeners}
                className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 touch-none"
                title="Sposta"
              >
                <GripVertical className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {dish.image_url && (
                  <div className="shrink-0 relative group">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg border border-border"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Eliminare immagine?')) {
                            onDeleteImage(dish);
                          }
                        }}
                        className="text-white hover:text-red-400 hover:bg-transparent h-8 w-8"
                        title="Rimuovi immagine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground break-words leading-tight">
                      {dish.name}
                    </h3>
                    {!dish.is_visible && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs uppercase tracking-wider">
                        Nascosto
                      </Badge>
                    )}
                    {/* Flags Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dish.is_seasonal && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          🍂 Stagionale
                        </Badge>
                      )}
                      {dish.is_vegetarian && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          <Leaf className="w-3 h-3" /> Vegetariano
                        </Badge>
                      )}
                      {dish.is_vegan && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          <Leaf className="w-3 h-3" /> Vegano
                        </Badge>
                      )}
                      {dish.is_gluten_free && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          <Wheat className="w-3 h-3" /> Senza Glutine
                        </Badge>
                      )}
                      {dish.is_homemade && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          <Home className="w-3 h-3" /> Fatto in casa
                        </Badge>
                      )}
                      {dish.is_frozen && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-lg px-2 py-0.5 text-[10px] gap-1 font-medium">
                          <Snowflake className="w-3 h-3" /> Surgelato
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dish.description}
                  </p>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-orange-600 text-base">€{dish.price.toFixed(2)}</span>
                    {category && (
                      <span className="text-muted-foreground font-medium">• {category.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:border-t-0 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(dish)}
              className="flex-1 sm:flex-none w-full justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              <Edit className="w-4 h-4" />
              <span className="sm:hidden">Modifica</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(dish.id)}
              className="flex-1 sm:flex-none w-full justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sm:hidden">Elimina</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------
export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFlags, setFilterFlags] = useState<Set<string>>(new Set());
  const [filterAllergens, setFilterAllergens] = useState<Set<string>>(new Set());

  // ... (previous useEffects) ...

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedDishes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDishes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedDishes.size === filteredDishes.length) {
      setSelectedDishes(new Set());
    } else {
      setSelectedDishes(new Set(filteredDishes.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDishes.size === 0) return;

    if (!confirm(`Eliminare ${selectedDishes.size} piatti?`)) return;

    try {
      const supabase = createClient();
      const idsToDelete = Array.from(selectedDishes);

      // 1. Delete images
      const dishesToDelete = dishes.filter(d => idsToDelete.includes(d.id));
      for (const dish of dishesToDelete) {
        if (dish.image_url) {
          await deleteDishImage(dish.image_url);
        }
      }

      // 2. Delete DB records
      const { error } = await supabase
        .from('dishes')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      toast.success(`${selectedDishes.size} piatti eliminati`);
      setSelectedDishes(new Set());
      setIsSelectionMode(false);
      loadData();
    } catch (err) {
      console.error('Error in bulk delete:', err);
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    slug: '',
    isVisible: true,
    isSeasonal: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isHomemade: false,
    isFrozen: false,
    image: null as File | null,
    selectedAllergens: [] as string[],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, restaurant_name')
        .eq('owner_id', user.id)
        .single();

      if (!tenant) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenantData = tenant as any;
      setTenantId(tenantData.id);

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('tenant_id', tenantData.id)
        .order('display_order');

      setCategories(categoriesData || []);

      // Load allergens
      const { data: allergensData } = await supabase
        .from('allergens')
        .select('id, name, icon')
        .order('name');

      setAllergens(allergensData || []);

      // Load dishes with allergens
      const { data: dishesData } = await supabase
        .from('dishes')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
        .order('name', { ascending: true });

      setDishes(dishesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Uploads a dish image to: [sanitized-name]-[id]/dishes/[filename]
   */
  async function uploadImage(file: File, restaurantName: string, tenantId: string): Promise<string> {
    const supabase = createClient();

    // NEW LOGIC: Use ONLY tenantId for folder name
    const folderName = `${tenantId}/dishes`;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    console.log('[DishesPage] Uploading to:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('dishes')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('dishes')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function deleteDishImage(imageUrl: string) {
    if (!imageUrl) return;
    try {
      const supabase = createClient();
      const url = new URL(imageUrl);

      const pathParts = url.pathname.split('/dishes/');
      if (pathParts.length < 2) return;

      // decodeURIComponent is important for paths with special chars
      const filePath = decodeURIComponent(pathParts.slice(1).join('/dishes/'));

      console.log('[DishesPage] Deleting image:', filePath);

      const { error } = await supabase.storage
        .from('dishes')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
      }
    } catch (err) {
      console.error('Error parsing image URL:', err);
    }
  }

  // ------------------------------------------------------------------
  // Drag and Drop Logic
  // ------------------------------------------------------------------
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const filteredList = selectedCategory === 'all'
        ? dishes
        : dishes.filter(d => d.category_id === selectedCategory);

      const oldIndex = filteredList.findIndex((item) => item.id === active.id);
      const newIndex = filteredList.findIndex((item) => item.id === over?.id);

      const newFilteredList = arrayMove(filteredList, oldIndex, newIndex);

      const existingOrders = filteredList.map(d => d.display_order);
      const minOrder = existingOrders.length > 0 ? Math.min(...existingOrders) : 0;

      const itemsWithUpdatedOrder = newFilteredList.map((item, idx) => ({
        ...item,
        display_order: minOrder + idx
      }));

      // Update global state
      setDishes(prev => {
        // Create a map of updates
        const updateMap = new Map(itemsWithUpdatedOrder.map(i => [i.id, i.display_order]));

        const next = prev.map(d => {
          if (updateMap.has(d.id)) {
            return { ...d, display_order: updateMap.get(d.id)! };
          }
          return d;
        });

        // Keep them sorted by order for consistency
        return next.sort((a, b) => a.display_order - b.display_order);
      });

      // Update DB
      updateDishesOrder(itemsWithUpdatedOrder);
    }
  }

  async function updateDishesOrder(items: Dish[]) {
    try {
      const supabase = createClient();

      const upsertData = items.map((item) => ({
        id: item.id,
        tenant_id: item.tenant_id,
        name: item.name,
        category_id: item.category_id,
        price: item.price,
        slug: item.slug,
        description: item.description,
        is_visible: item.is_visible,
        is_seasonal: item.is_seasonal,
        is_vegetarian: item.is_vegetarian,
        is_vegan: item.is_vegan,
        is_gluten_free: item.is_gluten_free,
        is_homemade: item.is_homemade,
        is_frozen: item.is_frozen,
        display_order: item.display_order,
        allergen_ids: item.allergen_ids,
        image_url: item.image_url,
      }));

      const { error } = await supabase
        .from('dishes')
        // @ts-ignore
        .upsert(upsertData, { onConflict: 'id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Errore nel salvataggio dell\'ordine');
      loadData(); // Revert on error
    }
  }

  // ------------------------------------------------------------------
  // Form Submission
  // ------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!tenantId || !formData.categoryId) {
      toast.error('Seleziona una categoria');
      return;
    }

    try {
      const supabase = createClient();

      // Get tenant details for folder path
      const { data: tenant } = await supabase
        .from('tenants')
        .select('restaurant_name')
        .eq('id', tenantId)
        .single();

      if (!tenant) throw new Error('Tenant not found');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tenantData = tenant as any;
      let imageUrl = editingDish?.image_url;

      // 1. If uploading a NEW image
      if (formData.image) {
        // Delete OLD image if exists (STRICT CLEANUP)
        if (imageUrl) {
          console.log('[handleSubmit] Deleting old image before upload:', imageUrl);
          await deleteDishImage(imageUrl);
        }

        // Upload NEW image
        imageUrl = await uploadImage(formData.image, tenantData.restaurant_name, tenantId);
      }

      if (editingDish) {
        // Update
        const dishData = {
          tenant_id: tenantId,
          category_id: formData.categoryId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          slug: formData.slug || generateSlug(formData.name),
          is_visible: formData.isVisible,
          is_seasonal: formData.isSeasonal,
          is_vegetarian: formData.isVegetarian,
          is_vegan: formData.isVegan,
          is_gluten_free: formData.isGlutenFree,
          is_homemade: formData.isHomemade,
          is_frozen: formData.isFrozen,
          allergen_ids: formData.selectedAllergens,
        };

        const { error } = await supabase
          .from('dishes')
          // @ts-ignore
          .update(dishData)
          .eq('id', editingDish.id);

        if (error) throw error;
      } else {
        // Create
        const dishData = {
          tenant_id: tenantId,
          category_id: formData.categoryId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: imageUrl,
          slug: formData.slug || generateSlug(formData.name),
          is_visible: formData.isVisible,
          is_seasonal: formData.isSeasonal,
          is_vegetarian: formData.isVegetarian,
          is_vegan: formData.isVegan,
          is_gluten_free: formData.isGlutenFree,
          is_homemade: formData.isHomemade,
          is_frozen: formData.isFrozen,
          display_order: dishes.length, // Append to end
          allergen_ids: formData.selectedAllergens,
        };

        const { error } = await supabase
          .from('dishes')
          // @ts-ignore
          .insert([dishData]);

        if (error) throw error;
      }

      resetForm();
      loadData();
    } catch (err) {
      console.error('Error saving dish:', err);
      toast.error(err instanceof Error ? err.message : 'Errore nel salvataggio del piatto');
    }
  }

  async function handleDeleteImage(dish: Dish) {
    try {
      const supabase = createClient();

      if (dish.image_url) {
        await deleteDishImage(dish.image_url);
      }

      const { error } = await supabase
        .from('dishes')
        // @ts-ignore
        .update({ image_url: null })
        .eq('id', dish.id);

      if (error) throw error;

      toast.success('Immagine rimossa');
      loadData();
    } catch (err) {
      console.error('Error removing image:', err);
      toast.error('Errore durante la rimozione dell\'immagine');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo piatto?')) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);

      // Delete image if exists
      const dishToDelete = dishes.find(d => d.id === id);
      if (dishToDelete?.image_url) {
        await deleteDishImage(dishToDelete.image_url);
      }

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error deleting dish:', err);
      toast.error('Errore durante l\'eliminazione del piatto');
    }
  }

  function handleEdit(dish: Dish) {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      categoryId: dish.category_id,
      slug: '',
      isVisible: dish.is_visible,
      isSeasonal: dish.is_seasonal,
      isVegetarian: dish.is_vegetarian,
      isVegan: dish.is_vegan,
      isGlutenFree: dish.is_gluten_free,
      isHomemade: dish.is_homemade || false,
      isFrozen: dish.is_frozen || false,
      image: null,
      selectedAllergens: dish.allergen_ids || [],
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      slug: '',
      isVisible: true,
      isSeasonal: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isHomemade: false,
      isFrozen: false,
      image: null,
      selectedAllergens: [],
    });
    setShowForm(false);
    setEditingDish(null);
  }

  const filteredDishes = dishes.filter(d => {
    // 0. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = d.name.toLowerCase().includes(query);
      const matchesDesc = d.description?.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) return false;
    }

    // 1. Category Filter
    if (selectedCategory !== 'all' && d.category_id !== selectedCategory) return false;

    // 2. Flags Filter
    if (filterFlags.size > 0) {
      for (const flag of Array.from(filterFlags)) {
        // @ts-ignore
        if (!d[flag]) return false;
      }
    }

    // 3. Allergens Filter (OR Logic)
    if (filterAllergens.size > 0) {
      const hasAllergen = d.allergen_ids?.some(id => filterAllergens.has(id));
      if (!hasAllergen) return false;
    }

    return true;
  });

  const activeFiltersCount = filterFlags.size + filterAllergens.size;

  const toggleFilterFlag = (flag: string) => {
    const newFlags = new Set(filterFlags);
    if (newFlags.has(flag)) {
      newFlags.delete(flag);
    } else {
      newFlags.add(flag);
    }
    setFilterFlags(newFlags);
  };

  const toggleFilterAllergen = (id: string) => {
    const newAllergens = new Set(filterAllergens);
    if (newAllergens.has(id)) {
      newAllergens.delete(id);
    } else {
      newAllergens.add(id);
    }
    setFilterAllergens(newAllergens);
  };

  const resetFilters = () => {
    setFilterFlags(new Set());
    setFilterAllergens(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <span className="text-6xl mb-4 block">📁</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Crea prima le categorie
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Per importare i piatti con l&apos;AI o manualmente bisogna stabilire prima le categorie.
          Una volta creata una prima categoria, potrai scegliere di importare il piatto manualmente o con l&apos;AI.
        </p>
        <Link href="/dashboard/categories">
          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0">
            Vai alle Categorie
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Piatti Menu 🍽️
          </h1>
          <p className="text-muted-foreground">
            Gestisci i piatti del tuo menu digitale
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 shadow-lg hover:shadow-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Piatto
          </Button>
        </div>
      </div>

      {/* Selection Header */}
      {isSelectionMode && (
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={filteredDishes.length > 0 && selectedDishes.size === filteredDishes.length}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <span className="text-sm font-medium text-orange-900">
                {selectedDishes.size > 0 ? `${selectedDishes.size} selezionati` : 'Seleziona tutto'}
              </span>
            </div>

            {selectedDishes.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Elimina ({selectedDishes.size})
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 pb-4">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca piatto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-orange-200 focus-visible:ring-orange-500"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Mobile: Scrollable Categories */}
          {/* Desktop: Wrapped Categories */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible px-1 scrollbar-hide w-full">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'secondary'}
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap ${selectedCategory === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            >
              Tutte ({dishes.length})
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'secondary'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap ${selectedCategory === cat.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                {cat.name} ({dishes.filter(d => d.category_id === cat.id).length})
              </Button>
            ))}
          </div>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 shrink-0 relative bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Filter className="w-4 h-4 text-orange-600" />
                <span className="text-orange-900 font-medium">Filtri</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-orange-600 animate-in zoom-in">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl">
              <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5">
                <SheetTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                  Filtri Avanzati
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Personalizza la ricerca per dietetica ed esigenze alimentari.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Filtri Speciali Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Filtri Speciali
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'is_seasonal', label: 'Stagionale', icon: '🍂' },
                      { key: 'is_gluten_free', label: 'Senza Glutine', icon: '🌾' },
                    ].map((flag) => {
                      const isActive = filterFlags.has(flag.key);
                      return (
                        <div
                          key={flag.key}
                          onClick={() => toggleFilterFlag(flag.key)}
                          className={`
                              cursor-pointer group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 select-none
                              ${isActive
                              ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm'
                              : 'border-transparent bg-secondary/50 hover:bg-secondary hover:border-orange-200/50 text-muted-foreground hover:text-foreground'
                            }
                            `}
                        >
                          <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {flag.icon}
                          </span>
                          <span className="font-medium text-sm">
                            {flag.label}
                          </span>
                          {isActive && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 animate-in zoom-in duration-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Caratteristiche Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Caratteristiche
                    </h4>
                    {filterFlags.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilterFlags(new Set())}
                        className="h-auto p-0 text-xs text-orange-600 hover:text-orange-700 hover:bg-transparent"
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'is_vegetarian', label: 'Vegetariano', icon: '🥬' },
                      { key: 'is_vegan', label: 'Vegano', icon: '🌱' },
                      { key: 'is_homemade', label: 'Fatto in casa', icon: '🏠' },
                      { key: 'is_frozen', label: 'Surgelato', icon: '❄️' },
                    ].map((flag) => {
                      const isActive = filterFlags.has(flag.key);
                      return (
                        <div
                          key={flag.key}
                          onClick={() => toggleFilterFlag(flag.key)}
                          className={`
                              cursor-pointer group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 select-none
                              ${isActive
                              ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm'
                              : 'border-transparent bg-secondary/50 hover:bg-secondary hover:border-orange-200/50 text-muted-foreground hover:text-foreground'
                            }
                            `}
                        >
                          <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {flag.icon}
                          </span>
                          <span className="font-medium text-sm">
                            {flag.label}
                          </span>
                          {isActive && (
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 animate-in zoom-in duration-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Allergens Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Allergeni
                    </h4>
                    {filterAllergens.size > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilterAllergens(new Set())}
                        className="h-auto p-0 text-xs text-orange-600 hover:text-orange-700 hover:bg-transparent"
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {allergens.map((allergen) => {
                      const isActive = filterAllergens.has(allergen.id);
                      return (
                        <div
                          key={allergen.id}
                          onClick={() => toggleFilterAllergen(allergen.id)}
                          className={`
                              cursor-pointer flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 min-h-[5.5rem] text-center select-none
                              ${isActive
                              ? 'border-red-500 bg-red-50 text-red-950 shadow-sm'
                              : 'border-transparent bg-secondary/30 hover:bg-secondary hover:border-red-200/50 text-muted-foreground hover:text-foreground'
                            }
                            `}
                        >
                          <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {allergen.icon}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-tight line-clamp-2 leading-tight">
                            {allergen.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <SheetFooter className="p-6 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1 h-12 text-muted-foreground hover:text-foreground border-transparent bg-secondary/50 hover:bg-secondary"
                  >
                    Azzera Tutto
                  </Button>
                  <SheetClose asChild>
                    <Button
                      className="flex-[2] h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40 text-base font-semibold"
                    >
                      Vedi {filteredDishes.length} Piatti
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Dishes List */}
      {filteredDishes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-4">🍽️</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun piatto trovato</h3>
            <p className="text-muted-foreground mb-6">
              Nessun piatto corrisponde ai filtri selezionati.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                setSelectedCategory('all');
              }}
            >
              Rimuovi Filtri
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredDishes.map((d) => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {filteredDishes.map((dish) => (
                <SortableDishCard
                  key={dish.id}
                  dish={dish}
                  category={categories.find(c => c.id === dish.category_id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDeleteImage={handleDeleteImage}
                  selected={selectedDishes.has(dish.id)}
                  onSelect={toggleSelection}
                  isSelectionMode={isSelectionMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-2 border-b border-border">
            <DialogTitle className="text-2xl font-bold">
              {editingDish ? 'Modifica Piatto' : 'Nuovo Piatto'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <form id="dish-form" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Carbonara"
                />
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                  placeholder="Descrivi il piatto..."
                />
              </div>

              {/* Prezzo */}
              <div className="space-y-2">
                <Label>Prezzo (€) *</Label>
                <Input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="12.50"
                />
              </div>

              {/* Immagine */}
              <div className="space-y-2">
                <Label>Immagine Piatto</Label>
                <div className="flex items-center gap-4 border p-4 rounded-lg bg-muted/20">
                  {editingDish?.image_url && !formData.image && (
                    <div className="relative group shrink-0">
                      <img
                        src={editingDish.image_url}
                        alt="Current"
                        className="w-20 h-20 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={async () => {
                          if (confirm('Rimuovere immagine?')) {
                            await handleDeleteImage(editingDish);
                            setEditingDish({ ...editingDish, image_url: null });
                          }
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, image: file });
                      }
                    }}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Status & Flags */}
              <div className="space-y-6 pt-4 border-t border-border">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="space-y-0.5">
                    <Label className="text-base">Visibile nel menu</Label>
                    <p className="text-xs text-muted-foreground">
                      Se disattivato, il piatto sarà nascosto ai clienti
                    </p>
                  </div>
                  <Switch
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                  />
                </div>

                {/* Filtri Speciali */}
                {/* Filtri Speciali */}
                {/* Filtri Speciali */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-2">
                      Filtri Speciali
                    </Label>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground hover:text-orange-500 cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-orange-50 text-orange-950 border-orange-200 max-w-[250px]">
                          <p className="text-xs font-medium">
                            Attenzione: utilizzando questi filtri si agirà sulla visibilità del piatto sul menu.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card
                      className={`cursor-pointer transition-all hover:border-orange-300 ${formData.isSeasonal ? 'border-orange-500 bg-orange-50' : ''}`}
                      onClick={() => setFormData({ ...formData, isSeasonal: !formData.isSeasonal })}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🍂</span>
                        <span className={`text-xs font-bold ${formData.isSeasonal ? 'text-orange-700' : 'text-muted-foreground'}`}>Stagionale</span>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all hover:border-green-300 ${formData.isGlutenFree ? 'border-green-500 bg-green-50' : ''}`}
                      onClick={() => {
                        const newIsGlutenFree = !formData.isGlutenFree;
                        let newSelectedAllergens = formData.selectedAllergens;

                        // If setting Gluten Free to TRUE, remove 'glutine' allergen if present
                        if (newIsGlutenFree) {
                          // Assuming 'glutine' is the ID for gluten allergen. If it's an ID from DB, we need to find it.
                          // Based on previous code, allergen.id is used. We need to find the ID for gluten.
                          // Actually, in the code below we see getAllergens uses IDs.
                          // Let's protect against the hardcoded ID if possible, but for now we filter by text/logic.
                          // However, looking at the Allergens section logic in lines 1433+, it uses `allergen.id`.
                          // Usually 'glutine' is the ID if the seed data is consistent, but it's safer to find the ID.
                          // Since I don't have the ID easily here without iterating allergens, let's look at how the Allergens section renders.
                          // It iterates `allergens`. Ideally I should find the 'glutine' allergen ID.
                          // But for now, let's assume I can iterate `allergens` state variable which is available in component scope.
                          const glutineAllergen = allergens.find(a => a.name.toLowerCase() === 'glutine' || a.id === 'glutine');
                          if (glutineAllergen) {
                            newSelectedAllergens = newSelectedAllergens.filter(id => id !== glutineAllergen.id);
                          }
                        }

                        setFormData({
                          ...formData,
                          isGlutenFree: newIsGlutenFree,
                          selectedAllergens: newSelectedAllergens
                        });
                      }}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🌾</span>
                        <span className={`text-xs font-bold ${formData.isGlutenFree ? 'text-green-700' : 'text-muted-foreground'}`}>Senza Glutine</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Caratteristiche */}
                <div className="space-y-3">
                  <Label>Caratteristiche</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card
                      className={`cursor-pointer transition-all hover:border-green-300 ${formData.isVegetarian ? 'border-green-500 bg-green-50' : ''}`}
                      onClick={() => setFormData({ ...formData, isVegetarian: !formData.isVegetarian })}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🥬</span>
                        <span className={`text-xs font-bold ${formData.isVegetarian ? 'text-green-700' : 'text-muted-foreground'}`}>Vegetariano</span>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all hover:border-green-300 ${formData.isVegan ? 'border-green-500 bg-green-50' : ''}`}
                      onClick={() => setFormData({ ...formData, isVegan: !formData.isVegan })}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">�</span>
                        <span className={`text-xs font-bold ${formData.isVegan ? 'text-green-700' : 'text-muted-foreground'}`}>Vegano</span>
                      </CardContent>
                    </Card>

                    {/* Fatto in casa */}
                    <Card
                      className={`cursor-pointer transition-all hover:border-orange-300 ${formData.isHomemade ? 'border-orange-500 bg-orange-50' : ''}`}
                      onClick={() => setFormData({ ...formData, isHomemade: !formData.isHomemade })}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🏠</span>
                        <span className={`text-xs font-bold ${formData.isHomemade ? 'text-orange-700' : 'text-muted-foreground'}`}>Fatto in casa</span>
                      </CardContent>
                    </Card>

                    {/* Surgelato */}
                    <Card
                      className={`cursor-pointer transition-all hover:border-blue-300 ${formData.isFrozen ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => setFormData({ ...formData, isFrozen: !formData.isFrozen })}
                    >
                      <CardContent className="p-3 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">❄️</span>
                        <span className={`text-xs font-bold ${formData.isFrozen ? 'text-blue-700' : 'text-muted-foreground'}`}>Surgelato</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Allergeni */}
                <div className="space-y-3">
                  <Label>Allergeni Presenti</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {allergens.map((allergen) => (
                      <Card
                        key={allergen.id}
                        className={`cursor-pointer transition-all min-h-[6rem] p-1 hover:border-red-300 ${formData.selectedAllergens.includes(allergen.id) ? 'border-red-500 bg-red-50' : ''}`}
                        onClick={() => {
                          const includes = formData.selectedAllergens.includes(allergen.id);
                          const newSelected = !includes
                            ? [...formData.selectedAllergens, allergen.id]
                            : formData.selectedAllergens.filter(id => id !== allergen.id);

                          // Mutual Exclusivity Check
                          let newIsGlutenFree = formData.isGlutenFree;
                          const isGluten = allergen.name.toLowerCase() === 'glutine' || allergen.id === 'glutine';

                          // If checking 'Glutine', disable 'Senza Glutine'
                          if (!includes && isGluten) {
                            newIsGlutenFree = false;
                          }

                          setFormData({
                            ...formData,
                            selectedAllergens: newSelected,
                            isGlutenFree: newIsGlutenFree
                          });
                        }}
                      >
                        <CardContent className="p-2 flex flex-col items-center justify-center h-full gap-1">
                          <span className="text-2xl">{allergen.icon}</span>
                          <span className={`text-xs font-bold text-center leading-tight ${formData.selectedAllergens.includes(allergen.id) ? 'text-red-700' : 'text-gray-600'}`}>
                            {allergen.name}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border bg-white">
            <Button variant="outline" type="button" onClick={resetForm}>
              Annulla
            </Button>
            <Button
              type="submit"
              form="dish-form"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
            >
              {editingDish ? 'Salva Modifiche' : 'Crea Piatto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MenuImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          loadData();
          toast.success('Piatti importati con successo!');
        }}
        tenantId={tenantId}
        categories={categories}
      />
    </div>
  );
}
