/**
 * Landing Page - Presentazione Prodotto SaaS
 *
 * Homepage che presenta la piattaforma per ristoratori
 */

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-roma-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-display text-2xl font-bold text-roma-red">
                MenuBuilder
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-roma-red transition-colors font-medium"
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className="bg-roma-red hover:bg-roma-red/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Inizia Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <div className="inline-block bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
                ✨ Novità: Menu Digitali per Ristoranti
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Il tuo menu digitale,
                <span className="text-roma-red"> in 5 minuti</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Crea un menu digitale professionale per il tuo ristorante.
                <strong className="text-gray-900"> Senza codice, senza complicazioni.</strong> I tuoi clienti scansionano il QR code e vedono il menu aggiornato in tempo reale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/register"
                  className="bg-roma-red hover:bg-roma-red/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Inizia Gratis →
                </Link>
                <Link
                  href="/magna-roma"
                  className="bg-white hover:bg-gray-50 text-roma-red border-2 border-roma-red px-8 py-4 rounded-lg font-bold text-lg transition-all text-center"
                >
                  Vedi Demo
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Nessuna carta di credito</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Setup in 5 minuti</span>
                </div>
              </div>
            </div>

            {/* Right: Screenshot/Demo */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/magnaroma.png"
                  alt="Demo Menu Digitale"
                  width={600}
                  height={800}
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Badge decorativo */}
              <div className="absolute -bottom-6 -right-6 bg-gold text-white px-6 py-3 rounded-full shadow-xl font-bold">
                📱 Mobile First
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problemi che risolvi */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Basta con i problemi dei menu tradizionali
            </h2>
            <p className="text-xl text-gray-600">
              I menu cartacei sono costosi, difficili da aggiornare e poco igienici
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Problema 1 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Costi di stampa elevati
              </h3>
              <p className="text-gray-600">
                Ristampare i menu ogni volta che cambiano prezzi o piatti costa centinaia di euro all'anno
              </p>
            </div>

            {/* Problema 2 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Aggiornamenti lenti
              </h3>
              <p className="text-gray-600">
                Modificare prezzi o piatti richiede settimane tra grafica, stampa e sostituzione
              </p>
            </div>

            {/* Problema 3 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🦠</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Igiene e usura
              </h3>
              <p className="text-gray-600">
                Menu cartacei si sporcano, si rovinano e vanno sostituiti continuamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Soluzione */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              La soluzione? Menu digitali accessibili via QR code
            </h2>
            <p className="text-xl text-gray-600">
              I tuoi clienti scansionano il codice QR sul tavolo e visualizzano il menu sul loro smartphone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Beneficio 1 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Aggiornamenti istantanei
              </h3>
              <p className="text-gray-600">
                Modifica prezzi e piatti in tempo reale dalla dashboard. I clienti vedono subito le novità.
              </p>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Zero costi di stampa
              </h3>
              <p className="text-gray-600">
                Niente più ristampe, grafici o attese. Tutto online, sempre aggiornato.
              </p>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Multilingua automatico
              </h3>
              <p className="text-gray-600">
                Italiano, Inglese e altre lingue disponibili con un click. Perfetto per turisti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tutto ciò che serve per il tuo menu perfetto
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard icon="📱" title="Mobile First" description="Ottimizzato per smartphone" />
            <FeatureCard icon="🖼️" title="Foto dei piatti" description="Carica immagini per ogni piatto" />
            <FeatureCard icon="🔄" title="Aggiornamenti live" description="Modifiche in tempo reale" />
            <FeatureCard icon="🌐" title="Multilingua" description="IT, EN e altre lingue" />
            <FeatureCard icon="🥜" title="Gestione allergeni" description="Conforme normativa EU" />
            <FeatureCard icon="🎨" title="Branding custom" description="Logo e colori personalizzati" />
            <FeatureCard icon="📊" title="Categorie illimitate" description="Organizza come vuoi" />
            <FeatureCard icon="⚡" title="QR Code incluso" description="Stampa e metti sui tavoli" />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-roma-red to-red-700 rounded-2xl p-12 text-center text-white shadow-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Pronto a digitalizzare il tuo menu?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Registrati gratis e crea il tuo primo menu in 5 minuti
            </p>
            <Link
              href="/register"
              className="inline-block bg-white hover:bg-gray-100 text-roma-red px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-lg"
            >
              Inizia Gratis →
            </Link>
            <p className="mt-4 text-sm opacity-75">
              Nessuna carta di credito richiesta • Piano gratuito per sempre
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-roma-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="font-display text-xl font-bold">MenuBuilder</span>
              </div>
              <p className="text-gray-400">
                Menu digitali per ristoranti moderni
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/magna-roma" className="hover:text-white">Demo</Link></li>
                <li><Link href="/register" className="hover:text-white">Registrati</Link></li>
                <li><Link href="/login" className="hover:text-white">Accedi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Supporto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:info@menubuilder.it" className="hover:text-white">Email</a></li>
                <li>© 2025 MenuBuilder</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
