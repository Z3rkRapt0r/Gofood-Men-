"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import NewReservationEmail from "@/components/emails/NewReservationEmail";
import ReservationStatusEmail from "@/components/emails/ReservationStatusEmail";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "reservations@gofoodmenu.it";

// --- Submit Reservation (Public) ---
export async function submitReservation(formData: {
    tenantId: string;
    restaurantName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    guests: number;
    highChairs: number;
    date: string;
    time: string;
    notes: string;
}) {
    const supabase = await createClient();

    // 1. Insert Reservation into DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reservation, error: dbError } = await (supabase.from('reservations') as any)
        .insert({
            tenant_id: formData.tenantId,
            customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
            customer_email: formData.email,
            customer_phone: formData.phone,
            guests: formData.guests,
            high_chairs: formData.highChairs,
            reservation_date: formData.date,
            reservation_time: formData.time,
            notes: formData.notes || null,
            status: 'pending'
        })
        .select()
        .single();

    if (dbError) {
        console.error("DB Insert Error:", dbError);
        return { success: false, error: "Database error" };
    }

    // 2. Fetch Tenant Settings for Notification Email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from('reservation_settings') as any)
        .select('notification_email')
        .eq('tenant_id', formData.tenantId)
        .single();

    const ownerEmail = settings?.notification_email;

    if (ownerEmail) {
        // 3. Send Email to Owner
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: ownerEmail,
                subject: `Nuova Richiesta di Prenotazione - ${formData.date} ${formData.time}`,
                react: NewReservationEmail({
                    restaurantName: formData.restaurantName,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    guests: formData.guests,
                    highChairs: formData.highChairs,
                    date: formData.date,
                    time: formData.time,
                    notes: formData.notes,
                    dashboardUrl: "https://gofoodmenu.it/dashboard/reservations" // TODO: Update with real prod URL if dynamic
                }),
            });
        } catch (emailError) {
            console.error("Email Sending Error (Owner):", emailError);
            // We don't fail the request if email fails, but we log it
        }
    }

    return { success: true, reservation };
}

// --- Update Reservation Status (Protected / Dashboard) ---
export async function updateReservationStatus(
    reservationId: string,
    status: 'confirmed' | 'rejected',
    tableIds: string[] = [],
    rejectionReason?: string
) {
    const supabase = await createClient();

    // 1. Update DB
    const updateData: any = { status };
    if (status === 'confirmed' && tableIds.length > 0) {
        updateData.assigned_table_ids = tableIds;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase.from('reservations') as any)
        .update(updateData)
        .eq('id', reservationId);

    if (dbError) {
        console.error("DB Update Error:", dbError);
        return { success: false, error: "Database error" };
    }

    // 2. Fetch Reservation & Tenant Details for Email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reservation } = await (supabase.from('reservations') as any)
        .select(`
            *,
            tenants:tenant_id (restaurant_name, reservation_settings(notification_email))
        `)
        .eq('id', reservationId)
        .single();

    if (reservation && reservation.customer_email) {
        // 3. Send Email to Customer
        try {
            const tenantName = reservation.tenants?.restaurant_name || "Ristorante";

            await resend.emails.send({
                from: FROM_EMAIL,
                to: reservation.customer_email,
                subject: `Aggiornamento Prenotazione - ${tenantName}`,
                react: ReservationStatusEmail({
                    status: status,
                    restaurantName: tenantName,
                    customerName: reservation.customer_name,
                    date: reservation.reservation_date,
                    time: reservation.reservation_time,
                    guests: reservation.guests,
                    rejectionReason: rejectionReason,
                    restaurantPhone: "" // Could fetch from tenant if available in schema
                }),
            });
        } catch (emailError) {
            console.error("Email Sending Error (Customer):", emailError);
        }
    }

    revalidatePath('/dashboard/reservations');
    return { success: true };
}
