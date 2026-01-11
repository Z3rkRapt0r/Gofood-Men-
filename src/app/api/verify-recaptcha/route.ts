import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token reCAPTCHA mancante' },
                { status: 400 }
            );
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error('RECAPTCHA_SECRET_KEY is not defined');
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
        const response = await fetch(verificationUrl, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            console.error('reCAPTCHA validation failed:', data['error-codes']);
            return NextResponse.json(
                { success: false, message: 'Verifica reCAPTCHA fallita' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return NextResponse.json(
            { success: false, message: 'Errore durante la verifica reCAPTCHA' },
            { status: 500 }
        );
    }
}
