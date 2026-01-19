import { useState, useEffect, useCallback } from 'react';
import { ReservationConfig, TableConfig, ReservationShift } from '@/components/reservations/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const DEFAULT_CONFIG: ReservationConfig = {
    isActive: false,
    totalSeats: 0,
    totalHighChairs: 0,
    tables: [],
    shifts: [],

};

export function useReservationConfig() {
    const [config, setConfig] = useState<ReservationConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No user found");
                setIsLoading(false);
                return;
            }

            // Get Tenant ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: tenants } = await (supabase.from('tenants') as any)
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!tenants) {
                console.error("No tenant found");
                setIsLoading(false);
                return;
            }
            const tenantId = tenants.id;

            // Fetch Settings
            const { data: settings } = await (supabase.from('reservation_settings') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            // If no settings exist, return null to trigger wizard
            if (!settings) {
                setConfig(null);
                setIsLoading(false);
                return;
            }

            // Fetch Tables
            const { data: tables } = await (supabase.from('reservation_tables') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            // Fetch Shifts
            const { data: shifts } = await (supabase.from('reservation_shifts') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('is_active', true);

            setConfig({
                isActive: settings.is_active,
                totalSeats: settings.total_seats,
                totalHighChairs: settings.total_high_chairs,
                notificationEmail: settings.notification_email,

                tables: tables?.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    seats: t.seats,
                    isActive: t.is_active
                })) || [],
                shifts: shifts?.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    daysOfWeek: s.days_of_week,
                    isActive: s.is_active
                })) || []
            });

        } catch (error) {
            console.error("Error fetching reservation config:", error);
            setConfig(null);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const saveConfig = async (newConfig: ReservationConfig) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Utente non autenticato");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: tenant } = await (supabase.from('tenants') as any)
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!tenant) throw new Error("Ristorante non trovato");

            // 1. Save Settings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: settingsError } = await (supabase.from('reservation_settings') as any)
                .upsert({
                    tenant_id: tenant.id,
                    is_active: newConfig.isActive,
                    total_seats: newConfig.totalSeats,
                    total_high_chairs: newConfig.totalHighChairs,
                    notification_email: newConfig.notificationEmail,
                    updated_at: new Date().toISOString()
                });

            if (settingsError) throw settingsError;

            // 2. Save Tables (Upsert & Delete)
            const tableIds = newConfig.tables.map(t => t.id);

            // Delete removed tables
            if (tableIds.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('reservation_tables') as any)
                    .delete()
                    .eq('tenant_id', tenant.id)
                    .not('id', 'in', `(${tableIds.join(',')})`);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('reservation_tables') as any)
                    .delete()
                    .eq('tenant_id', tenant.id);
            }

            if (newConfig.tables.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: tablesError } = await (supabase.from('reservation_tables') as any)
                    .upsert(
                        newConfig.tables.map((t, idx) => ({
                            id: t.id,
                            tenant_id: tenant.id,
                            name: t.name,
                            seats: t.seats,
                            display_order: idx,
                            is_active: t.isActive
                        }))
                    );
                if (tablesError) throw tablesError;
            }

            // 3. Save Shifts (Upsert & Delete)
            const shiftIds = newConfig.shifts.map(s => s.id);

            // Delete removed shifts
            if (shiftIds.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('reservation_shifts') as any)
                    .delete()
                    .eq('tenant_id', tenant.id)
                    .not('id', 'in', `(${shiftIds.join(',')})`);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('reservation_shifts') as any)
                    .delete()
                    .eq('tenant_id', tenant.id);
            }

            if (newConfig.shifts.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: shiftsError } = await (supabase.from('reservation_shifts') as any)
                    .upsert(
                        newConfig.shifts.map(s => ({
                            id: s.id,
                            tenant_id: tenant.id,
                            name: s.name,
                            start_time: s.startTime,
                            end_time: s.endTime,
                            days_of_week: s.daysOfWeek,
                            is_active: s.isActive
                        }))
                    );
                if (shiftsError) throw shiftsError;
            }

            setConfig(newConfig);
            toast.success("Configurazione salvata con successo!");

            // Refresh to ensure IDs and everything are synced
            fetchConfig();

        } catch (error) {
            console.error("Error saving config:", error);
            toast.error("Errore durante il salvataggio della configurazione");
        }
    };

    const clearConfig = () => {
        // Implement logic to deactivate or clear if needed
        setConfig(null);
    }

    return { config, saveConfig, clearConfig, isLoading };
}
