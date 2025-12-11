'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import QRCodeCard from '@/components/dashboard/QRCodeCard';
import ActivationModal from '@/components/dashboard/ActivationModal';

interface Stats {
  totalDishes: number;
  totalCategories: number;
  visibleDishes: number;
}

export default function DashboardOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tenantId, setTenantId] = useState<string>('');

  const [stats, setStats] = useState<Stats>({
    totalDishes: 0,
    totalCategories: 0,
    visibleDishes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isFreeTier, setIsFreeTier] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Handle payment success from Stripe
  useEffect(() => {
    if (searchParams.get('payment') === 'success' && tenantId) {
      const activateSubscription = async () => {
        try {
          console.log('Payment successful! Activating subscription...');
          const supabase = createClient();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('tenants') as any)
            .update({
              subscription_status: 'active',
              subscription_tier: 'premium'
            })
            .eq('id', tenantId);

          // Clean URL immediately to prevent loop
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);

          // Force server data refresh
          router.refresh();

          // Update local state to remove banner immediately
          setIsFreeTier(false);
        } catch (err) {
          console.error('Error activating subscription:', err);
        }
      };
      activateSubscription();
    }
  }, [searchParams, tenantId, router]);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log('No user found in Dashboard loadStats');
          return;
        }

        console.log('Fetching tenant for user:', user.id);

        // Get tenant info
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id, restaurant_name, slug, logo_url, max_dishes, max_categories, subscription_tier')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          throw tenantError;
        }

        if (!tenant) {
          console.error('No tenant found for user:', user.id);
        }

        let currentTenantId = '';

        if (tenant) {
          console.log('Tenant found:', tenant);
          const tenantData = tenant as {
            id: string;
            restaurant_name: string;
            slug: string;
            logo_url: string;
            max_dishes: number;
            max_categories: number;
            subscription_tier: string;
          };
          currentTenantId = tenantData.id;
          setRestaurantName(tenantData.restaurant_name);
          setSlug(tenantData.slug);
          setLogoUrl(tenantData.logo_url);
          setTenantId(tenantData.id);
          setIsFreeTier(tenantData.subscription_tier === 'free');
        }

        // Get categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenantId);

        // Get dishes count
        const { count: dishesCount } = await supabase
          .from('dishes')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenantId);

        // Get visible dishes count
        const { count: visibleCount } = await supabase
          .from('dishes')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', currentTenantId)
          .eq('is_visible', true);

        setStats(prev => ({
          ...prev,
          totalCategories: categoriesCount || 0,
          totalDishes: dishesCount || 0,
          visibleDishes: visibleCount || 0,
        }));
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        restaurantName={restaurantName}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Benvenuto! 👋
        </h1>
        <p className="text-gray-600">
          Ecco una panoramica del tuo menu digitale
        </p>
      </div>

      {isFreeTier && (
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-orange-200">
              🚀
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Il tuo menu è pronto!</h3>
              <p className="text-gray-600">Attiva il piano Premium per pubblicare il menu e ottenere il QR Code.</p>
            </div>
          </div>
          <button
            onClick={() => setShowActivationModal(true)}
            className="whitespace-nowrap bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Attiva Ora
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Piatti Totali"
          value={stats.totalDishes}
          icon="🍽️"
          color="orange"
        />
        <StatCard
          title="Piatti Visibili"
          value={stats.visibleDishes}
          icon="👁️"
          color="green"
        />
        <StatCard
          title="Categorie"
          value={stats.totalCategories}
          icon="📁"
          color="blue"
        />
        <div className="cursor-pointer" onClick={() => isFreeTier && setShowActivationModal(true)}>
          <QRCodeCard
            slug={isFreeTier ? 'locked' : slug}
            restaurantName={restaurantName}
            logoUrl={logoUrl}
            tenantId={tenantId}
            isLocked={isFreeTier}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Aggiungi Piatto"
            description="Crea un nuovo piatto nel menu"
            icon="➕"
            href="/dashboard/dishes"
            color="orange"
          />
          <ActionCard
            title="Gestisci Categorie"
            description="Organizza le categorie del menu"
            icon="📁"
            href="/dashboard/categories"
            color="blue"
          />
          <div onClick={(e) => {
            if (isFreeTier) {
              e.preventDefault();
              setShowActivationModal(true);
            }
          }}>
            <ActionCard
              title="Vedi Menu Pubblico"
              description="Visualizza come lo vedono i clienti"
              icon={isFreeTier ? "🔒" : "👀"}
              href={isFreeTier ? '#' : `/${slug}`}
              color={isFreeTier ? "gray" : "green"}
              external
              disabled={isFreeTier}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Suggerimenti</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Aggiungi foto di alta qualità ai tuoi piatti per renderli più appetitosi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Specifica sempre gli allergeni per conformità EU e sicurezza clienti</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Usa descrizioni accattivanti per far venire l&apos;acquolina in bocca</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  isLink,
}: {
  title: string;
  value: number | string;
  max?: number;
  icon: string;
  color: string;
  isLink?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>

      </div>
      <div className="mb-1">
        <div className="text-3xl font-black text-gray-900">
          {isLink ? (
            <Link href={`/${value}`} target="_blank" className="text-orange-600 hover:text-orange-700 text-lg">
              /{value}
            </Link>
          ) : (
            value
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600 font-semibold">{title}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
  color,
  external,
  disabled
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  external?: boolean;
  disabled?: boolean;
}) {
  const colors = {
    orange: 'hover:border-orange-300 hover:bg-orange-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    green: 'hover:border-green-300 hover:bg-green-50',
    gray: 'hover:border-gray-300 hover:bg-gray-50 opacity-75',
  };

  const CardContent = (
    <div className={`border-2 border-gray-200 rounded-xl p-4 transition-all ${colors[color as keyof typeof colors]} group h-full ${disabled ? 'cursor-not-allowed' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return CardContent;
  }

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="block h-full"
    >
      {CardContent}
    </Link>
  );
}
