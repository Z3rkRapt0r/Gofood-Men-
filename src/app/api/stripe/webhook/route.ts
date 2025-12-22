import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Initialize Supabase with Service Role Key to bypass RLS
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature') as string;

    let event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`[STRIPE_WEBHOOK] Signature error: ${error}`);
        return new NextResponse('Webhook Error', { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // Retrieve the session to get metadata (it should be in the event, but safer to trust the event object)
                // Check if it's a subscription mode
                if (session.mode === 'subscription') {
                    const tenantId = session.metadata?.tenantId;
                    const desiredSlug = session.metadata?.desiredSlug;
                    const stripeSubscriptionId = session.subscription;
                    const stripeCustomerId = session.customer;

                    if (!tenantId) {
                        console.error('[STRIPE_WEBHOOK] Missing tenantId in metadata');
                        break;
                    }

                    console.log(`[STRIPE_WEBHOOK] Activating tenant ${tenantId}`);

                    const updateData: any = {
                        subscription_status: 'active',
                        subscription_tier: 'premium',
                    };

                    console.log(`[STRIPE_WEBHOOK] Processing subscription for tenant ${tenantId}`);
                    console.log(`[STRIPE_WEBHOOK] Metadata desiredSlug: "${desiredSlug}"`);

                    // If a new slug was requested and paid for, update it.
                    if (desiredSlug) {
                        updateData.slug = desiredSlug;
                        console.log(`[STRIPE_WEBHOOK] Will update slug to: ${desiredSlug}`);
                    } else {
                        console.warn('[STRIPE_WEBHOOK] No desiredSlug in metadata, skipping slug update');
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabaseAdmin.from('tenants') as any)
                        .update(updateData)
                        .eq('id', tenantId);

                    if (error) {
                        console.error('[STRIPE_WEBHOOK] DB Error:', error);
                        throw error;
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log('[STRIPE_WEBHOOK] Handling deletion. Metadata:', subscription.metadata);

                let tenantId = subscription.metadata?.tenantId;

                // Fallback: Try to find tenant by userId (Owner ID)
                if (!tenantId && subscription.metadata?.userId) {
                    console.warn('[STRIPE_WEBHOOK] tenantId missing, trying lookup by userId:', subscription.metadata.userId);
                    const { data: tenant } = await supabaseAdmin
                        .from('tenants')
                        .select('id')
                        .eq('owner_id', subscription.metadata.userId)
                        .single();

                    if (tenant) {
                        tenantId = tenant.id;
                        console.log('[STRIPE_WEBHOOK] Found tenant via userId:', tenantId);
                    }
                }

                if (tenantId) {
                    console.log(`[STRIPE_WEBHOOK] Deactivating tenant ${tenantId}`);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabaseAdmin.from('tenants') as any)
                        .update({
                            subscription_status: 'canceled',
                            subscription_tier: 'free'
                        })
                        .eq('id', tenantId);
                } else {
                    // Fallback: try to find by stripe_subscription_id if we implemented it, 
                    // but relying on metadata for now.
                    console.warn('[STRIPE_WEBHOOK] No tenantId in subscription metadata for deletion event');
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log('[STRIPE_WEBHOOK] Handling update. Status:', subscription.status);

                let tenantId = subscription.metadata?.tenantId;

                // Fallback: Try to find tenant by userId (Owner ID)
                if (!tenantId && subscription.metadata?.userId) {
                    const { data: tenant } = await supabaseAdmin
                        .from('tenants')
                        .select('id')
                        .eq('owner_id', subscription.metadata.userId)
                        .single();

                    if (tenant) tenantId = tenant.id;
                }

                if (tenantId) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error } = await (supabaseAdmin.from('tenants') as any)
                        .update({
                            subscription_status: subscription.status
                        })
                        .eq('id', tenantId);

                    if (error) console.error('[STRIPE_WEBHOOK] DB Update Error:', error);
                    else console.log(`[STRIPE_WEBHOOK] Updated status to ${subscription.status} for tenant ${tenantId}`);
                }
                break;
            }
        }
    } catch (error) {
        console.error('[STRIPE_WEBHOOK] Processing error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}
