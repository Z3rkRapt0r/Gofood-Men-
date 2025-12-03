type SubscriptionTier = 'free' | 'basic' | 'premium';

interface PlanSelectorProps {
  selectedPlan: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
  onNext: () => void;
}

export default function PlanSelector({ selectedPlan, onSelectPlan, onNext }: PlanSelectorProps) {
  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free',
      price: 'Gratis',
      priceDetail: 'per sempre',
      color: 'border-gray-300',
      features: [
        'Fino a 50 piatti',
        'Fino a 10 categorie',
        'Menu multilingua (IT, EN)',
        'Gestione allergeni EU',
        'Logo personalizzato',
        'Colori personalizzati',
        '500 MB storage foto'
      ],
      limitations: ['Branding MenuBuilder visibile'],
      recommended: false
    },
    {
      id: 'basic' as SubscriptionTier,
      name: 'Basic',
      price: '€9.90',
      priceDetail: 'al mese',
      color: 'border-blue-500',
      features: [
        'Fino a 150 piatti',
        'Fino a 20 categorie',
        'Tutte le funzionalità Free',
        'Rimozione branding MenuBuilder',
        '2 GB storage foto',
        'Supporto prioritario email'
      ],
      limitations: [],
      recommended: true
    },
    {
      id: 'premium' as SubscriptionTier,
      name: 'Premium',
      price: '€29.90',
      priceDetail: 'al mese',
      color: 'border-gold',
      features: [
        'Piatti illimitati',
        'Categorie illimitate',
        'Tutte le funzionalità Basic',
        'Custom domain',
        'Analytics avanzati',
        '10 GB storage foto',
        'Supporto prioritario chat'
      ],
      limitations: [],
      recommended: false
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Scegli il piano perfetto per te
        </h2>
        <p className="text-lg text-gray-600">
          Inizia con il piano Free e aggiorna quando vuoi. Nessun vincolo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
              selectedPlan === plan.id
                ? `${plan.color} ring-4 ring-opacity-20 ${
                    plan.id === 'free'
                      ? 'ring-gray-400'
                      : plan.id === 'basic'
                      ? 'ring-blue-500'
                      : 'ring-gold'
                  }`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  CONSIGLIATO
                </span>
              </div>
            )}

            {/* Selected Indicator */}
            {selectedPlan === plan.id && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-roma-red">{plan.price}</span>
                {plan.priceDetail && (
                  <span className="text-sm text-gray-500">/{plan.priceDetail}</span>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Limitations */}
            {plan.limitations.length > 0 && (
              <ul className="space-y-2 pt-4 border-t border-gray-200">
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-500">{limitation}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-900 font-semibold mb-1">
              Puoi cambiare piano in qualsiasi momento
            </p>
            <p className="text-sm text-blue-700">
              Inizia con il piano Free e aggiorna quando il tuo ristorante cresce. Nessun costo nascosto.
            </p>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-full bg-roma-red hover:bg-roma-red/90 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        Continua con {plans.find((p) => p.id === selectedPlan)?.name} →
      </button>
    </div>
  );
}
