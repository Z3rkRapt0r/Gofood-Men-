"use client";

import { useReservationConfig } from "@/hooks/useReservationConfig";
import { ReservationWizard } from "@/components/reservations/wizard/ReservationWizard";
import { ReservationsDashboard } from "@/components/reservations/ReservationsDashboard";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ReservationsPage() {
    const { config, saveConfig, isLoading } = useReservationConfig();
    const [isEditing, setIsEditing] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!config || isEditing) {
        return (
            <ReservationWizard
                initialData={config || undefined}
                onComplete={(newConfig) => {
                    saveConfig(newConfig);
                    setIsEditing(false);
                }}
            />
        );
    }

    return <ReservationsDashboard
        config={config}
        onEditConfig={() => setIsEditing(true)}
        onUpdateConfig={saveConfig}
    />;
}
