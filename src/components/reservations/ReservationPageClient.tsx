"use client";

import { ReservationConfig } from "@/components/reservations/types";
import { BookingForm } from "@/components/reservations/BookingForm";
import { Tenant } from "@/types/menu";
import Image from "next/image";

interface ReservationPageClientProps {
    tenant: Tenant;
    config: ReservationConfig;
}

export function ReservationPageClient({ tenant, config }: ReservationPageClientProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            {/* Branding Header */}
            <div className="text-center space-y-4">
                {tenant.logo_url ? (
                    <div className="relative w-40 h-32 mx-auto flex items-center justify-center mb-2">
                        <Image
                            src={tenant.logo_url}
                            alt={`${tenant.restaurant_name} Logo`}
                            width={160}
                            height={128}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-3xl">
                        {tenant.restaurant_name.charAt(0)}
                    </div>
                )}

                {/* Name and Subtitle removed as requested */}
            </div>

            {/* Booking Form */}
            <BookingForm
                config={config}
                tenantId={tenant.id}
                restaurantName={tenant.restaurant_name}
            />

            {/* Simple Footer */}
            <div className="mt-12 text-center text-xs text-muted-foreground pb-8">
                <a
                    href="https://gofoodmenu.it/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                >
                    <span>Powered by</span>
                    <Image
                        src="/logo-gofood-new.svg"
                        alt="Gofood Menu Logo"
                        width={80}
                        height={24}
                        className="h-6 w-auto"
                    />
                </a>
                <div className="flex justify-center gap-4 mt-2">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="/termini-e-condizioni" className="hover:underline">Termini di Servizio</a>
                </div>
            </div>
        </div>
    );
}
