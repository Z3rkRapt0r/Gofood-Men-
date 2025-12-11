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
        let { data: tenant } = await (supabaseAdmin.from('tenants') as any)
            .select('id, email, restaurant_name')
            .eq('owner_id', user.id)
            .single();

        if (!tenant) {
            console.log(`[STRIPE_CHECKOUT] Tenant not found for user ${user.id}, creating one...`);
            const tempSlug = `restaurant-${user.id.substring(0, 8)}`;
            const restaurantName = user.user_metadata?.restaurant_name || 'Il Mio Ristorante';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: newTenant, error: createError } = await (supabaseAdmin.from('tenants') as any)
                .insert({
                    owner_id: user.id,
                    restaurant_name: restaurantName,
                    slug: tempSlug,
                    onboarding_completed: false,
                    onboarding_step: 1,
                    subscription_tier: 'free',
                    max_dishes: 9999,
                    max_categories: 9999
                })
                .select()
                .single();

            if (createError || !newTenant) {
                console.error('[STRIPE_CHECKOUT] Failed to auto-create tenant:', createError);
                return new NextResponse('Failed to create tenant account', { status: 500 });
            }

            // Assign new tenant to variable (using var or let implies refactoring, but easier to just cast here or continue)
            // But 'const tenant' is block scoped above? Actually 'const { data: tenant }' declares it.
            // We need to handle the variable scope correctly. 
            // Re-declaring or using a mutable variable for tenant would be better.
            // For this patch, I'll rely on a slightly different structure or just use newTenant below.

            // To be safe and clean, let's just assume we return logic or refactor.
            // Actually, simply continuing with newTenant as 'tenant' is tricky because 'tenant' is const.
            // I will refactor the variable declaration to 'let'.
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
        if (!tenant) {
            console.log(`[STRIPE_CHECKOUT] Tenant not found for user ${user.id}, creating one...`);
            const tempSlug = `restaurant-${user.id.substring(0, 8)}`;
            const restaurantName = user.user_metadata?.restaurant_name || 'Il Mio Ristorante';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: newTenant, error: createError } = await (supabaseAdmin.from('tenants') as any)
                .insert({
                    owner_id: user.id,
                    restaurant_name: restaurantName,
                    slug: tempSlug,
                    onboarding_completed: false,
                    onboarding_step: 1,
                    subscription_tier: 'free',
                    max_dishes: 9999,
                    max_categories: 9999
                })
                .select()
                .single();

            if (createError || !newTenant) {
                console.error('[STRIPE_CHECKOUT] Failed to auto-create tenant:', createError);
                return new NextResponse('Failed to create tenant account', { status: 500 });
            }

            tenant = newTenant;

            // Initialize design settings for new tenant
            await (supabaseAdmin.from('tenant_design_settings') as any).insert({
                tenant_id: newTenant.id,
                theme_config: {}
            });
        }

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
