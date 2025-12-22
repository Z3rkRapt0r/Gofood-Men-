import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { returnUrl } = body;

        // 1. Find Stripe Customer by Email
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return new NextResponse('No Stripe customer found', { status: 404 });
        }

        const customerId = customers.data[0].id;

        // 2. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || req.headers.get('origin') + '/dashboard/account',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_PORTAL] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
