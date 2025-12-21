'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SubscriptionBanner from '@/components/dashboard/SubscriptionBanner';
import ActivationModal from '@/components/dashboard/ActivationModal';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/hooks/useTenant';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: tenant, isLoading, error } = useTenant();
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error('Error loading tenant:', error);
        // If error is authentication related, redirect to login, otherwise maybe onboarding or error page
        // For now, assuming most errors here mean strictly "User not authenticated" or DB fail
        router.push('/login');
        return;
      }

      if (tenant) {
        if (!tenant.onboarding_completed) {
          router.push('/onboarding');
        }
      } else if (!tenant && !error) {
        // Should technically be covered by error or tenant creation logic in useTenant
        // But if we get here, it's safe to push to onboarding or login
        router.push('/login');
      }
    }
  }, [tenant, isLoading, error, router]);

  if (isLoading) {
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

  const isFreeTier = tenant.subscription_tier === 'free';
  const isLocked = isFreeTier || !tenant.slug;

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50">
        <ActivationModal
          isOpen={showActivationModal}
          onClose={() => setShowActivationModal(false)}
          restaurantName={tenant.restaurant_name}
        />

        <AppSidebar tenant={tenant} />

        <SidebarInset className="flex w-full flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {/* Breadcrumb replacement or just generic title? */}
                {/* Leaving blank for now to match previous minimalism, or we could add a title */}
              </div>

              <div className="flex items-center gap-3 md:gap-4">
                {/* View Public Menu Button */}
                {!isLocked ? (
                  <Link
                    href={`/${tenant.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow group whitespace-nowrap"
                  >
                    <span>Vedi Menu</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowActivationModal(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-400 border border-gray-200 rounded-full text-sm font-bold cursor-not-allowed whitespace-nowrap"
                    title="Attiva l'abbonamento per vedere il menu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Menu Bloccato</span>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-2 lg:p-4 overflow-y-auto">
            {tenant.subscription_status === 'trialing' && <SubscriptionBanner />}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
