'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';
import { OnboardingWizard } from '@/components/onboarding/wizard/OnboardingWizard';
import { FooterData } from '@/types/menu';
import { useTenant, useUpdateTenant } from '@/hooks/useTenant';

type SubscriptionTier = 'free' | 'basic' | 'premium';

// Define types locally if not imported
interface TenantData {
  restaurant_name: string;
  slug: string | null;
  theme: string;
  primary_color: string;
  secondary_color?: string;
  font: string;
  logo_url?: string;
  footer_data?: any; // Relaxing type to avoid mismatch with FooterData
  subscription_tier?: string;
  contact_email?: string;
  theme_options?: any;
  cover_charge?: number;
  tagline?: string;
  onboarding_step?: number;
  onboarding_completed?: boolean;
}

// ... (imports remain)
import { Suspense } from 'react';

// ... (type definitions remain)

function OnboardingContent() {
  const router = useRouter();
  const { data: tenant, isLoading } = useTenant();
  const updateTenantMutation = useUpdateTenant();

  const handleUpdate = async (data: any, nextStep?: number) => {
    if (!tenant?.id) return false;
    try {
      await updateTenantMutation.mutateAsync({
        id: tenant.id,
        updates: data,
        nextStep
      });

      // Handle redirect if needed (mutation usually handles toast)
      // Check nextStep condition again strictly if needed, but mutation logic handles 'onboarding_completed'
      if ((nextStep || (data.onboarding_step || 1)) > 5) {
        router.push('/dashboard');
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Effect to redirect if already completed (redundant check if API returns it, but safe)
  useEffect(() => {
    if (tenant?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [tenant, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-roma-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // If no tenant found (and creation failed inside hook? hook throws error usually), show check
  // Hook handles auto-creation, so tenant should exist if !isLoading and !error.
  // We can assume tenant is present.

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {tenant && (
        <OnboardingWizard
          initialData={tenant}
          tenantId={tenant.id}
          currentStepProp={Math.min(tenant.onboarding_step || 1, 5)}
          onUpdate={handleUpdate}
          onExit={handleLogout}
        />
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
