/**
 * Landing Page - GO! FOOD Menu Builder
 * Design moderno con colori arancioni accattivanti
 */

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image
                src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/gofood-logoHD.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL2dvZm9vZC1sb2dvSEQuc3ZnIiwiaWF0IjoxNzY0Nzk5OTg0LCJleHAiOjIwODAxNTk5ODR9.u0xvBk9SohQ53303twe_gKZ87_Bj2ga3dD1HauBaevk"
                alt="GO! FOOD"
                width={150}
                height={60}
                className="h-14 w-auto"
                unoptimized
              />
              <div className="hidden md:block h-8 w-px bg-orange-200" />
              <span className="hidden md:block font-bold text-gray-700 text-lg">
                Costruisci il tuo menu
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-semibold">
                <Link href="/login">Accedi</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-105 rounded-xl">
                <Link href="/register">Inizia Ora</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-2 md:px-4 pt-10 pb-16 md:py-22">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-5 py-2.5 rounded-full text-sm font-bold mb-8 border border-orange-200 shadow-sm">
                <span className="text-xl">🚀</span>
                <span>La rivoluzione dei menu digitali</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                Il tuo menu digitale
                <span className="block mt-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  in pochi click
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Carica la foto del tuo menu cartaceo e l'<strong>Intelligenza Artificiale</strong> lo digitalizza in secondi.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 hover:scale-105 flex items-center justify-center gap-2">
                  <Link href="/register">
                    Crea il tuo Menu
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-300 hover:border-orange-400 px-10 py-6 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                  <Link href="https://gofoodmenu.it/bistrot107" target="_blank">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    Vedi Demo
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-semibold">Setup in 5 minuti</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Supporto incluso</span>
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative lg:block">
              <div className="relative w-fit mx-auto">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Phone Mockup */}
                {/* Phone Mockup */}
                <div className="relative z-10 mx-auto w-[220px] md:w-[300px] transform hover:scale-105 transition-transform duration-500">
                  {/* Phone Frame */}
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-gray-900 bg-black">
                    {/* Screen Content */}
                    <div className="relative bg-white w-full aspect-[1206/2374]">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      >
                        <source src="/videos/VIDEO.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>

                  {/* Reflection/Glare */}
                  <div className="absolute inset-0 rounded-[3rem] pointer-events-none ring-1 ring-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]"></div>
                </div>

                {/* Floating Badges */}
                <div className="absolute -left-20 top-8 md:top-20 md:-left-28 bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-1.5 md:p-4 border border-orange-100 animate-bounce z-20" style={{ animationDuration: '3s' }}>
                  <div className="text-center">
                    <div className="text-base md:text-3xl font-black text-orange-600">QR</div>
                    <div className="text-[9px] md:text-xs text-gray-600 font-semibold">Incluso</div>
                  </div>
                </div>

                <div className="absolute -right-20 bottom-16 md:bottom-32 md:-right-32 bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-1.5 md:p-4 border border-orange-100 animate-bounce z-20" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-base md:text-2xl">🌍</span>
                    <div>
                      <div className="text-[9px] md:text-xs font-bold text-gray-900">Bilingua</div>
                      <div className="text-[9px] md:text-xs text-gray-600">IT + EN</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-20 top-4 md:top-12 md:-right-34 bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-1.5 md:p-3 border border-orange-100 animate-bounce z-20" style={{ animationDuration: '2.5s', animationDelay: '1s' }}>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-base md:text-2xl">🥜</span>
                    <div>
                      <div className="text-[9px] md:text-xs font-bold text-gray-900">Filtro</div>
                      <div className="text-[9px] md:text-xs text-gray-600">Allergeni</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-20 bottom-8 md:bottom-24 md:-left-34 bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-1 md:p-2 border border-orange-100 animate-bounce z-20" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs md:text-lg">
                      AI
                    </div>
                    <div>
                      <div className="text-[9px] md:text-xs font-bold text-gray-900">Import</div>
                      <div className="text-[9px] md:text-xs text-gray-600">Smart</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* Trusted By Section */}
      <section className="py-12 bg-orange-50 border-y border-orange-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 font-semibold uppercase tracking-wider mb-8 text-sm">
            Scelto dai migliori ristoranti
          </p>
          <div className="grid grid-cols-2 md:flex md:flex-wrap justify-items-center md:justify-center items-center gap-8 md:gap-20 transition-all duration-500">
            {/* Real Logos */}
            <Link href="/magna-roma" className="flex items-center gap-4 transition-all duration-500 hover:scale-110 hover:rotate-2 filter hover:drop-shadow-lg cursor-pointer">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/magnaroma-logo1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL21hZ25hcm9tYS1sb2dvMS5wbmciLCJpYXQiOjE3NjQ3OTQ1MDIsImV4cCI6MjA4MDE1NDUwMn0.iqkxWbz2bd8AoHLmk4RhxhTqMw4Wn_mjk99YlkEzAjM"
                  alt="Magna Roma"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
            <Link href="/osteria-cilea" className="flex items-center gap-4 transition-all duration-500 hover:scale-110 hover:-rotate-2 filter hover:drop-shadow-lg cursor-pointer">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/public/Go%20Food/Osteria%20Cilea%20Logo%20HD.png"
                  alt="Osteria Cilea"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
            <Link href="/bistrot107" className="flex items-center gap-4 transition-all duration-500 hover:scale-110 hover:rotate-1 filter hover:drop-shadow-lg cursor-pointer">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image
                  src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/public/Go%20Food/images-modified.png"
                  alt="Bistrot 107"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
            <Link href="/villa-pensabene-ristorante-pizzeria" className="flex items-center gap-4 transition-all duration-500 hover:scale-110 hover:-rotate-1 filter hover:drop-shadow-lg cursor-pointer">
              <div className="relative w-32 h-32 md:w-48 md:h-48">
                <Image
                  src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/public/Go%20Food/Gemini_Generated_Image_gw5jhzgw5jhzgw5j-Photoroom.png"
                  alt="Villa Pensabene Ristorante Pizzeria"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              IL PROBLEMA
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Menu cartacei? <span className="text-red-600">No grazie!</span>
            </h2>
            <p className="text-xl text-gray-600">
              Costosi, lenti da aggiornare e poco igienici. È ora di cambiare.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <ProblemCard
              icon="💸"
              title="Costi folli"
              description="Centinaia di euro spesi ogni anno in stampe e ristampe"
              color="red"
            />
            <ProblemCard
              icon="🐌"
              title="Lentezza"
              description="Settimane per aggiornare prezzi tra grafica e stampa"
              color="yellow"
            />
            <ProblemCard
              icon="🦠"
              title="Igiene zero"
              description="Menu che si sporcano e si rovinano continuamente"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              LA SOLUZIONE
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Menu digitali <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">via QR code</span>
            </h2>
            <p className="text-xl text-gray-600">
              I tuoi clienti scansionano, vedono il menu aggiornato in tempo reale. Semplice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:shadow-xl hover:shadow-orange-100 transition-all border-none shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">⚡</div>
                <CardTitle className="text-xl font-bold text-gray-900">Update istantaneo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Modifica prezzi in tempo reale. I clienti vedono subito tutto.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:shadow-xl hover:shadow-orange-100 transition-all border-none shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle className="text-xl font-bold text-gray-900">Zero stampa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Mai più costi di ristampa. Tutto online, sempre aggiornato.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-orange-100 hover:shadow-xl hover:shadow-orange-100 transition-all border-none shadow-lg">
              <CardHeader>
                <div className="text-4xl mb-4">🌍</div>
                <CardTitle className="text-xl font-bold text-gray-900">Multilingua</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">IT ed EN con un click. Perfetto per turisti.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Tutto quello che ti serve
            </h2>
            <p className="text-xl text-gray-600">
              Funzionalità professionali, interfaccia semplicissima
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {["Mobile First", "Importazione AI", "Sync Live", "Multilingua", "Allergeni EU", "Brand Custom", "Piatti e Categorie Illimitate", "QR Code"].map((title, i) => {
              const icons = ["📱", "✨", "🔄", "🌐", "🥜", "🎨", "📊", "⚡"];
              return (
                <Card key={i} className="group hover:-translate-y-1 transition-all duration-300 border-none shadow-lg hover:shadow-xl bg-orange-50/50">
                  <CardHeader className="p-6">
                    <div className="text-3xl mb-3">{icons[i]}</div>
                    <CardTitle className="font-bold text-gray-900">{title}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="font-display text-4xl md:text-6xl font-black mb-6">
              Pronto a decollare? 🚀
            </h2>
            <p className="text-xl md:text-2xl mb-4 opacity-90 font-medium">
              Unisciti ai ristoratori che hanno già detto addio ai menu cartacei
            </p>

            <Button asChild size="lg" className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-orange-600 px-12 py-8 rounded-2xl font-black text-xl transition-all shadow-2xl hover:scale-105 h-auto">
              <Link href="/register">
                <span>Inizia Ora</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <p className="mt-6 text-white/80 text-sm font-semibold">
              ✓ Tutti i vantaggi inclusi · ✓ Setup in 5 minuti · ✓ Cancella quando vuoi
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            <div className="md:col-span-2">
              <Image
                src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/gofood-logoHD.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL2dvZm9vZC1sb2dvSEQuc3ZnIiwiaWF0IjoxNzY0Nzk5OTg0LCJleHAiOjIwODAxNTk5ODR9.u0xvBk9SohQ53303twe_gKZ87_Bj2ga3dD1HauBaevk"
                alt="GO! FOOD"
                width={150}
                height={60}
                className="h-12 w-auto mb-4 brightness-0 invert"
                unoptimized
              />
              <p className="text-gray-400 mb-6 max-w-md">
                La piattaforma più semplice per creare menu digitali professionali. Usata da centinaia di ristoranti in tutta Italia.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/gofoodmenu/" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-orange-400">Supporto</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="mailto:info@gofoodmenu.it" className="hover:text-orange-400 transition-colors">info@gofoodmenu.it</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>Rag. Sociale: GO ! FOOD ITALIA DI GIORGIO DI MARTINO</p>
            <p>Indirizzo: VIA MARIANO STABILE 160 - 90139 - PALERMO (PA)</p>
            <p>Partita IVA: 06955440828</p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
              <a href="https://www.iubenda.com/privacy-policy/23100081" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-orange-500 transition-colors" title="Privacy Policy">Privacy Policy</a>
              <a href="https://www.iubenda.com/privacy-policy/23100081/cookie-policy" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-orange-500 transition-colors" title="Cookie Policy">Cookie Policy</a>
              <Link href="/termini-e-condizioni" className="hover:text-orange-500 transition-colors">Termini e Condizioni</Link>
              <Script id="iubenda-loader-landing" strategy="lazyOnload">
                {`(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`}
              </Script>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



function ProblemCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const colors = {
    red: 'bg-red-50 border-red-200 hover:border-red-300',
    yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300'
  };

  return (
    <div className={`${colors[color as keyof typeof colors]} border-2 rounded-2xl p-8 hover:shadow-xl transition-all`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-black text-xl text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
