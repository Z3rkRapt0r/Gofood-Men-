interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: 'Piano', description: 'Scegli il tuo piano' },
    { number: 2, title: 'Branding', description: 'Personalizza il menu' },
    { number: 3, title: 'Contatti', description: 'Informazioni ristorante' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step.number === currentStep
                    ? 'bg-roma-red text-white scale-110 shadow-lg'
                    : step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number < currentStep ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center hidden sm:block">
                <div
                  className={`text-sm font-semibold ${
                    step.number === currentStep ? 'text-roma-red' : 'text-gray-700'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">{step.description}</div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 hidden sm:block">
                <div
                  className={`h-full transition-all ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Labels */}
      <div className="mt-4 text-center sm:hidden">
        <div className="text-sm font-semibold text-roma-red">{steps[currentStep - 1].title}</div>
        <div className="text-xs text-gray-500">{steps[currentStep - 1].description}</div>
      </div>
    </div>
  );
}
