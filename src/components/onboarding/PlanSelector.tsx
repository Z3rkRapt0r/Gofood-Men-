import { useEffect } from 'react';
import type { SubscriptionTier } from '@/types/menu';

interface PlanSelectorProps {
  selectedPlan: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
  onNext: () => void;
}

interface Plan {
  id: SubscriptionTier;
  name: string;
  price: string;
  priceDetail?: string;
  features: string[];
}

export default function PlanSelector({ selectedPlan, onSelectPlan, onNext }: PlanSelectorProps) {
  const plans: Plan[] = [
    {
      id: 'premium',
      name: 'Premium',
      price: '€19,90',
      priceDetail: 'mese',
      features: ['Tutto incluso', 'Temi Personalizzati', 'Statistiche Avanzate', 'Supporto Prioritario']
    }
  ];

  // Auto-select the only plan
  useEffect(() => {
    onSelectPlan('premium');
  }, [onSelectPlan]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Scegli il piano perfetto per te
        </h2>
        <p className="text-lg text-gray-600">
          Un unico piano, tutte le funzionalità incluse. Semplice.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${selectedPlan === plan.id
              ? 'border-orange-500 ring-4 ring-orange-500 ring-opacity-20 bg-orange-50/50'
              : 'border-gray-200 hover:border-orange-300'
              }`}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                TUTTO INCLUSO
              </span>
            </div>

            {/* Selected Indicator */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Plan Header */}
            <div className="text-center mb-8 mt-4">
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-orange-600">{plan.price}</span>
                {plan.priceDetail && (
                  <span className="text-gray-500 font-medium">/{plan.priceDetail}</span>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-base">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>



      {/* Next Button */}
      <div className="max-w-md mx-auto">
        <a
          href="https://buy.stripe.com/test_9B65kD0dt3ed9FkgJcf3a00"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Attiva Abbonamento</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <p className="text-xs text-center text-gray-500 mt-4">
          Cliccando verrai reindirizzato al pagamento sicuro su Stripe.
        </p>
      </div>
    </div>
  );
}
