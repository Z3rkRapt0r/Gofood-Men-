"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoomLayoutEditor } from "./RoomLayoutEditor";
import { TableConfig, Reservation } from "./types";
import { Users, AlertTriangle, Baby } from "lucide-react";

interface TableAssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tableIds: string[]) => void;
    reservation: Reservation;
    allTables: TableConfig[];
    totalHighChairs: number;
    existingReservations: Reservation[];
    onUpdateTables?: (tables: TableConfig[]) => void;
}

export function TableAssignmentDialog({
    isOpen,
    onClose,
    onConfirm,
    reservation,
    allTables,
    totalHighChairs,
    existingReservations,
    onUpdateTables,
}: TableAssignmentDialogProps) {
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
    const [mode, setMode] = useState<'select' | 'edit'>('select');

    // Reset selection when dialog opens/changes
    useMemo(() => {
        setSelectedTableIds([]);
    }, [isOpen, reservation.id]);


    const { availableTables, occupiedTableIds, occupancyDetails, usedHighChairs, totalFreeSeats } = useMemo(() => {
        const occupiedIds = new Set<string>();
        const details: Record<string, { time: string; guests: number; highChairs: number; customerName: string; notes?: string }> = {};
        let usedHC = 0;

        existingReservations.forEach(res => {
            if (res.status === 'confirmed' && res.date === reservation.date) {
                usedHC += (res.highChairs || 0);

                if (res.assignedTableIds && res.assignedTableIds.length > 0) {
                    res.assignedTableIds.forEach(id => {
                        occupiedIds.add(id);
                        details[id] = {
                            time: res.time,
                            guests: res.guests,
                            highChairs: res.highChairs || 0,
                            customerName: res.customerName,
                            notes: res.notes
                        };
                    });
                }
            }
        });

        const available = allTables.filter(t => !occupiedIds.has(t.id));
        const freeSeats = available.reduce((sum, t) => sum + t.seats, 0);

        return {
            availableTables: available,
            occupiedTableIds: Array.from(occupiedIds),
            occupancyDetails: details,
            usedHighChairs: usedHC,
            totalFreeSeats: freeSeats
        };
    }, [allTables, existingReservations, reservation]);

    const toggleTable = (id: string) => {
        setSelectedTableIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const currentCapacity = useMemo(() => {
        return allTables
            .filter(t => selectedTableIds.includes(t.id))
            .reduce((sum, t) => sum + t.seats, 0);
    }, [selectedTableIds, allTables]);

    const isCapacitySufficient = currentCapacity >= reservation.guests;
    const progressValue = Math.min((currentCapacity / reservation.guests) * 100, 100);
    const missingSeats = Math.max(0, reservation.guests - currentCapacity);

    const availableHighChairs = Math.max(0, totalHighChairs - usedHighChairs);
    const neededHighChairs = reservation.highChairs || 0;
    const isHighChairSufficient = availableHighChairs >= neededHighChairs;


    const handleConfirm = () => {
        onConfirm(selectedTableIds);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl">Assegna Tavolo</DialogTitle>
                            <DialogDescription>
                                Cliente: <span className="font-medium text-foreground">{reservation.customerName}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-3 space-y-4 shrink-0 bg-background z-10">

                    {/* Restaurant Stats Bar */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/40">
                        <span className="font-semibold text-foreground">Disponibilità Sala:</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {totalFreeSeats} posti liberi</span>
                        <span className="w-px h-3 bg-border"></span>
                        <span className="flex items-center gap-1"><Baby className="w-3 h-3" /> {availableHighChairs} seggiolini liberi</span>
                    </div>



                    {/* Highchairs Status */}
                    {neededHighChairs > 0 && (
                        <div className="flex items-center justify-between text-sm py-2 px-3 bg-muted/40 rounded-md border border-border/50">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <Baby className="w-4 h-4" />
                                Seggiolini Richiesti: <span className="text-foreground font-medium">{neededHighChairs}</span>
                            </span>
                            <span className={isHighChairSufficient ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                                {isHighChairSufficient ? `Disponibili (${availableHighChairs} rimasti)` : `Non sufficienti (${availableHighChairs} rimasti)`}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto bg-muted/10 border-t border-b relative">
                    <RoomLayoutEditor
                        tables={allTables}
                        mode={mode}
                        selectedTableIds={selectedTableIds}
                        occupiedTableIds={occupiedTableIds}
                        occupancyDetails={occupancyDetails}
                        onTableClick={toggleTable}
                        onUpdateTables={onUpdateTables}
                        allowEditExisting={false}
                    />
                </div>

                <DialogFooter className="p-4 bg-muted/10 shrink-0">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleConfirm} disabled={selectedTableIds.length === 0}>
                        Conferma e Assegna
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
