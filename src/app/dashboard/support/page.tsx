import { createClient } from '@/lib/supabase/server';
import SupportForm from '@/components/dashboard/SupportForm';
import { redirect } from 'next/navigation';

export default async function SupportPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch tenant info if needed, or just use user email
    // If we want the *restaurant* contact email, we should fetch the tenant.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (supabase.from('tenants') as any)
        .select('contact_email, restaurant_name')
        .eq('owner_id', user.id)
        .single();

    const userEmail = tenant?.contact_email || user.email || '';
    const restaurantName = tenant?.restaurant_name || 'Ristorante Sconosciuto';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Assistenza 🆘
                </h1>
                <p className="text-gray-600">
                    Hai bisogno di aiuto? Contattaci qui sotto.
                </p>
            </div>

            <SupportForm userEmail={userEmail} restaurantName={restaurantName} />
        </div>
    );
}
