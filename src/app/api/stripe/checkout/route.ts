import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { desiredSlug, returnUrl } = body;

        // 1. Get Tenant
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id, email, restaurant_name') // Note: contact_email was removed, treating owner email as contact or using auth email
            .eq('owner_id', user.id)
            .single();

        if (!tenant) {
            return new NextResponse('Tenant not found', { status: 404 });
        }

        // 2. Validate & Unique Slug
        let finalSlug = desiredSlug;
        if (desiredSlug) {
            // Basic format check
            if (!/^[a-z0-9-]+$/.test(desiredSlug)) {
                return new NextResponse('Invalid slug format', { status: 400 });
            }

            // Ensure uniqueness
            let isUnique = false;
            let counter = 0;

            while (!isUnique) {
                const checkSlug = counter === 0 ? desiredSlug : `${desiredSlug}-${counter}`;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: existing } = await (supabase.from('tenants') as any)
                    .select('id')
                    .eq('slug', checkSlug)
                    .neq('id', (tenant as any).id)
                    .single();

                if (!existing) {
                    finalSlug = checkSlug;
                    isUnique = true;
                } else {
                    counter++;
                }
            }
        }

        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            console.error('STRIPE_PRICE_ID is missing');
            return new NextResponse('Server configuration error', { status: 500 });
        }

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                tenantId: (tenant as any).id,
                desiredSlug: finalSlug || '', // Will be used in webhook to update slug
                userId: user.id
            },
            subscription_data: {
                metadata: {
                    tenantId: (tenant as any).id,
                    desiredSlug: finalSlug || '',
                    userId: user.id
                }
            },
            customer_email: user.email, // Pre-fill email
            success_url: `${returnUrl || req.headers.get('origin')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl || req.headers.get('origin')}/dashboard?payment=canceled`,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
