import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Initialize Admin Client to bypass RLS for tenant lookup
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await req.json();
        const { desiredSlug, returnUrl } = body;

        // 1. Get Tenant (Using Admin Client)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tenant } = await (supabaseAdmin.from('tenants') as any)
            .select('id, email, restaurant_name')
            .eq('owner_id', user.id)
            .single();

        if (!tenant) {
            console.error(`Tenant not found for user ${user.id}`);
            return new NextResponse(`Tenant not found for user ${user.id}`, { status: 404 });
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
                const { data: existing } = await (supabaseAdmin.from('tenants') as any)
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
