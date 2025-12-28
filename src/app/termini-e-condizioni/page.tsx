import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm border-b border-orange-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-4">
                            <Image
                                src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/gofood-logoHD.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL2dvZm9vZC1sb2dvSEQuc3ZnIiwiaWF0IjoxNzY0Nzk5OTg0LCJleHAiOjIwODAxNTk5ODR9.u0xvBk9SohQ53303twe_gKZ87_Bj2ga3dD1HauBaevk"
                                alt="GO! FOOD"
                                width={120}
                                height={48}
                                className="h-10 w-auto"
                                unoptimized
                            />
                        </Link>
                        <Button asChild variant="ghost">
                            <Link href="/">Torna alla Home</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4">Termini e Condizioni</h1>
                    <p className="text-xl text-gray-600">Ultimo aggiornamento: 28 Dicembre 2025</p>
                </div>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>1. Introduzione</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            Benvenuti su GO! FOOD Menu. Utilizzando il nostro sito web e i nostri servizi, accetti di rispettare e di essere vincolato dai seguenti termini e condizioni. Si prega di leggerli attentamente.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>2. Descrizione del Servizio</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            GO! FOOD Menu fornisce una piattaforma software-as-a-service (SaaS) che consente ai ristoratori di creare, gestire e pubblicare menu digitali accessibili tramite QR code.
                            Il servizio include strumenti per la gestione di piatti, categorie, allergeni e traduzioni automatiche.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>3. Account e Sicurezza</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            Per accedere ad alcune funzionalità del Servizio, è necessario creare un account. Sei responsabile del mantenimento della riservatezza delle tue credenziali di accesso
                            e di tutte le attività che avvengono sotto il tuo account. GO! FOOD Menu non sarà responsabile per eventuali perdite derivanti dall'uso non autorizzato del tuo account.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>4. Abbonamenti e Pagamenti</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Piani:</strong> Il servizio è offerto in abbonamento (mensile o annuale).
                            </li>
                            <li>
                                <strong>Pagamenti:</strong> I pagamenti sono gestiti in modo sicuro tramite Stripe. Accettiamo le principali carte di credito.
                            </li>
                            <li>
                                <strong>Rinnovo:</strong> L'abbonamento si rinnova automaticamente alla fine di ogni periodo di fatturazione, a meno che non venga disdetto.
                            </li>
                            <li>
                                <strong>Cancellazione:</strong> Puoi cancellare il tuo abbonamento in qualsiasi momento dalla dashboard del tuo account. L'accesso al servizio continuerà fino al termine del periodo pagato.
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>5. Responsabilità sui Contenuti</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            L'utente mantiene la piena proprietà e responsabilità di tutti i contenuti (testi, immagini dei piatti, prezzi) caricati sulla piattaforma.
                        </p>
                        <p className="mt-4">
                            <strong>Importante:</strong> È responsabilità esclusiva del ristoratore garantire l'accuratezza delle informazioni sugli <strong>allergeni</strong> e sugli ingredienti, in conformità con le normative locali (es. Regolamento UE 1169/2011).
                            GO! FOOD Menu fornisce gli strumenti per indicare gli allergeni, ma non verifica la correttezza dei dati inseriti.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>6. Limitazione di Responsabilità</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            Il servizio è fornito "così com'è" e "come disponibile". GO! FOOD Menu non garantisce che il servizio sarà ininterrotto o privo di errori.
                        </p>
                        <p className="mt-2">
                            In nessun caso GO! FOOD Menu sarà responsabile per danni indiretti, incidentali, speciali, consequenziali o punitivi, inclusi, senza limitazione, perdita di profitti, dati, uso o avviamento.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur shadow-lg border-orange-100 mb-8">
                    <CardHeader>
                        <CardTitle>7. Modifiche ai Termini</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-orange text-gray-600">
                        <p>
                            Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione su questa pagina.
                            L'uso continuato del servizio dopo tali modifiche costituisce accettazione dei nuovi termini.
                        </p>
                    </CardContent>
                </Card>

                <div className="text-center text-gray-500 text-sm mt-12">
                    <p>Per domande o chiarimenti, contattaci a <a href="mailto:info@gofoodmenu.it" className="text-orange-600 hover:underline">info@gofoodmenu.it</a></p>
                </div>
            </main>

            {/* Footer semplificato */}
            <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} GO! FOOD. Tutti i diritti riservati.</p>
                </div>
            </footer>
        </div>
    );
}
