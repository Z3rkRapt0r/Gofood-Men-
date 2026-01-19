"use client";

import { useState, useEffect, useCallback } from "react";
import { Reservation, ReservationConfig, ReservationStatus } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, Link as LinkIcon, Copy, ExternalLink, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, LayoutGrid, Clock, Users } from "lucide-react";
import { RoomLayoutEditor } from "./RoomLayoutEditor";
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

    // Occupancy State
    const [occupancyDetails, setOccupancyDetails] = useState<Record<string, { time: string; guests: number; customerName: string; notes?: string }>>({});
    const [occupiedTableIds, setOccupiedTableIds] = useState<string[]>([]);

    const { data: tenant } = useTenant();
    const supabase = createClient();

    const publicLink = typeof window !== 'undefined' && tenant?.slug ? `${window.location.origin}/prenota/${tenant.slug}` : '';

    const fetchReservations = useCallback(async () => {
        if (!tenant?.id) return;

        setIsLoadingReservations(true);
        // Fetch reservations for the selected date (or all if needed, but per-date is better for large datasets)
        const { data, error } = await supabase
            .from('reservations')
            .select('*, reservation_assignments(table_id)')
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
                assignedTableIds: r.reservation_assignments
                    ? r.reservation_assignments.map((a: any) => a.table_id)
                    : []
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
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'reservation_assignments' }, // Filter by tenant difficult here, so we fetch all and let query filter
                () => {
                    fetchReservations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReservations, tenant?.id, supabase]);

    // Calculate Occupancy
    useEffect(() => {
        const occupiedIds = new Set<string>();
        const details: Record<string, { time: string; guests: number; customerName: string; notes?: string }> = {};

        reservations.forEach(res => {
            if (res.status === 'confirmed' &&
                res.date === selectedDate &&
                res.assignedTableIds &&
                res.assignedTableIds.length > 0) {

                res.assignedTableIds.forEach(id => {
                    occupiedIds.add(id);
                    details[id] = {
                        time: res.time,
                        guests: res.guests,
                        customerName: res.customerName,
                        notes: res.notes
                    };
                });
            }
        });

        setOccupiedTableIds(Array.from(occupiedIds));
        setOccupancyDetails(details);
    }, [reservations, selectedDate, config.tables]);

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

    // Derived State
    const filteredReservations = reservations.filter(r => r.date === selectedDate);
    filteredReservations.sort((a, b) => a.time.localeCompare(b.time));

    const pendingReservations = reservations
        .filter(r => r.date === selectedDate && r.status === 'pending')
        .sort((a, b) => a.time.localeCompare(b.time));

    const confirmedReservations = reservations
        .filter(r => r.date === selectedDate && r.status === 'confirmed')
        .sort((a, b) => a.time.localeCompare(b.time));

    const totalRemotePending = reservations.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard Sala</h2>
                    <p className="text-muted-foreground">Panoramica tavoli e agenda del giorno.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
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

                    <Button variant="outline" size="sm" onClick={onEditConfig}>
                        Configurazione
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
                            {isLoadingReservations ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmedReservations.length}
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

            {/* Main Content Area */}
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-lg capitalize">
                        {new Date(selectedDate).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN: VISUAL ROOM (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="h-full border-muted flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5" />
                                    Mappa Sala
                                </CardTitle>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-50 border border-green-200"></div> Libero</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Occupato</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[500px]">
                            <RoomLayoutEditor
                                tables={config.tables}
                                mode="view"
                                occupiedTableIds={occupiedTableIds}
                                occupancyDetails={occupancyDetails}
                                onUpdateTables={(newTables) => onUpdateConfig({ ...config, tables: newTables })}
                                allowEditExisting={false}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: AGENDA (1/3 width) */}
                <div className="space-y-6">
                    {/* SECTION 1: TO ACCEPT */}
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                        <CardHeader className="pb-2 bg-amber-50/50">
                            <CardTitle className="text-sm font-bold text-amber-700 uppercase tracking-wider flex justify-between items-center">
                                Da Accettare
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800">{pendingReservations.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            {pendingReservations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm italic">
                                    Nessuna richiesta in attesa.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {pendingReservations.map(res => (
                                        <div key={res.id} className="p-4 hover:bg-muted/20 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        {res.customerName}
                                                        {res.guests > 6 && <Badge variant="destructive" className="text-[10px] h-5 px-1">Gruppo</Badge>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-1">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {res.time.slice(0, 5)}</span>
                                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {res.guests} ospiti</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1 px-1 py-0.5 bg-muted rounded inline-block">
                                                        {res.customerPhone}
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => setReservationToAssign(res)}>
                                                    Assegna
                                                </Button>
                                            </div>
                                            {res.notes && (
                                                <div className="text-xs bg-muted/50 p-2 rounded text-muted-foreground italic border-l-2 border-primary/20">
                                                    "{res.notes}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SECTION 2: ACCEPTED / AGENDA */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                                Agenda Accettate
                                <Badge variant="outline">{confirmedReservations.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            {confirmedReservations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm italic">
                                    Nessuna prenotazione confermata oggi.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {confirmedReservations.map(res => (
                                        <div key={res.id} className="p-3 flex items-center justify-between hover:bg-muted/10 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-xs">
                                                    {res.time.slice(0, 5)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{res.customerName}</div>
                                                    <div className="text-xs text-muted-foreground">{res.guests}p • Tav. {(res.assignedTableIds || []).map(tid => config.tables.find(t => t.id === tid)?.name).join(', ')}</div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                                        <span className="sr-only">Menu</span>
                                                        <span className="text-muted-foreground">•••</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleArrive(res)}>Segna Arrivato</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCancel(res)} className="text-destructive">Annulla</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            {reservationToAssign && (
                <TableAssignmentDialog
                    isOpen={!!reservationToAssign}
                    onClose={() => setReservationToAssign(null)}
                    onConfirm={handleAssignmentConfirm}
                    reservation={reservationToAssign}
                    allTables={config.tables}
                    existingReservations={reservations}
                    onUpdateTables={(newTables) => onUpdateConfig({ ...config, tables: newTables })}
                />
            )}
        </div>
    );
}

// Dummy handlers
const handleArrive = (res: Reservation) => { toast.info(`Cliente ${res.customerName} arrivato!`); };
const handleCancel = (res: Reservation) => { toast.info(`Funzione annulla da implementare per ${res.customerName}`); };
