interface ContactInfoProps {
  formData: {
    contact_email: string;
    phone: string;
    address: string;
    city: string;
  };
  onUpdate: (updates: Partial<ContactInfoProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ContactInfo({ formData, onUpdate, onNext, onBack }: ContactInfoProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Informazioni di contatto
        </h2>
        <p className="text-lg text-gray-600">
          Opzionale - Puoi compilare questi campi anche dopo
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 mb-8">
        {/* Email Contatto */}
        <div>
          <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Contatto
          </label>
          <input
            type="email"
            id="contact_email"
            value={formData.contact_email}
            onChange={(e) => onUpdate({ contact_email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="info@tuoristorante.it"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email pubblica che i clienti possono usare per contattarti
          </p>
        </div>

        {/* Telefono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Telefono
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="+39 06 1234567"
          />
          <p className="text-xs text-gray-500 mt-1">
            Numero di telefono del ristorante
          </p>
        </div>

        {/* Indirizzo */}
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Indirizzo
          </label>
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Via Roma, 123"
          />
        </div>

        {/* Città */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            Città
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Roma"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
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
              Questi campi sono opzionali
            </p>
            <p className="text-sm text-blue-700">
              Puoi aggiungere o modificare queste informazioni in qualsiasi momento dalla dashboard.
              Le informazioni di contatto saranno visibili nel footer del tuo menu.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ← Indietro
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          Completa Setup →
        </button>
      </div>

      {/* Skip Link */}
      <div className="text-center mt-6">
        <button
          onClick={onNext}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Salta questo step
        </button>
      </div>
    </div>
  );
}
