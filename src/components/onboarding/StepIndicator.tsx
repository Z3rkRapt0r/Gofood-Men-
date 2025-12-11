interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: 'Branding', description: 'Personalizza il menu' },
    { number: 2, title: 'Contatti', description: 'Informazioni ristorante' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-10" />

        {/* Progress Line */}
        <div
          className="absolute top-6 left-0 h-1 bg-orange-200 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center relative z-10">
            {/* Step Circle */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-4 ${step.number === currentStep
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white scale-110 shadow-lg shadow-orange-200 border-white'
                : step.number < currentStep
                  ? 'bg-orange-100 text-orange-600 border-white'
                  : 'bg-gray-100 text-gray-400 border-white'
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
            <div className="mt-3 text-center hidden sm:block">
              <div
                className={`text-sm font-bold transition-colors ${step.number === currentStep ? 'text-orange-600' : 'text-gray-600'
                  }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Labels */}
      <div className="mt-4 text-center sm:hidden">
        <div className="text-sm font-bold text-orange-600">{steps[currentStep - 1]?.title || ''}</div>
        <div className="text-xs text-gray-500">{steps[currentStep - 1]?.description || ''}</div>
      </div>
    </div>
  );
}
