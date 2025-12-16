'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import MenuImportModal from '@/components/dashboard/MenuImportModal';
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
}: {
  dish: Dish;
  category?: Category;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
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
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all ${isDragging ? 'shadow-xl ring-2 ring-orange-500' : ''
        }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Drag Handle & Content Wrapper */}
        <div className="flex items-start gap-4 flex-1 w-full sm:w-auto">
          {/* Drag Handle Icon */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 touch-none"
            title="Sposta"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {dish.image_url && (
                <div className="shrink-0">
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {dish.name}
                  </h3>
                  {!dish.is_visible && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      Nascosto
                    </span>
                  )}
                  {dish.is_seasonal && <span className="text-base sm:text-lg" title="Stagionale">🍂</span>}
                  {dish.is_vegetarian && <span className="text-base sm:text-lg" title="Vegetariano">🥬</span>}
                  {dish.is_vegan && <span className="text-base sm:text-lg" title="Vegano">🌱</span>}
                  {dish.is_gluten_free && <span className="text-base sm:text-lg" title="Senza Glutine">🌾</span>}
                  {dish.is_homemade && <span className="text-base sm:text-lg" title="Fatto in casa">🏠</span>}
                  {dish.is_frozen && <span className="text-base sm:text-lg" title="Surgelato">❄️</span>}
                </div>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {dish.description}
                </p>

                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-orange-600 text-base">€{dish.price.toFixed(2)}</span>
                  {category && (
                    <span className="text-gray-400 font-medium">• {category.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <button
            onClick={() => onEdit(dish)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-semibold"
            title="Modifica"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="sm:hidden">Modifica</span>
          </button>
          <button
            onClick={() => onDelete(dish.id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-semibold"
            title="Elimina"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="sm:hidden">Elimina</span>
          </button>
        </div>
      </div>
    </div>
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
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!tenant) return;

      const tenantData = tenant as { id: string };
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

  async function uploadImage(file: File, slug: string): Promise<string> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Path structure: [slug]/immagini piatti/[filename]
    const filePath = `${slug}/immagini piatti/${fileName}`;

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
      // Extract path from public URL
      // Example: https://.../storage/v1/object/public/dishes/folder/file.jpg
      // We want: folder/file.jpg
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/dishes/');
      if (pathParts.length < 2) return;

      const filePath = decodeURIComponent(pathParts[1]);

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

      // Fix: Handle cases where multiple items have the same display_order (e.g. default 0)
      // We find the starting point (min order) and distribute sequentially from there.
      // If all orders are 0, we start from 0.
      const existingOrders = filteredList.map(d => d.display_order);
      const minOrder = existingOrders.length > 0 ? Math.min(...existingOrders) : 0;

      const itemsWithUpdatedOrder = newFilteredList.map((item, idx) => ({
        ...item,
        display_order: minOrder + idx // Ensure sequential unique orders within this view
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

      // Get tenant slug for folder path
      const { data: tenant } = await supabase
        .from('tenants')
        .select('slug')
        .eq('id', tenantId)
        .single();

      if (!tenant) throw new Error('Tenant not found');

      const tenantData = tenant as { slug: string };
      let imageUrl = editingDish?.image_url;

      if (formData.image) {
        imageUrl = await uploadImage(formData.image, tenantData.slug);
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
          // display_order: REMOVED to avoid resetting order
          allergen_ids: formData.selectedAllergens,
        };

        const { error } = await supabase
          .from('dishes')
          // @ts-ignore
          .update(dishData)
          .eq('id', editingDish.id);

        if (error) throw error;

        // Delete old image if it exists and was replaced
        if (imageUrl !== editingDish.image_url && editingDish.image_url) {
          await deleteDishImage(editingDish.image_url);
        }
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

  const filteredDishes = selectedCategory === 'all'
    ? dishes
    : dishes.filter(d => d.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Per importare i piatti con l&apos;AI o manualmente bisogna stabilire prima le categorie.
          Una volta creata una prima categoria, potrai scegliere di importare il piatto manualmente o con l&apos;AI.
        </p>
        <Link
          href="/dashboard/categories"
          className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Vai alle Categorie
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Piatti Menu 🍽️
          </h1>
          <p className="text-gray-600">
            Gestisci i piatti del tuo menu digitale
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Importa AI</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuovo</span>
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${selectedCategory === 'all'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Tutte ({dishes.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${selectedCategory === cat.id
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {cat.name} ({dishes.filter(d => d.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {
        showForm && (
          <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDish ? 'Modifica Piatto' : 'Nuovo Piatto'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  >
                    <option value="">Seleziona categoria...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="es. Carbonara"
                  />
                </div>


                {/* Descrizione */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                    placeholder="Descrivi il piatto..."
                  />
                </div>

                {/* Prezzo */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Prezzo (€) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="12.50"
                  />
                </div>

                {/* Immagine */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Immagine Piatto
                  </label>
                  <div className="flex items-center gap-4">
                    {editingDish?.image_url && !formData.image && (
                      <img
                        src={editingDish.image_url}
                        alt="Current"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, image: file });
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>

                {/* Status & Flags */}
                <div className="space-y-6">
                  {/* Visibility Toggle */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-900">Visibile nel menu</span>
                        <span className="block text-xs text-gray-500">Se disattivato, il piatto sarà nascosto ai clienti</span>
                      </div>
                    </label>
                  </div>

                  {/* Filtri Speciali */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block text-sm font-bold text-gray-900">
                        Filtri Speciali
                      </label>
                      <div className="group relative flex items-center">
                        <span className="cursor-help text-gray-400 hover:text-gray-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <div className="absolute left-full ml-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                          Questi filtri influenzano la visibilità del piatto nel menu (es. immagine stagionale) o avvertenze critiche (es. icona glutine).
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.isSeasonal ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.isSeasonal}
                          onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                        />
                        <span className="text-2xl mb-1">🍂</span>
                        <span className="text-xs font-bold">Stagionale</span>
                      </label>

                      {/* Manual placement of "Glutine" allergen if available */}
                      {allergens.filter(a => a.id === 'glutine').map(glutine => (
                        <label
                          key={glutine.id}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.selectedAllergens.includes(glutine.id)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-200 text-gray-600'
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.selectedAllergens.includes(glutine.id)}
                            onChange={(e) => {
                              const newSelected = e.target.checked
                                ? [...formData.selectedAllergens, glutine.id]
                                : formData.selectedAllergens.filter(id => id !== glutine.id);
                              setFormData({ ...formData, selectedAllergens: newSelected });
                            }}
                          />
                          <span className="text-2xl mb-1">{glutine.icon}</span>
                          <span className="text-xs font-bold text-center leading-tight">Contiene Glutine</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Caratteristiche */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Caratteristiche
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Fatto in casa */}
                      <label className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.isHomemade ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.isHomemade}
                          onChange={(e) => setFormData({ ...formData, isHomemade: e.target.checked })}
                        />
                        <span className="text-2xl mb-1">🏠</span>
                        <span className="text-xs font-bold">Fatto in casa</span>
                      </label>

                      {/* Surgelato */}
                      <label className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.isFrozen ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={formData.isFrozen}
                          onChange={(e) => setFormData({ ...formData, isFrozen: e.target.checked })}
                        />
                        <span className="text-2xl mb-1">❄️</span>
                        <span className="text-xs font-bold">Surgelato</span>
                      </label>
                    </div>
                  </div>

                  {/* Allergens Section */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Allergeni Presenti
                    </label>
                    <p className="text-xs text-gray-500 mb-3">Seleziona gli allergeni da segnalare obbligatoriamente se presenti nel piatto.</p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {allergens.filter(a => a.id !== 'glutine').map((allergen) => (
                        <label
                          key={allergen.id}
                          className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all h-24 ${formData.selectedAllergens.includes(allergen.id)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-200 text-gray-600'
                            }`}
                          title={allergen.name}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={formData.selectedAllergens.includes(allergen.id)}
                            onChange={(e) => {
                              const newSelected = e.target.checked
                                ? [...formData.selectedAllergens, allergen.id]
                                : formData.selectedAllergens.filter(id => id !== allergen.id);
                              setFormData({ ...formData, selectedAllergens: newSelected });
                            }}
                          />
                          <span className="text-2xl mb-1">{allergen.icon}</span>
                          <span className="text-[10px] font-bold text-center leading-tight line-clamp-2">{allergen.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                  >
                    {editingDish ? 'Salva Modifiche' : 'Crea Piatto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Dishes List */}
      {
        filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <span className="text-6xl mb-4 block">🍽️</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun piatto</h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === 'all'
                ? 'Inizia creando il tuo primo piatto'
                : 'Nessun piatto in questa categoria'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Crea Primo Piatto</span>
            </button>
          </div>
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
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      }
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
    </div >
  );
}
