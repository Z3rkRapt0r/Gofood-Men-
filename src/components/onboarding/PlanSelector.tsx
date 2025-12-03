type SubscriptionTier = 'free' | 'basic' | 'premium';

interface PlanSelectorProps {
  selectedPlan: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
  onNext: () => void;
}

export default function PlanSelector({ selectedPlan, onSelectPlan, onNext }: PlanSelectorProps) {
  const plans = [
    {
      id: 'premium' as SubscriptionTier,
      name: 'Pro',
      price: '€19.90',
      priceDetail: 'al mese',
      color: 'border-orange-500',
      features: [
        'Piatti illimitati',
        'Categorie illimitate',
        'Menu multilingua (IT, EN)',
        'Gestione allergeni EU',
        'Logo personalizzato',
        'Colori personalizzati',
        'QR Code dedicato',
        'Supporto prioritario'
      ],
      limitations: [],
      recommended: true
    }
  ];

  // Auto-select the only plan
  if (selectedPlan !== 'premium') {
    onSelectPlan('premium');
  }

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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-bold mb-1">
              Garanzia soddisfatti o rimborsati
            </p>
            <p className="text-sm text-blue-700">
              Puoi disdire l&apos;abbonamento in qualsiasi momento con un click.
            </p>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="max-w-md mx-auto">
        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Attiva Abbonamento</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        <p className="text-xs text-center text-gray-500 mt-4">
          Cliccando su &quot;Attiva Abbonamento&quot; verrai reindirizzato al pagamento sicuro (Prossimamente)
        </p>
      </div>
    </div>
  );
}
