"use client";

import { useState, useEffect, useCallback } from "react";
import { Reservation, ReservationConfig, ReservationStatus } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, Link as LinkIcon, Copy, ExternalLink, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, LayoutGrid, Clock, Users, Baby, Settings2 } from "lucide-react";
import { RoomLayoutEditor } from "./RoomLayoutEditor";
import { toast } from "sonner";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReservationsDashboardProps {
    config: ReservationConfig;
    onEditConfig: () => void;
    onUpdateConfig: (newConfig: ReservationConfig) => void;
}

import { getTodayItaly } from "@/lib/date-utils";

export function ReservationsDashboard({ config, onEditConfig, onUpdateConfig }: ReservationsDashboardProps) {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);
    const [selectedDate, setSelectedDate] = useState(getTodayItaly());
    const [reservationToAssign, setReservationToAssign] = useState<Reservation | null>(null);
    const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
    const [reservationToReject, setReservationToReject] = useState<Reservation | null>(null);

    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    // Occupancy State
    const [occupancyDetails, setOccupancyDetails] = useState<Record<string, { time: string; guests: number; highChairs: number; customerName: string; notes?: string }>>({});
    const [occupiedTableIds, setOccupiedTableIds] = useState<string[]>([]);
    const [isRoomEditMode, setIsRoomEditMode] = useState(false);

    const { data: tenant } = useTenant();
    const supabase = createClient();

    const publicLink = typeof window !== 'undefined' && tenant?.slug ? `${window.location.origin}/prenota/${tenant.slug}` : '';

    const fetchReservations = useCallback(async () => {
        if (!tenant?.id) return;

        setIsLoadingReservations(true);
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

        if (!tenant?.id) return;

        const channel = supabase
            .channel('reservations_realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'reservations', filter: `tenant_id=eq.${tenant.id}` },
                () => { fetchReservations(); }
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'reservation_assignments' },
                () => { fetchReservations(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchReservations, tenant?.id, supabase]);

    // Calculate Occupancy
    useEffect(() => {
        const occupiedIds = new Set<string>();
        const details: Record<string, { time: string; guests: number; highChairs: number; customerName: string; notes?: string }> = {};

        reservations.forEach(res => {
            if ((res.status === 'confirmed' || res.status === 'arrived') &&
                res.date === selectedDate &&
                res.assignedTableIds &&
                res.assignedTableIds.length > 0) {

                res.assignedTableIds.forEach(id => {
                    occupiedIds.add(id);
                    details[id] = {
                        time: res.time.slice(0, 5),
                        guests: res.guests,
                        highChairs: res.highChairs || 0,
                        customerName: res.customerName,
                        notes: res.notes
                    };
                });
            }
        });

        setOccupiedTableIds(Array.from(occupiedIds));
        setOccupancyDetails(details);
    }, [reservations, selectedDate, config.tables]);

    const handleAssignmentConfirm = async (tableIds: string[]) => {
        if (!reservationToAssign) return;

        try {
            const result = await updateReservationStatus(reservationToAssign.id, 'confirmed', tableIds);
            if (result.success) {
                toast.success("Tavolo assegnato con successo");
                setReservationToAssign(null);
                fetchReservations();
            } else {
                toast.error(result.error || "Errore assegnazione tavolo");
            }
        } catch (e) {
            toast.error("Errore di rete");
        }
    };

    // Simple analysis of availability
    const getAvailabilityWarning = (reservation: Reservation) => {
        if (reservation.guests > 10) return "Attenzione: Gruppo numeroso.";
        return null;
    };

    const handleArrive = async (res: Reservation) => {
        const result = await updateReservationStatus(res.id, 'arrived');
        if (result.success) {
            toast.success(`Cliente ${res.customerName} arrivato`);
            fetchReservations();
        } else {
            toast.error("Errore aggiornamento stato");
        }
    };

    const handleCancel = async (res: Reservation) => {
        const result = await updateReservationStatus(res.id, 'cancelled');
        if (result.success) {
            toast.success("Prenotazione annullata");
            fetchReservations();
        } else {
            toast.error("Errore nell'annullamento");
        }
        setReservationToCancel(null);
    };

    const handleReject = async (res: Reservation) => {
        const result = await updateReservationStatus(res.id, 'rejected');
        if (result.success) {
            toast.success("Prenotazione rifiutata");
            fetchReservations();
        } else {
            toast.error("Errore nel rifiuto della prenotazione");
        }
        setReservationToReject(null);
    };

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        // Ensure we format back to YYYY-MM-DD
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Filter Logic
    // Filter Logic
    // Show ALL pending reservations regardless of date (Inbox Style)
    const pendingReservations = reservations
        .filter(r => r.status === 'pending')
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
        });

    const confirmedReservations = reservations
        .filter(r => r.date === selectedDate && r.status === 'confirmed')
        .sort((a, b) => a.time.localeCompare(b.time));

    // Occupancy percentage logic
    const totalCapacity = config.tables.reduce((acc, t) => acc + t.seats, 0);
    const occupiedTableSeats = config.tables
        .filter(t => occupiedTableIds.includes(t.id))
        .reduce((acc, t) => acc + t.seats, 0);

    const occupancyPercentage = totalCapacity > 0 ? Math.round((occupiedTableSeats / totalCapacity) * 100) : 0;


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Prenotazioni</h2>
                    <p className="text-muted-foreground">Panoramica tavoli e agenda del giorno.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Public Link Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 mr-2 px-2 sm:px-4">
                                <LinkIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Link Prenotazione</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Link Pubblico</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                                if (typeof window !== 'undefined') {
                                    navigator.clipboard.writeText(publicLink);
                                    toast.success("Link copiato negli appunti!");
                                }
                            }}>
                                <Copy className="mr-2 h-4 w-4" /> Copia Link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={publicLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Apri Pagina
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-border mx-2" />

                    {/* Agenda Popup Trigger */}
                    <Dialog open={isAgendaOpen} onOpenChange={setIsAgendaOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" className="gap-2 px-2 sm:px-4">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Agenda</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95%] sm:w-full max-w-3xl h-[80vh] flex flex-col rounded-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <span>Agenda Giornaliera</span>
                                </DialogTitle>
                            </DialogHeader>

                            {/* Date Navigation inside Popup */}
                            <div className="flex items-center justify-between bg-muted/20 p-2 rounded-lg border mb-4">
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

                            {/* Popup Content: Agenda List */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                {confirmedReservations.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                        <span className="text-sm">Nessuna prenotazione per questa data</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute left-[3.5rem] top-0 bottom-0 w-px bg-gray-100 z-0 hidden sm:block"></div>
                                        {confirmedReservations.map(res => (
                                            <div key={res.id} className="relative z-10 flex items-center group hover:bg-gray-50/80 transition-colors border-b last:border-0 border-gray-50 py-3 px-4">
                                                <div className="w-14 items-center justify-center hidden sm:flex shrink-0">
                                                    <div className="font-mono font-bold text-gray-500 text-xs bg-gray-100 px-1.5 py-0.5 rounded-md group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                                                        {res.time.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <div className="w-4 flex justify-center hidden sm:flex shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary group-hover:scale-125 transition-all"></div>
                                                </div>
                                                <div className="flex-1 min-w-0 ml-0 sm:ml-4 flex justify-between items-center">
                                                    <div className="space-y-0.5 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm text-gray-900 truncate">{res.customerName}</span>
                                                            <span className="sm:hidden font-mono text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{res.time.slice(0, 5)}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                                            <Users className="w-3 h-3" />
                                                            <span>{res.guests} ospiti</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-primary/70 font-medium">
                                                                {(res.assignedTableIds || []).length > 0
                                                                    ? `Tav. ${res.assignedTableIds!.map(tid => config.tables.find(t => t.id === tid)?.name).join(', ')}`
                                                                    : 'Non assegnato'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                        onClick={() => setReservationToCancel(res)}
                                                        title="Annulla"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" onClick={onEditConfig} className="px-2 sm:px-4">
                        <span className="hidden sm:inline">Configurazione</span>
                        <span className="sm:hidden">Setup</span>
                    </Button>
                </div>
            </div>

            {/* Pending Reservations List */}
            <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col bg-orange-50/50 rounded-xl border border-orange-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/80 backdrop-blur-sm flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-100 p-1.5 rounded-md text-orange-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-orange-950 text-sm tracking-tight">Da Accettare</span>
                        </div>
                        <Badge variant="secondary" className="bg-white text-orange-700 shadow-sm border-orange-100 font-mono">
                            {pendingReservations.length}
                        </Badge>
                    </div>

                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pendingReservations.length === 0 ? (
                            <div className="col-span-full h-32 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2 border-2 border-dashed border-orange-100 rounded-lg">
                                <Check className="w-8 h-8 text-orange-300" />
                                <span className="text-sm font-medium text-orange-800/50">Nessuna richiesta in attesa</span>
                            </div>
                        ) : (
                            pendingReservations.map(res => (
                                <div key={res.id} className="group bg-white rounded-lg border border-orange-100 shadow-sm p-3 hover:shadow-md hover:border-orange-200 transition-all duration-200">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{res.customerName}</span>
                                                {res.guests > 6 && <Badge variant="destructive" className="text-[10px] py-0 h-4 px-1 rounded-sm">Gruppo</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 font-medium text-orange-700/80 bg-orange-50 px-1.5 py-0.5 rounded text-[11px]">
                                                    {new Date(res.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} {res.time.slice(0, 5)}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    {/* Adults */}
                                                    <span className="flex items-center gap-1 text-gray-700">
                                                        <Users className="w-3.5 h-3.5" />
                                                        <span>{res.guests - res.highChairs}</span>
                                                    </span>

                                                    {/* Children */}
                                                    {res.highChairs > 0 && (
                                                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md text-[11px] font-medium border border-orange-100">
                                                            <span>+</span>
                                                            <Baby className="w-3.5 h-3.5" />
                                                            <span>{res.highChairs}</span>
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                onClick={() => setReservationToReject(res)}
                                                title="Rifiuta"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-3 bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow active:scale-95 transition-all text-xs font-medium rounded-full"
                                                onClick={() => setReservationToAssign(res)}
                                            >
                                                Accetta
                                            </Button>
                                        </div>
                                    </div>
                                    {res.notes && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 italic">
                                            "{res.notes}"
                                        </div>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                                        <span>{res.customerPhone}</span>
                                        <span className="font-mono">#{res.id.slice(0, 4)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Date Navigation (Visible on Dashboard) */}
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




            {/* Bottom Section: Map */}
            <div className="space-y-4">
                <Card className="h-full border-muted flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5" />
                                    Mappa Sala
                                </CardTitle>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-sm text-muted-foreground mt-1 sm:mt-0">
                                    <span className="font-medium">Occupazione: {occupancyPercentage}%</span>
                                    <div className="w-full sm:w-32 bg-secondary/50 h-2.5 rounded-full overflow-hidden border border-border/20 shadow-inner">
                                        <div
                                            className={`h-full transition-all duration-500 ${occupancyPercentage >= 90 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : occupancyPercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-4 text-xs text-muted-foreground mr-4 hidden sm:flex">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-50 border border-green-200"></div> Libero</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Occupato</div>
                                </div>
                                <Button
                                    variant={isRoomEditMode ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setIsRoomEditMode(!isRoomEditMode)}
                                    className="gap-2"
                                >
                                    {isRoomEditMode ? (
                                        <>
                                            <Check className="w-4 h-4" /> Termina Modifica
                                        </>
                                    ) : (
                                        <>
                                            <Settings2 className="w-4 h-4" /> Gestisci Sala
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[500px]">
                        <RoomLayoutEditor
                            tables={config.tables}
                            mode={isRoomEditMode ? 'edit' : 'view'}
                            occupiedTableIds={occupiedTableIds}
                            occupancyDetails={occupancyDetails}
                            onUpdateTables={(newTables) => onUpdateConfig({ ...config, tables: newTables })}
                            allowEditExisting={isRoomEditMode}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            {reservationToAssign && (
                <TableAssignmentDialog
                    isOpen={!!reservationToAssign}
                    onClose={() => setReservationToAssign(null)}
                    onConfirm={handleAssignmentConfirm}
                    reservation={reservationToAssign}
                    allTables={config.tables}
                    totalHighChairs={config.totalHighChairs}
                    existingReservations={reservations}
                    onUpdateTables={(newTables) => onUpdateConfig({ ...config, tables: newTables })}
                />
            )}

            {/* Confirmation Dialogs */}
            <AlertDialog open={!!reservationToReject} onOpenChange={(open) => !open && setReservationToReject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vuoi davvero rifiutare la prenotazione di <strong>{reservationToReject?.customerName}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => reservationToReject && handleReject(reservationToReject)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Sì, rifiuta
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!reservationToCancel} onOpenChange={(open) => !open && setReservationToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Conferma Annullamento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Stai per annullare la prenotazione di <strong>{reservationToCancel?.customerName}</strong>. L'operazione non è reversibile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Sospendi</AlertDialogCancel>
                        <AlertDialogAction onClick={() => reservationToCancel && handleCancel(reservationToCancel)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Annulla Prenotazione
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


