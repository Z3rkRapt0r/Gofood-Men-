import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://gofood-menu.com', // Replace with your actual site URL
        'X-Title': 'Gofood Menu', // Replace with your actual site name
    },
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { images, categories } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json(
                { error: 'Nessuna immagine fornita' },
                { status: 400 }
            );
        }

        const categoryContext = categories && Array.isArray(categories) && categories.length > 0
            ? `
Le categorie disponibili sono:
${categories.map((c: any) => `- ${c.name} (ID: ${c.id})`).join('\n')}

Per ogni piatto, DEVI assegnarlo alla categoria corretta usando il suo ID esatto.
Se un piatto non sembra appartenere a nessuna categoria specifica, assegnalo alla categoria più generica o appropriata.`
            : 'Non ci sono categorie specifiche fornite.';

        const prompt = `
      Sei un esperto ristoratore digitale. Il tuo compito è digitalizzare un menu fisico (foto) in dati strutturati.
      
      IMPORTANTE: L'utente ha GIÀ creato le seguenti categorie nel suo gestionale. 
      DEVI categorizzare ogni piatto che trovi nell'immagine assegnandolo ESCLUSIVAMENTE a una di queste categorie (usando l'ID corretto).
      
      ${categoryContext}
      
      Istruzioni per l'estrazione:
      1. **Analisi Struttura**: Prima di tutto, individua le SEZIONI o INTESTAZIONI nel menu fisico (es. "Antipasti", "Primi Piatti", "Vini").
      2. **Mapping Categoria**: 
         - Se trovi un piatto sotto l'intestazione "Antipasti", DEVI assegnarlo all'ID della categoria digitale che corrisponde a "Antipasti" (vedi lista sopra).
         - Se i nomi non sono identici (es. Foto: "Le Nostre Paste" -> Digitale: "Primi"), usa il buon senso per collegarli.
         - Se un piatto non ha una sezione chiara, deducila dagli ingredienti.
      3. **Estrazione Dati Piatto**:
         - **Nome**: Esatto come sul menu.
         - **Ingredienti**: Tutto il testo descrittivo. IMPORTANTE: NON includere il prezzo qui. Se c'è solo il prezzo come descrizione, lascia vuoto.
         - **Prezzo**: Numero (usa 0 se manca).
      
      Restituisci SOLO un oggetto JSON valido con questa struttura esatta:
        {
            "dishes": [
                {
                    "name": "Nome Piatto",
                    "description": "Ingredienti o descrizione trovata (SENZA PREZZO)",
                    "price": 12.50,
                    "categoryId": "ID_ESATTO_DELLA_CATEGORIA_SCELTA"
                }
            ]
        }

      Regole di Validazione:
      - **CRUCIALE**: Usa SOLO gli ID forniti lista "Categorie disponibili". Non inventare ID.
      - Se l'immagine contiene categorie che l'utente non ha creato (es. "Amaro"), assegna quei piatti alla categoria "Altro" o quella più simile.
      - **CRUCIALE**: La descrizione NON deve contenere cifre di prezzo (es. "€12" o "12.00"). Solo ingredienti.
    `;

        const contentParts = [
            { type: 'text', text: prompt } as const,
            ...images.map((base64Image: string) => ({
                type: 'image_url' as const,
                image_url: {
                    url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                },
            })),
        ];

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-3-flash-preview',
            messages: [
                {
                    role: 'user',
                    content: contentParts,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Nessuna risposta dall\'AI');
        }

        // Robust JSON extraction: Find the first '{' and the last '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error('Risposta AI non valida: JSON non trovato');
        }

        const jsonString = content.substring(firstBrace, lastBrace + 1);

        try {
            const data = JSON.parse(jsonString);
            return NextResponse.json(data);
        } catch (_parseError) {
            console.error('Error parsing AI response:', content);
            return NextResponse.json(
                { error: 'Errore nel parsing della risposta AI' },
                { status: 500 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error analyzing menu:', error);
        // Log detailed error from OpenAI/OpenRouter if available
        if (error.response) {
            console.error('OpenAI API Error Data:', error.response.data);
            console.error('OpenAI API Error Status:', error.response.status);
        }
        return NextResponse.json(
            { error: error.message || 'Errore durante l\'analisi del menu' },
            { status: error.status || 500 }
        );
    }
}
