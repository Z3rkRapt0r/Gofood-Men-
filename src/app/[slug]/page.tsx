/**
 * Menu Pubblico - Dynamic Route
 *
 * Questa pagina mostra il menu pubblico di un ristorante
 * accessibile tramite URL: /{slug-ristorante}
 *
 * Esempio: /magna-roma
 */

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Tenant } from '@/types/menu';
import MenuPageClient from './MenuPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface DbCategory {
  slug: string;
  name: { it: string; en: string };
  dishes?: DbDish[];
}

interface DbDish {
  slug: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  price: number;
  image_url?: string;
  is_visible: boolean;
  display_order: number;
  dish_allergens?: DbDishAllergen[];
}

interface DbDishAllergen {
  allergen: { id: string };
}

// Fetch menu data dal database
async function getMenuData(slug: string) {
  const supabase = await createClient();

  // 1. Fetch tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  // 2. Fetch categories con piatti e allergeni
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select(`
      *,
      dishes:dishes(
        *,
        dish_allergens(
          allergen:allergens(*)
        )
      )
    `)
    .eq('tenant_id', tenant.id)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return null;
  }

  // Transform data per compatibilità con componenti esistenti
  const transformedCategories = (categories as DbCategory[])?.map((cat) => ({
    id: cat.slug,
    name: cat.name,
    dishes: cat.dishes
      ?.filter((dish) => dish.is_visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map((dish) => ({
        id: dish.slug,
        name: dish.name,
        description: dish.description,
        price: dish.price.toFixed(2),
        image: dish.image_url || '/icon.svg',
        allergens: dish.dish_allergens?.map((da) => da.allergen.id) || []
      })) || []
  })) || [];

  return {
    tenant: tenant as Tenant,
    categories: transformedCategories
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  if (!menuData) {
    notFound();
  }
  const { tenant, categories } = menuData;
  return (
    <MenuPageClient tenant={tenant} categories={categories} />
  );
}

// Metadata dinamici per SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('restaurant_name, city')
    .eq('slug', slug)
    .single();

  if (!tenant) {
    return {
      title: 'Ristorante non trovato',
    };
  }

  return {
    title: `${tenant.restaurant_name} - Menu Digitale`,
    description: `Menu completo di ${tenant.restaurant_name}. Cucina tradizionale italiana con ingredienti freschi e genuini.`,
  };
}
