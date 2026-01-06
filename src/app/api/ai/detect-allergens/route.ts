import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://gofood-menu.com',
        'X-Title': 'Gofood Menu',
    },
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { dishes } = body;

        if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
            return NextResponse.json(
                { error: 'Nessun piatto fornito per l\'analisi' },
                { status: 400 }
            );
        }

        const prompt = `
      Sei un esperto tecnologo alimentare. Il tuo compito è analizzare una lista di piatti e identificare i probabili allergeni basandoti sul nome, sulla descrizione e sugli ingredienti forniti.

      Analizza i seguenti piatti:
      ${JSON.stringify(dishes, null, 2)}

      Regole di Analisi:
      1. **Allergeni EU (1169/2011)**: Cerca SOLO questi allergeni:
         - Glutine (Gluten)
         - Crostacei (Crustaceans)
         - Uova (Eggs)
         - Pesce (Fish)
         - Arachidi (Peanuts)
         - Soia (Soy)
         - Latte (Milk)
         - Frutta a guscio (Nuts)
         - Sedano (Celery)
         - Senape (Mustard)
         - Sesamo (Sesame)
         - Solfiti (Sulphites)
         - Lupini (Lupin)
         - Molluschi (Molluscs)

      2. **Contiene Glutine**:
         - Imposta "contains_gluten": true se trovi: pane, pasta, farina (grano, orzo, farro, ecc.), panatura, birra, biscotti, ecc.
         - Imposta "contains_gluten": "unknown" se il piatto è tradizionalmente senza glutine (es. risotto, polenta) ma c'è rischio contaminazione o ingredienti non specificati.
         - Imposta "contains_gluten": false SOLO se sei sicuro (es. "Bistecca ai ferri", "Insalata mista").

      3. **Livello di Confidenza (confidence)**:
         - "high": Ingredienti espliciti (es. "Carbonara: uova, guanciale, pecorino" -> Uova, Latte).
         - "medium": Piatto tradizionale noto (es. "Carbonara" senza ingredienti -> Uova, Latte, Glutine) MA con rischio varianti.
         - "low": Nome generico (es. "Torta della nonna", "Pasta del giorno") senza ingredienti. -> Needs Review = true.

      4. **Needs Review**:
         - true se confidence != high
         - true se contains_gluten == "unknown"

      Restituisci un JSON con questa struttura esatta:
      {
        "results": [
            {
                "dishName": "Nome Piatto (uguale all'input)",
                "allergens": ["Uova", "Latte"], // Array vuoto se nessuno
                "contains_gluten": true, // true, false, o "unknown"
                "confidence": "high", // "high", "medium", "low"
                "rationale": "Rilevato da 'pecorino' (Latte) e 'spaghetti' (Glutine).",
                "needs_review": false
            }
        ]
      }
    `;

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.5-pro',
            messages: [
                {
                    role: 'user',
                    content: prompt,
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
        } catch (parseError) {
            console.error('Error parsing AI response:', content);
            throw new Error('Errore nel parsing della risposta AI');
        }

    } catch (error: any) {
        console.error('Error detecting allergens:', error);
        return NextResponse.json(
            { error: error.message || 'Errore durante l\'analisi degli allergeni' },
            { status: 500 }
        );
    }
}
