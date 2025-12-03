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
  const isValid = formData.contact_email && formData.phone && formData.address && formData.city;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Informazioni di contatto
        </h2>
        <p className="text-lg text-gray-600">
          Inserisci i dati del tuo ristorante per completare il profilo
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 mb-8">
        {/* Email Contatto */}
        <div>
          <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email Contatto *
          </label>
          <input
            type="email"
            id="contact_email"
            required
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
            Telefono *
          </label>
          <input
            type="tel"
            id="phone"
            required
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
            Indirizzo *
          </label>
          <input
            type="text"
            id="address"
            required
            value={formData.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Via Roma, 123"
          />
        </div>

        {/* Città */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            Città *
          </label>
          <input
            type="text"
            id="city"
            required
            value={formData.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Roma"
          />
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
          disabled={!isValid}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          Completa Setup →
        </button>
      </div>
    </div>
  );
}
