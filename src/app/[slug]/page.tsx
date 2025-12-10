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
  name: string;
  description?: string;
  dishes?: DbDish[];
}

interface DbDish {
  slug: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_visible: boolean;
  is_seasonal: boolean;
  display_order: number;
  allergen_ids?: string[];
}

interface DbDishAllergen {
  allergen: { id: string };
}

// Fetch menu data dal database
async function getMenuData(slug: string) {
  const supabase = await createClient();

  // 1. Fetch tenant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant, error: tenantError } = await (supabase.from('tenants') as any)
    .select('*, tenant_locations(*)')
    .eq('slug', slug)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  // Prepare Footer Data with Locations from DB (Priority: DB Locations > Legacy Fields > JSON)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbLocations = (tenant as any).tenant_locations || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedLocations = dbLocations.map((l: any) => ({
    city: l.city,
    address: l.address,
    phone: l.phone || '',
    opening_hours: l.opening_hours || ''
  }));

  // Legacy fallback removed as requested

  // Merge into footer_data
  const existingFooterData = tenant.footer_data || { links: [], socials: [], show_brand_column: true };
  const mergedFooterData = {
    ...existingFooterData,
    locations: mappedLocations.length > 0 ? mappedLocations : (existingFooterData.locations || [])
  };

  tenant.footer_data = mergedFooterData;

  const tenantData = tenant as Tenant;

  // 2. Fetch categories con piatti
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories, error: categoriesError } = await (supabase.from('categories') as any)
    .select(`
      *,
      dishes:dishes(*)
    `)
    .eq('tenant_id', tenantData.id)
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
    description: cat.description,
    dishes: cat.dishes
      ?.filter((dish) => dish.is_visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map((dish) => ({
        id: dish.slug,
        name: dish.name,
        description: dish.description,
        price: dish.price.toFixed(2),
        image: dish.image_url || '/icon.svg',
        allergens: dish.allergen_ids || [],
        is_seasonal: dish.is_seasonal,
      })) || []
  })) || [];

  // 3. Fetch Design Settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: designSettings } = await (supabase.from('tenant_design_settings') as any)
    .select('theme_config')
    .eq('tenant_id', tenantData.id)
    .single();

  return {
    tenant: tenantData,
    categories: transformedCategories,
    themeConfig: designSettings?.theme_config || null
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  if (!menuData) {
    notFound();
  }
  const { tenant, categories, themeConfig } = menuData;

  // Transform tenant to match expected interface
  const transformedTenant = {
    ...tenant,
    logo_url: tenant.logo_url || undefined,
  };

  return (
    <MenuPageClient
      tenant={transformedTenant}
      categories={categories}
      initialTheme={themeConfig}
    />
  );
}

// Metadata dinamici per SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase.from('tenants') as any)
    .select('restaurant_name')
    .eq('slug', slug)
    .single();

  if (!tenant) {
    return {
      title: 'Ristorante non trovato',
    };
  }

  const tenantData = tenant as { restaurant_name: string };

  return {
    title: `${tenantData.restaurant_name} - Menu Digitale`,
    description: `Menu completo di ${tenantData.restaurant_name}. Cucina tradizionale italiana con ingredienti freschi e genuini.`,
  };
}
