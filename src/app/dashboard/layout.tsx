'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data: tenantData, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error || !tenantData) {
          router.push('/onboarding');
          return;
        }

        const tenant = tenantData as Tenant;

        if (!tenant.onboarding_completed) {
          router.push('/onboarding');
          return;
        }

        setTenant(tenant);
      } catch (err) {
        console.error('Error loading tenant:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Categorie', href: '/dashboard/categories', icon: '📁' },
    { name: 'Piatti', href: '/dashboard/dishes', icon: '🍽️' },
    { name: 'Impostazioni', href: '/dashboard/settings', icon: '⚙️' },
    { name: 'Assistenza', href: '/dashboard/support', icon: '🆘' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-6 border-b border-gray-200 relative">
          <div className="flex items-center gap-3">
            <img
              src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/gofood-logoHD.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL2dvZm9vZC1sb2dvSEQuc3ZnIiwiaWF0IjoxNzY0Nzk5OTg0LCJleHAiOjIwODAxNTk5ODR9.u0xvBk9SohQ53303twe_gKZ87_Bj2ga3dD1HauBaevk"
              alt="GO! FOOD"
              className="h-10 w-auto object-contain border-2 border-orange-200 bg-white p-1 rounded-lg"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Restaurant info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.restaurant_name}
                className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-white p-1"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200 shrink-0">
                {tenant.restaurant_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{tenant.restaurant_name}</h3>
              <p className="text-xs text-gray-500 truncate">/{tenant.slug}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors font-semibold"
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Vedi menu pubblico</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700 hover:text-orange-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">Piano:</span>
              <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">
                {tenant.subscription_tier}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
