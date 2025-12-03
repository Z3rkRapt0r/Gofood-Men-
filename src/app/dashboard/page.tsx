'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  totalDishes: number;
  totalCategories: number;
  visibleDishes: number;
  maxDishes: number;
  maxCategories: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalDishes: 0,
    totalCategories: 0,
    visibleDishes: 0,
    maxDishes: 50,
    maxCategories: 10,
  });
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Get tenant info
        const { data: tenant } = await supabase
          .from('tenants')
          .select('restaurant_name, slug, max_dishes, max_categories')
          .eq('owner_id', user.id)
          .single();

        if (tenant) {
          setRestaurantName(tenant.restaurant_name);
          setSlug(tenant.slug);
          setStats(prev => ({
            ...prev,
            maxDishes: tenant.max_dishes,
            maxCategories: tenant.max_categories,
          }));
        }

        // Get categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant?.id || '');

        // Get dishes count
        const { count: dishesCount } = await supabase
          .from('dishes')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant?.id || '');

        // Get visible dishes count
        const { count: visibleCount } = await supabase
          .from('dishes')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenant?.id || '')
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

  const dishesPercentage = (stats.totalDishes / stats.maxDishes) * 100;
  const categoriesPercentage = (stats.totalCategories / stats.maxCategories) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Benvenuto! 👋
        </h1>
        <p className="text-gray-600">
          Ecco una panoramica del tuo menu digitale
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Piatti Totali"
          value={stats.totalDishes}
          max={stats.maxDishes}
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
          max={stats.maxCategories}
          icon="📁"
          color="blue"
        />
        <StatCard
          title="Menu Pubblico"
          value={slug}
          icon="🔗"
          color="purple"
          isLink
        />
      </div>

      {/* Usage bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard
          title="Utilizzo Piatti"
          current={stats.totalDishes}
          max={stats.maxDishes}
          percentage={dishesPercentage}
        />
        <UsageCard
          title="Utilizzo Categorie"
          current={stats.totalCategories}
          max={stats.maxCategories}
          percentage={categoriesPercentage}
        />
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
          <ActionCard
            title="Vedi Menu Pubblico"
            description="Visualizza come lo vedono i clienti"
            icon="👀"
            href={`/${slug}`}
            color="green"
            external
          />
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
                <span>Usa descrizioni accattivanti per far venire l'acquolina in bocca</span>
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
  max,
  icon,
  color,
  isLink,
}: {
  title: string;
  value: number | string;
  max?: number;
  icon: string;
  color: string;
  isLink?: boolean;
}) {
  const colors = {
    orange: 'from-orange-500 to-amber-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {max && (
          <span className="text-xs text-gray-500 font-semibold">
            max {max}
          </span>
        )}
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

function UsageCard({
  title,
  current,
  max,
  percentage,
}: {
  title: string;
  current: number;
  max: number;
  percentage: number;
}) {
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-600 font-semibold">
          {current}/{max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {percentage >= 90 ? '⚠️ Limite quasi raggiunto' : `${(100 - percentage).toFixed(0)}% disponibile`}
      </p>
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
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  external?: boolean;
}) {
  const colors = {
    orange: 'hover:border-orange-300 hover:bg-orange-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    green: 'hover:border-green-300 hover:bg-green-50',
  };

  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className={`border-2 border-gray-200 rounded-xl p-4 transition-all ${colors[color as keyof typeof colors]} group`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
