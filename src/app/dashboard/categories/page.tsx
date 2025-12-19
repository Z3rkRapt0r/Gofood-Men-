'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
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
import { GripVertical, Folder, Plus, Trash2, Edit, Loader2 } from 'lucide-react';

// Shadcn Imports
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

// Sortable Item Component
function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
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
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'shadow-xl ring-2 ring-orange-500' : 'hover:shadow-md'}`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Drag Handle & Content Wrapper */}
          <div className="flex items-start gap-4 flex-1 w-full sm:w-auto">
            {/* Drag Handle Icon */}
            <div
              {...attributes}
              {...listeners}
              className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 touch-none"
              title="Sposta"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {category.name}
                </h3>
                {!category.is_visible && (
                  <Badge variant="secondary" className="uppercase text-[10px] sm:text-xs">
                    Nascosta
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-1">
                  {category.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground font-mono">/{category.slug}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:border-t-0 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="flex-1 sm:flex-none w-full justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              <Edit className="w-4 h-4" />
              <span className="sm:hidden">Modifica</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
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



export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [tenantId, setTenantId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    isVisible: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
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

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update display_order in DB
        // We do this optimistically (UI updates instantly, DB updates in background)
        updateCategoriesOrder(newItems);

        return newItems;
      });
    }
  }

  async function updateCategoriesOrder(items: Category[]) {
    try {
      const supabase = createClient();
      // We explicitly cast to avoid TS issues with implied types
      const upsertData = items.map((item, index) => ({
        id: item.id,
        tenant_id: item.tenant_id, // Ensure this is present
        name: item.name,
        slug: item.slug,
        display_order: index,
        updated_at: new Date().toISOString(),
        is_visible: item.is_visible,
        description: item.description
      })) as CategoryInsert[];

      const { error } = await supabase
        .from('categories')
        // @ts-ignore
        .upsert(upsertData, { onConflict: 'id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Errore nel salvataggio dell\'ordine');
      loadCategories(); // Revert on error
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!tenantId) return;

    try {
      const supabase = createClient();

      if (editingCategory) {
        // Update
        const updateData: CategoryUpdate = {
          tenant_id: tenantId,
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description || null,
          is_visible: true, // Always visible
        };

        const { error } = await supabase
          .from('categories')
          // @ts-ignore
          .update(updateData)
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        // Create
        const insertData: CategoryInsert = {
          tenant_id: tenantId,
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          description: formData.description || null,
          is_visible: true, // Always visible
          display_order: categories.length,
        };

        const { error } = await supabase
          .from('categories')
          // @ts-ignore
          .insert(insertData); // Pass single object, not array, or array of 1

        if (error) throw error;
      }

      setFormData({
        name: '',
        description: '',
        slug: '',
        isVisible: true,
      });
      setShowForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(
        err instanceof Error
          ? err.message
          : 'Errore nel salvataggio della categoria'
      );
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        'Sei sicuro di voler eliminare questa categoria? Verranno eliminati anche tutti i piatti associati.'
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Errore durante l\'eliminazione della categoria');
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      isVisible: category.is_visible,
    });
    setShowForm(true);
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Categorie Menu 📁
          </h1>
          <p className="text-muted-foreground">
            Gestisci le categorie del tuo menu digitale
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <Button
            onClick={() => {
              setEditingCategory(null);
              setFormData({
                name: '',
                description: '',
                slug: '',
                isVisible: true,
              });
              setShowForm(true);
            }}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 shadow-lg hover:shadow-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuova Categoria
          </Button>
        </div>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-6xl mb-4">📁</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nessuna categoria
            </h3>
            <p className="text-muted-foreground mb-6">
              Inizia creando la tua prima categoria per organizzare il menu
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0 shadow-lg hover:shadow-xl font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crea Prima Categoria
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
            items={categories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Modifica Categoria' : 'Nuova Categoria'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (!editingCategory) {
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                placeholder="es. Antipasti"
              />
            </div>

            {/* Descrizione */}
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="es. I nostri deliziosi antipasti"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annulla
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
              >
                {editingCategory ? 'Salva Modifiche' : 'Crea Categoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
