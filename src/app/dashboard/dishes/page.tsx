'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Dish {
  id: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  price: number;
  category_id: string;
  image_url?: string;
  is_visible: boolean;
  is_seasonal: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
}

interface Category {
  id: string;
  name: { it: string; en: string };
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    nameIt: '',
    nameEn: '',
    descriptionIt: '',
    descriptionEn: '',
    price: '',
    categoryId: '',
    slug: '',
    isVisible: true,
    isSeasonal: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });

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
      setTenantId(tenant.id);

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .order('display_order');

      setCategories(categoriesData || []);

      // Load dishes
      const { data: dishesData } = await supabase
        .from('dishes')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('display_order');

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!tenantId || !formData.categoryId) {
      alert('Seleziona una categoria');
      return;
    }

    try {
      const supabase = createClient();

      const dishData = {
        tenant_id: tenantId,
        category_id: formData.categoryId,
        name: { it: formData.nameIt, en: formData.nameEn },
        description: { it: formData.descriptionIt, en: formData.descriptionEn },
        price: parseFloat(formData.price),
        slug: formData.slug || generateSlug(formData.nameIt),
        is_visible: formData.isVisible,
        is_seasonal: formData.isSeasonal,
        is_vegetarian: formData.isVegetarian,
        is_vegan: formData.isVegan,
        is_gluten_free: formData.isGlutenFree,
        display_order: dishes.length,
      };

      if (editingDish) {
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
          .eq('id', editingDish.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dishes')
          .insert([dishData]);

        if (error) throw error;
      }

      resetForm();
      loadData();
    } catch (err: any) {
      console.error('Error saving dish:', err);
      alert(err.message || 'Errore nel salvataggio del piatto');
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

      if (error) throw error;
      loadData();
    } catch (err) {
      console.error('Error deleting dish:', err);
      alert('Errore durante l\'eliminazione del piatto');
    }
  }

  function handleEdit(dish: Dish) {
    setEditingDish(dish);
    setFormData({
      nameIt: dish.name.it,
      nameEn: dish.name.en,
      descriptionIt: dish.description.it,
      descriptionEn: dish.description.en,
      price: dish.price.toString(),
      categoryId: dish.category_id,
      slug: '',
      isVisible: dish.is_visible,
      isSeasonal: dish.is_seasonal,
      isVegetarian: dish.is_vegetarian,
      isVegan: dish.is_vegan,
      isGlutenFree: dish.is_gluten_free,
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      nameIt: '',
      nameEn: '',
      descriptionIt: '',
      descriptionEn: '',
      price: '',
      categoryId: '',
      slug: '',
      isVisible: true,
      isSeasonal: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
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
        <p className="text-gray-600 mb-6">
          Prima di aggiungere piatti, devi creare almeno una categoria
        </p>
        <a
          href="/dashboard/categories"
          className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Vai alle Categorie
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Piatti Menu 🍽️
          </h1>
          <p className="text-gray-600">
            Gestisci i piatti del tuo menu digitale
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuovo Piatto</span>
        </button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
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
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name.it} ({dishes.filter(d => d.category_id === cat.id).length})
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
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
                      {cat.name.it}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Nome IT */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome (Italiano) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameIt}
                    onChange={(e) => setFormData({ ...formData, nameIt: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="es. Carbonara"
                  />
                </div>

                {/* Nome EN */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nome (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder="e.g. Carbonara"
                  />
                </div>
              </div>

              {/* Descrizione IT */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descrizione (Italiano) *
                </label>
                <textarea
                  required
                  value={formData.descriptionIt}
                  onChange={(e) => setFormData({ ...formData, descriptionIt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  placeholder="Descrivi il piatto..."
                />
              </div>

              {/* Descrizione EN */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descrizione (English) *
                </label>
                <textarea
                  required
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  placeholder="Describe the dish..."
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

              {/* Flags */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                  Caratteristiche
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">👁️ Visibile</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSeasonal}
                      onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">🍂 Stagionale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">🥬 Vegetariano</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">🌱 Vegano</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGlutenFree}
                      onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm">🌾 Senza Glutine</span>
                  </label>
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
      )}

      {/* Dishes List */}
      {filteredDishes.length === 0 ? (
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
        <div className="grid gap-4">
          {filteredDishes.map((dish) => {
            const category = categories.find(c => c.id === dish.category_id);
            return (
              <div
                key={dish.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {dish.name.it}
                      </h3>
                      {!dish.is_visible && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                          NASCOSTO
                        </span>
                      )}
                      {dish.is_seasonal && (
                        <span className="text-lg" title="Stagionale">🍂</span>
                      )}
                      {dish.is_vegetarian && (
                        <span className="text-lg" title="Vegetariano">🥬</span>
                      )}
                      {dish.is_vegan && (
                        <span className="text-lg" title="Vegano">🌱</span>
                      )}
                      {dish.is_gluten_free && (
                        <span className="text-lg" title="Senza Glutine">🌾</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {dish.description.it}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-orange-600">€{dish.price.toFixed(2)}</span>
                      {category && (
                        <span className="text-gray-500">• {category.name.it}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(dish)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifica"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Elimina"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
