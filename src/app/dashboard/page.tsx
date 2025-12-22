'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCodeCard from '@/components/dashboard/QRCodeCard';
import ActivationModal from '@/components/dashboard/ActivationModal';
import { toast } from 'sonner';

import MenuImportModal from '@/components/dashboard/MenuImportModal';
import { useTenant, useUpdateTenant } from '@/hooks/useTenant';
import { useCategories, useDishes } from '@/hooks/useMenu';

interface Stats {
  totalDishes: number;
  totalCategories: number;
  visibleDishes: number;
}

export default function DashboardOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandledPayment = useRef(false);

  const { data: tenant, isLoading: isTenantLoading } = useTenant();
  const { mutateAsync: updateTenant } = useUpdateTenant();

  // Fetch categories and dishes using hooks - cached and efficient
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories(tenant?.id);
  const { data: dishes = [], isLoading: isDishesLoading } = useDishes(tenant?.id);

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Derived state
  const loading = isTenantLoading || isCategoriesLoading || isDishesLoading;

  const stats: Stats = useMemo(() => {
    return {
      totalCategories: categories.length,
      totalDishes: dishes.length,
      visibleDishes: dishes.filter(d => d.is_visible).length
    };
  }, [categories, dishes]);

  // Handle payment success from Stripe
  useEffect(() => {
    if (searchParams.get('payment') === 'success' && tenant && !hasHandledPayment.current) {
      const activateSubscription = async () => {
        try {
          console.log('Payment successful! Activating subscription...');
          const newSlug = searchParams.get('new_slug');

          const updateData: any = {
            subscription_status: 'active',
            subscription_tier: 'premium'
          };

          if (newSlug) {
            updateData.slug = newSlug;
          }

          await updateTenant({
            id: tenant.id,
            updates: updateData
          });

          // Custom toast and reload handled below, suppressing hook success toast in mind or letting it be
          // Actually hook has toast too. 
          toast.success('Abbonamento attivato con successo!');

          // Clean URL immediately to prevent loop
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);

          // Mark payment as handled
          hasHandledPayment.current = true;

          // Force hard refresh removed as per user request
          // window.location.reload();

        } catch (err) {
          console.error('Error activating subscription:', err);
          toast.error('Errore durante l\'attivazione. Contatta l\'assistenza se persiste.');
        }
      };

      activateSubscription();
    }
  }, [searchParams, tenant, updateTenant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback if tenant is null (layout should handle this but just in case)
  if (!tenant) return null;

  const isFreeTier = tenant.subscription_tier === 'free';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        restaurantName={tenant.restaurant_name}
      />

      <MenuImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          toast.success('Piatti importati con successo!');
          // Query invalidation is automatic via mutation hooks in MenuImportModal (if refactored)
          // Ideally MenuImportModal should trigger invalidation. 
          // If it uses manual supabase, we might need manual invalidation or reload.
          // For now, reload is safe as import is a heavy operation.
          window.location.reload();
        }}
        tenantId={tenant.id}
        categories={categories}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2">
            Benvenuto! 👋
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Ecco una panoramica del tuo menu digitale
          </p>
        </div>
        <div className="self-start md:self-center">
          <span className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider ${isFreeTier ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
            {isFreeTier ? 'Piano Gratuito' : 'Premium Attivo'}
          </span>
        </div>
      </div>

      {isFreeTier && (
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-orange-200 shrink-0">
              🚀
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Il tuo menu è pronto!</h3>
              <p className="text-gray-600 text-sm md:text-base">Attiva il piano Premium per pubblicare il menu e ottenere il QR Code.</p>
            </div>
          </div>
          <button
            onClick={() => setShowActivationModal(true)}
            className="w-full md:w-auto whitespace-nowrap bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Attiva Ora
          </button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
        <div className="cursor-pointer" onClick={() => (isFreeTier || !tenant.slug) && setShowActivationModal(true)}>
          <QRCodeCard
            slug={tenant.slug}
            restaurantName={tenant.restaurant_name}
            logoUrl={tenant.logo_url || ''}
            tenantId={tenant.id}
            isLocked={isFreeTier}
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Azioni Rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* AI Import Card */}
          <div
            onClick={() => {
              if (stats.totalCategories > 0) {
                setShowImportModal(true);
              } else {
                toast.error('Devi creare almeno una categoria prima di importare i piatti!');
              }
            }}
            className="cursor-pointer"
          >
            <ActionCard
              title="Importa con AI ✨"
              description="Carica una foto del menu cartaceo"
              icon="🤖"
              href="#"
              color="orange"
              preventLink
            />
          </div>

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

        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xl md:text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">Suggerimenti</h3>
            <ul className="space-y-2 text-xs md:text-sm text-gray-700">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
          {isLink ? (
            <Link href={`/${value}`} target="_blank" className="text-orange-600 hover:text-orange-700 text-lg">
              /{value}
            </Link>
          ) : (
            value
          )}
        </div>
        <div className="text-xs md:text-sm text-gray-600 font-semibold">{title}</div>
      </div>
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
  disabled,
  preventLink
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  external?: boolean;
  disabled?: boolean;
  preventLink?: boolean;
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
        <span className="text-2xl md:text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors text-sm md:text-base">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (disabled || preventLink) {
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


