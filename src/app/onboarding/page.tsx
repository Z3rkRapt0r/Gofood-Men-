'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';
import StepIndicator from '@/components/onboarding/StepIndicator';
import PlanSelector from '@/components/onboarding/PlanSelector';
import BrandingCustomizer from '@/components/onboarding/BrandingCustomizer';
import ContactInfo from '@/components/onboarding/ContactInfo';

type SubscriptionTier = 'free' | 'basic' | 'premium';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState({
    subscription_tier: 'free' as SubscriptionTier,
    restaurant_name: '',
    slug: '',
    logo_url: null as string | null,
    primary_color: '#8B0000',
    secondary_color: '#D4AF37',
    contact_email: '',
    phone: '',
    address: '',
    city: ''
  });

  // Load tenant data
  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        let tenantData = data as Tenant | null;

        // Se il tenant non esiste, crealo (utente ha confermato email ma non ha completato registrazione)
        if (error || !data) {
          console.log('Tenant not found, creating initial tenant...');

          // Prova a recuperare il nome dal metadata dell'utente
          const restaurantName = user.user_metadata?.restaurant_name || 'Il Mio Ristorante';

          // Genera slug temporaneo
          const tempSlug = `restaurant-${user.id.substring(0, 8)}`;

          const { data: newTenant, error: createError } = await supabase
            .from('tenants')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - Supabase client type inference issue with generated Database types
            .insert({
              owner_id: user.id,
              restaurant_name: restaurantName,
              slug: tempSlug,
              onboarding_completed: false,
              onboarding_step: 1,
              subscription_tier: 'free',
              max_dishes: 9999,
              max_categories: 9999
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating tenant:', createError);
            alert('Errore durante la creazione del ristorante. Riprova.');
            router.push('/login');
            return;
          }

          tenantData = newTenant;
          console.log('✓ Tenant created successfully');
        }

        // Se onboarding già completato, vai alla dashboard
        if (tenantData && tenantData.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        if (!tenantData) return;

        setTenant(tenantData);
        setFormData({
          subscription_tier: tenantData.subscription_tier || 'free',
          restaurant_name: tenantData.restaurant_name || '',
          slug: tenantData.slug || '',
          logo_url: tenantData.logo_url || null,
          primary_color: tenantData.primary_color || '#8B0000',
          secondary_color: tenantData.secondary_color || '#D4AF37',
          contact_email: tenantData.contact_email || '',
          phone: tenantData.phone || '',
          address: tenantData.address || '',
          city: tenantData.city || ''
        });
        setCurrentStep(tenantData.onboarding_step || 2);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [router]);

  async function updateTenant(updates: Partial<typeof formData>, nextStep?: number) {
    if (!tenant) return;

    try {
      const supabase = createClient();

      const updateData: Record<string, unknown> = {
        ...updates,
        onboarding_step: nextStep || currentStep,
        onboarding_completed: nextStep === 4 // Completa se siamo allo step 4 (dopo lo step 3)
      };

      const { error } = await supabase
        .from('tenants')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - Supabase client type inference issue
        .update(updateData)
        .eq('id', tenant.id);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Error updating tenant:', err);
      return false;
    }
  }

  async function handleNext() {
    let updates: Partial<typeof formData> = {};

    // Prepara gli update in base allo step corrente
    if (currentStep === 1) {
      updates = { subscription_tier: formData.subscription_tier };
    } else if (currentStep === 2) {
      updates = {
        restaurant_name: formData.restaurant_name,
        slug: formData.slug,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color
      };
    } else if (currentStep === 3) {
      updates = {
        contact_email: formData.contact_email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      };
    }

    const success = await updateTenant(updates, currentStep + 1);

    if (success) {
      if (currentStep === 3) {
        // Onboarding completato
        router.push('/dashboard');
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  }

  function handleBack() {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-orange-100 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-gofood.png"
                alt="GO! FOOD"
                width={120}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <div className="h-6 w-px bg-orange-200" />
            <span className="font-bold text-gray-600 text-sm">Configurazione iniziale</span>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">


          {currentStep === 2 && (
            <BrandingCustomizer
              formData={formData}
              onUpdate={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <ContactInfo
              formData={formData}
              onUpdate={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
