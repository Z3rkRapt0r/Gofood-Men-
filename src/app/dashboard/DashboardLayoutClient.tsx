'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import SubscriptionBanner from '@/components/dashboard/SubscriptionBanner';
import ActivationModal from '@/components/dashboard/ActivationModal';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/hooks/useTenant';

// Logic to handle Android Back Button for Sidebar
function SidebarBackButtonHandler() {
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const isClosingByBack = useRef(false);
  const wasOpen = useRef(openMobile);
  const openPathname = useRef(pathname);

  // 1. Close sidebar on route change (navigation)
  useEffect(() => {
    if (openMobile && pathname !== openPathname.current) {
      setOpenMobile(false);
    }
  }, [pathname, openMobile, setOpenMobile]);

  // 2. Handle PopState (Hardware Back Button)
  useEffect(() => {
    const handlePopState = () => {
      if (openMobile) {
        isClosingByBack.current = true;
        setOpenMobile(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openMobile, setOpenMobile]);

  // 3. Manage History State
  useEffect(() => {
    if (openMobile && !wasOpen.current) {
      // Closed -> Open: Push state and capture current path
      window.history.pushState(null, '', window.location.pathname);
      isClosingByBack.current = false;
      openPathname.current = pathname;
    } else if (!openMobile && wasOpen.current) {
      // Open -> Closed
      // Only go back if:
      // a) Not closed by Back button (isClosingByBack)
      // b) Pathname hasn't changed (if it changed, it's a navigation, so DON'T go back)
      if (!isClosingByBack.current && pathname === openPathname.current) {
        // Closed by UI (X or Backdrop) on the SAME page -> Keep history consistent
        window.history.back();
      }
      isClosingByBack.current = false;
    }
    wasOpen.current = openMobile;
  }, [openMobile, pathname]); // Depend on pathname to ensure correct logic

  return null;
}

// Helper to get page title based on path
function getPageTitle(pathname: string): string {
  if (pathname.includes('/dashboard/categories')) return 'Categorie';
  if (pathname.includes('/dashboard/dishes')) return 'Piatti';
  if (pathname.includes('/dashboard/media')) return 'Immagini';
  if (pathname.includes('/dashboard/allergens')) return 'Allergeni';
  if (pathname.includes('/dashboard/design-studio')) return 'Design Studio';
  if (pathname.includes('/dashboard/support')) return 'Assistenza';
  if (pathname.includes('/dashboard/account')) return 'Account';
  return 'Dashboard';
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: tenant, isLoading, error } = useTenant();
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error('Error loading tenant:', error);
        router.push('/login');
        return;
      }

      if (tenant) {
        if (!tenant.onboarding_completed) {
          router.push('/onboarding');
        } else {
          // 1. DYNAMIC TITLE: Set title to include Page Name and Restaurant Name
          const pageTitle = getPageTitle(pathname);
          document.title = `${pageTitle} - ${tenant.restaurant_name}`;

          // 2. TAWK.TO IDENTIFICATION: Identify the user
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((window as any).Tawk_API) {
            // We use a small timeout to ensure Tawk is loaded or try/catch around it
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).Tawk_API.setAttributes({
                name: tenant.restaurant_name,
                email: tenant?.owner_id ? `${tenant.slug || 'owner'}@gofood-menu.com` : undefined,
                restaurant: tenant.restaurant_name
              }, function (error: any) { });
            } catch (e) {
              console.log("Tawk identification error", e);
            }
          }
        }
      } else if (!tenant && !error) {
        router.push('/login');
      }
    }
  }, [tenant, isLoading, error, router, pathname]);

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
      <SidebarBackButtonHandler />
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
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {tenant.subscription_status === 'trialing' && <SubscriptionBanner />}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
