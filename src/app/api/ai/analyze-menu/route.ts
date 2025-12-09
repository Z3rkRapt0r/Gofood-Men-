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
      Analizza questo menu (immagini) e estrai TUTTI i piatti.
      
      ${categoryContext}
      
      Restituisci SOLO un oggetto JSON valido con questa struttura esatta:
        {
            "dishes": [
                {
                    "name": "Nome Piatto",
                    "description": "Descrizione (o stringa vuota)",
                    "price": 12.50,
                    "categoryId": "ID_CATEGORIA_CORRISPONDENTE"
                }
            ]
        }

      Regole:
      1. Se non trovi prezzi, metti 0.
      2. Se non trovi descrizioni, metti stringa vuota.
      3. Mantieni i nomi dei piatti originali.
      4. "categoryId" è OBBLIGATORIO se hai ricevuto le categorie. Cerca di indovinare la migliore.
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
            model: 'amazon/nova-2-lite-v1:free',
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

        // Clean up the response to ensure it's valid JSON
        const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();

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
            { status: 500 }
        );
    }
}
