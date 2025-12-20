import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Always redirect to the reset password page after successful login
            return NextResponse.redirect(`${origin}/reset-password`);
        }
    }

    // On error, return to home or login
    return NextResponse.redirect(`${origin}/login?error=reset_failed`);
}
