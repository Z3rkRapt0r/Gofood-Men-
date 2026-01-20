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

                <div className="px-6 pb-4 space-y-4 shrink-0 bg-background z-10">
                    {/* Simplified Availability Display */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="flex flex-col items-center justify-center p-4 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider mb-1">Posti Liberi</span>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600" />
                                <span className="text-2xl font-black text-green-800">{totalFreeSeats}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-orange-50 border-2 border-orange-200 rounded-xl shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-orange-700 tracking-wider mb-1">Seggiolini Liberi</span>
                            <div className="flex items-center gap-2">
                                <Baby className="w-5 h-5 text-orange-600" />
                                <span className="text-2xl font-black text-orange-800">{availableHighChairs}</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert if highchairs are needed but low */}
                    {neededHighChairs > 0 && !isHighChairSufficient && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Attenzione: Non ci sono abbastanza seggiolini ({neededHighChairs} richiesti).</span>
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
