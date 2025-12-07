import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;
        const email = formData.get('email') as string;
        const file = formData.get('attachment') as File | null;

        if (!subject || !message || !email) {
            return NextResponse.json(
                { error: 'Email, oggetto e messaggio sono obbligatori' },
                { status: 400 }
            );
        }

        let attachments = [];
        if (file && file.size > 0) {
            if (file.size > 2 * 1024 * 1024) {
                return NextResponse.json(
                    { error: 'L\'allegato non può superare i 2MB' },
                    { status: 400 }
                );
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            attachments.push({
                filename: file.name,
                content: buffer,
            });
        }

        // Send email to Support Team
        const { data, error } = await resend.emails.send({
            from: 'Gofood Menu Support <onboarding@resend.dev>',
            to: ['gabrielebellante@gmail.com'], // Replace with actual support email
            reply_to: email,
            subject: `[Assistenza] ${subject}`,
            text: `Nuova richiesta di assistenza da: ${email}\n\nMessaggio:\n${message}`,
            attachments,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Support API Error:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
