"use client";

import { useState, useEffect, useCallback } from "react";
import { Reservation, ReservationConfig, ReservationStatus } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, Link as LinkIcon, Copy, ExternalLink, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmailSettingsDialog } from "./EmailSettingsDialog";
import { TableAssignmentDialog } from "./TableAssignmentDialog";
import { useTenant } from "@/hooks/useTenant";
import { createClient } from "@/lib/supabase/client";
import { updateReservationStatus } from "@/app/actions/reservation-actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReservationsDashboardProps {
    config: ReservationConfig;
    onEditConfig: () => void;
    onUpdateConfig: (newConfig: ReservationConfig) => void;
}

export function ReservationsDashboard({ config, onEditConfig, onUpdateConfig }: ReservationsDashboardProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservationToAssign, setReservationToAssign] = useState<Reservation | null>(null);

    const { data: tenant } = useTenant();
    const supabase = createClient();

    const publicLink = typeof window !== 'undefined' && tenant?.slug ? `${window.location.origin}/prenota/${tenant.slug}` : '';

    const fetchReservations = useCallback(async () => {
        if (!tenant?.id) return;

        setIsLoadingReservations(true);
        // Fetch reservations for the selected date (or all if needed, but per-date is better for large datasets)
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('tenant_id', tenant.id);

        if (error) {
            console.error("Error fetching reservations:", error);
            toast.error("Errore nel caricamento delle prenotazioni");
        } else {
            const mappedData: Reservation[] = data.map((r: any) => ({
                id: r.id,
                customerName: r.customer_name,
                customerEmail: r.customer_email || "",
                customerPhone: r.customer_phone || "",
                guests: r.guests,
                highChairs: r.high_chairs || 0,
                date: r.reservation_date,
                time: r.reservation_time,
                status: r.status,
                createdAt: r.created_at,
                notes: r.notes || "",
                assignedTableIds: r.assigned_table_ids || []
            }));
            setReservations(mappedData);
        }
        setIsLoadingReservations(false);
    }, [tenant?.id, supabase]);

    useEffect(() => {
        fetchReservations();

        // Realtime subscription
        if (!tenant?.id) return;

        const channel = supabase
            .channel('reservations_realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'reservations', filter: `tenant_id=eq.${tenant.id}` },
                () => {
                    fetchReservations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReservations, tenant?.id, supabase]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink);
        toast.success("Link copiato negli appunti");
    }

    const handleUpdateEmail = (email: string) => {
        onUpdateConfig({ ...config, notificationEmail: email });
        toast.success("Email notifiche aggiornata");
    }

    const handleStatusChange = async (id: string, status: ReservationStatus) => {
        if (status === 'confirmed') {
            const res = reservations.find(r => r.id === id);
            if (res) setReservationToAssign(res);
            return;
        }

        // Optimistic update
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));

        // Rejection needs reason handling, but for now we send generic message
        const result = await updateReservationStatus(id, status as 'confirmed' | 'rejected');

        if (!result.success) {
            toast.error("Errore aggiornamento stato");
            fetchReservations(); // Revert on error
        } else {
            toast.success(`Prenotazione ${status === 'rejected' ? 'rifiutata' : 'aggiornata'}`);
        }
    };

    const handleAssignmentConfirm = async (tableIds: string[]) => {
        if (!reservationToAssign) return;

        const updatedRes = { ...reservationToAssign, status: 'confirmed' as const, assignedTableIds: tableIds };

        // Optimistic
        setReservations(prev => prev.map(r => r.id === reservationToAssign.id ? updatedRes : r));
        const reservationId = reservationToAssign.id;
        setReservationToAssign(null); // Close dialog immediately

        const result = await updateReservationStatus(
            reservationId,
            'confirmed',
            tableIds
        );

        if (!result.success) {
            toast.error("Errore assegnazione tavolo");
            fetchReservations();
        } else {
            toast.success("Prenotazione accettata e tavolo assegnato!");
        }
    };

    // Simple analysis of availability
    const getAvailabilityWarning = (reservation: Reservation) => {
        if (reservation.guests > 10) return "Attenzione: Gruppo numeroso.";
        return null;
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };

    const filteredReservations = reservations.filter(r => r.date === selectedDate);
    filteredReservations.sort((a, b) => a.time.localeCompare(b.time));

    const pendingCount = filteredReservations.filter(r => r.status === 'pending').length;
    const confirmedCount = filteredReservations.filter(r => r.status === 'confirmed').length;

    // Remote pending count across ALL dates (from fetched data)
    // If we only fetch ALL reservations, this is accurate. 
    // If we fetch only selected date, we lose this global counter.
    // For now, let's assume we fetch all since the query above doesn't filter by date.
    // Ideally we should have a separate count query, but for small scale Fetch All is fine.
    const totalRemotePending = reservations.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prenotazioni</h2>
                    <p className="text-muted-foreground">Gestisci le richieste di prenotazione tavoli.</p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Link Pubblico
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Link Prenotazione</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copia Link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={publicLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Apri Pagina
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={onEditConfig}>
                        Modifica Configurazione
                    </Button>
                    <EmailSettingsDialog config={config} onSave={handleUpdateEmail} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Attesa (Globali)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {isLoadingReservations ? <Loader2 className="h-4 w-4 animate-spin" /> : totalRemotePending}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confermate Oggi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoadingReservations ? <Loader2 className="h-4 w-4 animate-spin" /> : reservations.filter(r => r.status === 'confirmed' && r.date === new Date().toISOString().split('T')[0]).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Posti Totali</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{config.totalSeats}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tavoli</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{config.tables.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-h-[500px] flex flex-col">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                            <CardTitle>Gestione Giornaliera</CardTitle>
                        </div>

                        <div className="flex items-center gap-4 bg-background p-1 rounded-lg border shadow-sm">
                            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="font-medium min-w-[200px] text-center capitalize">
                                {formatDate(selectedDate)}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => changeDate(1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2 text-sm">
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {pendingCount} In Attesa
                            </Badge>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {confirmedCount} Confermate
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <div className="divide-y">
                        {isLoadingReservations ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p>Caricamento prenotazioni...</p>
                            </div>
                        ) : filteredReservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                                <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Nessuna prenotazione per questa data.</p>
                            </div>
                        ) : (
                            filteredReservations.map((res) => (
                                <div key={res.id} className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono font-bold text-lg bg-muted px-2 py-0.5 rounded-sm">
                                                {res.time}
                                            </span>
                                            <h4 className="font-semibold text-lg">{res.customerName}</h4>
                                            <Badge variant={res.status === 'confirmed' ? 'default' : res.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                {res.status === 'confirmed' ? 'Confermata' : res.status === 'rejected' ? 'Rifiutata' : 'In Attesa'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-foreground">{res.guests} Ospiti</span>
                                                {res.highChairs > 0 && <span>(+ {res.highChairs} seggiolini)</span>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {res.customerEmail}
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 mt-1">
                                                Note: <span className="italic">{res.notes || "-"}</span>
                                            </div>
                                        </div>

                                        {res.status === 'pending' && getAvailabilityWarning(res) && (
                                            <div className="mt-2 inline-flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium border border-amber-200">
                                                ⚠️ {getAvailabilityWarning(res)}
                                            </div>
                                        )}
                                    </div>

                                    {res.status === 'pending' && (
                                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                            <Button
                                                size="sm"
                                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusChange(res.id, 'confirmed')}
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Accetta
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent hover:border-destructive/20"
                                                onClick={() => handleStatusChange(res.id, 'rejected')}
                                            >
                                                <X className="w-4 h-4 mr-1" /> Rifiuta
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {reservationToAssign && (
                <TableAssignmentDialog
                    isOpen={!!reservationToAssign}
                    onClose={() => setReservationToAssign(null)}
                    onConfirm={handleAssignmentConfirm}
                    reservation={reservationToAssign}
                    allTables={config.tables}
                    existingReservations={reservations}
                />
            )}
        </div>
    );
}
