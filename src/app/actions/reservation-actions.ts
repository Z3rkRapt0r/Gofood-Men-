"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import NewReservationEmail from "@/components/emails/NewReservationEmail";
import ReservationStatusEmail from "@/components/emails/ReservationStatusEmail";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "reservations@gofoodmenu.it";

function logToFile(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'reservation-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file", e);
    }
}

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
    logToFile(`[submitReservation] Owner email: ${ownerEmail}`);

    if (ownerEmail) {
        // 3. Send Email to Owner
        try {
            logToFile(`[submitReservation] Attempting to send email to: ${ownerEmail}`);
            const data = await resend.emails.send({
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
                    dashboardUrl: "https://gofoodmenu.it/dashboard/reservations"
                }),
            });
            logToFile(`[submitReservation] Email sent result: ${JSON.stringify(data)}`);
            if (data.error) {
                logToFile(`[submitReservation] Resend Error: ${JSON.stringify(data.error)}`);
            }
        } catch (emailError) {
            logToFile(`[submitReservation] Email Sending Exception: ${JSON.stringify(emailError)}`);
            // We don't fail the request if email fails, but we log it
        }
    } else {
        logToFile(`[submitReservation] No owner email configured for tenant: ${formData.tenantId}`);
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

    // 1. Update Reservation Status
    logToFile(`[updateReservationStatus] Updating ${reservationId} to ${status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: statusError } = await (supabase.from('reservations') as any)
        .update({ status })
        .eq('id', reservationId);

    if (statusError) {
        logToFile(`[updateReservationStatus] Status Update Error: ${JSON.stringify(statusError)}`);
        console.error("Status Update Error:", statusError);
        return { success: false, error: "Database error updating status" };
    }

    // 2. Handle Table Assignments if confirmed
    if (status === 'confirmed') {
        logToFile(`[updateReservationStatus] Handling assignments for confirmed reservation: ${JSON.stringify(tableIds)}`);

        // 2a. Remove existing assignments
        const { error: deleteError } = await (supabase.from('reservation_assignments') as any)
            .delete()
            .eq('reservation_id', reservationId);

        if (deleteError) {
            logToFile(`[updateReservationStatus] Delete Assignments Error: ${JSON.stringify(deleteError)}`);
            console.error("Delete Assignments Error:", deleteError);
            // We log but continue, hoping to overwrite or that it was empty
        }

        // 2b. Insert new assignments
        if (tableIds.length > 0) {
            const assignments = tableIds.map(tId => ({
                reservation_id: reservationId,
                table_id: tId
            }));

            const { error: insertError } = await (supabase.from('reservation_assignments') as any)
                .insert(assignments);

            if (insertError) {
                logToFile(`[updateReservationStatus] Insert Assignments Error: ${JSON.stringify(insertError)}`);
                console.error("Insert Assignments Error:", insertError);
                return { success: false, error: "Database error assigning tables" };
            }
        }
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

            const subject = status === 'confirmed'
                ? `Prenotazione Confermata - ${tenantName}`
                : `La tua prenotazione è stata rifiutata - ${tenantName}`;

            await resend.emails.send({
                from: FROM_EMAIL,
                to: reservation.customer_email,
                subject: subject,
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
