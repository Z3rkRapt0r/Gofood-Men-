import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Find Stripe Customer by Email
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        if (customers.data.length === 0) {
            return NextResponse.json({ subscription: null });
        }

        const customerId = customers.data[0].id;

        // 2. List Active Subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            // Check for other statuses?
            const otherSubs = await stripe.subscriptions.list({
                customer: customerId,
                limit: 1,
            });
            if (otherSubs.data.length > 0) {
                // Return the most recent one even if not active (e.g. past_due, trialing)
                return NextResponse.json({
                    status: otherSubs.data[0].status,
                    current_period_end: otherSubs.data[0].current_period_end,
                    cancel_at_period_end: otherSubs.data[0].cancel_at_period_end
                });
            }
            return NextResponse.json({ subscription: null });
        }

        const sub = subscriptions.data[0];

        return NextResponse.json({
            status: sub.status,
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end
        });

    } catch (error) {
        console.error('[STRIPE_DETAILS] Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
