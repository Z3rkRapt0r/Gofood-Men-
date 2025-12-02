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
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import type { Tenant, CategoryDB, DishDB, AllergenDB } from '@/types/menu';

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const transformedCategories = categories?.map((cat: any) => ({
    id: cat.slug,
    name: cat.name,
    dishes: cat.dishes
      ?.filter((dish: any) => dish.is_visible)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((dish: any) => ({
        id: dish.slug,
        name: dish.name,
        description: dish.description,
        price: dish.price.toFixed(2),
        image: dish.image_url || '/icon.svg',
        allergens: dish.dish_allergens?.map((da: any) => da.allergen.id) || []
      })) || []
  })) || [];

  return {
    tenant: tenant as Tenant,
    categories: transformedCategories
  };
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);

  if (!menuData) {
    notFound();
  }

  const { tenant, categories } = menuData;

  return (
    <div
      className="min-h-screen bg-cream"
      style={{
        // CSS variables per theming dinamico
        '--tenant-primary': tenant.primary_color,
        '--tenant-secondary': tenant.secondary_color,
      } as React.CSSProperties}
    >
      <Header
        restaurantName={tenant.restaurant_name}
        logoUrl={tenant.logo_url || undefined}
      />

      <CategoryNav categories={categories} />

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            {tenant.restaurant_name}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Autentica cucina romana nel cuore della città
          </p>
        </div>
      </section>

      {/* Menu Sections */}
      <main className="container mx-auto px-4 py-8">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="mb-16 scroll-mt-32"
          >
            {/* Category Title */}
            <div className="text-center mb-8">
              <div className="inline-block">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-roma-red mb-2">
                  {category.name.it}
                </h2>
                <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
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
