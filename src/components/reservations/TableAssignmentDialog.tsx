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
import { RoomLayoutEditor } from "./RoomLayoutEditor";
import { TableConfig, Reservation } from "./types";
import { Users, AlertTriangle } from "lucide-react";

interface TableAssignmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tableIds: string[]) => void;
    reservation: Reservation;
    allTables: TableConfig[];
    existingReservations: Reservation[];
}

export function TableAssignmentDialog({
    isOpen,
    onClose,
    onConfirm,
    reservation,
    allTables,
    existingReservations,
}: TableAssignmentDialogProps) {
    const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

    // Reset selection when dialog opens/changes
    useMemo(() => {
        setSelectedTableIds([]);
    }, [isOpen, reservation.id]);


    const { availableTables, occupiedTableIds } = useMemo(() => {
        const occupiedIds = new Set<string>();

        existingReservations.forEach(res => {
            if (res.status === 'confirmed' &&
                res.date === reservation.date &&
                res.time === reservation.time &&
                res.assignedTableIds) {

                res.assignedTableIds.forEach(id => occupiedIds.add(id));
            }
        });

        return {
            availableTables: allTables.filter(t => !occupiedIds.has(t.id)),
            occupiedTableIds: Array.from(occupiedIds)
        };
    }, [allTables, existingReservations, reservation]);

    const suggestions = useMemo(() => {
        const perfectMatches = availableTables
            .filter(t => t.seats >= reservation.guests)
            .sort((a, b) => a.seats - b.seats);

        const combinations: { tables: TableConfig[], totalSeats: number }[] = [];

        for (let i = 0; i < availableTables.length; i++) {
            for (let j = i + 1; j < availableTables.length; j++) {
                const t1 = availableTables[i];
                const t2 = availableTables[j];
                const combinedSeats = t1.seats + t2.seats;
                if (combinedSeats >= reservation.guests) {
                    combinations.push({ tables: [t1, t2], totalSeats: combinedSeats });
                }
            }
        }

        combinations.sort((a, b) => a.totalSeats - b.totalSeats);

        return { single: perfectMatches, pairs: combinations.slice(0, 3) };
    }, [availableTables, reservation.guests]);

    const toggleTable = (id: string) => {
        setSelectedTableIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectSuggestion = (ids: string[]) => {
        setSelectedTableIds(ids);
    };

    const currentCapacity = useMemo(() => {
        return allTables
            .filter(t => selectedTableIds.includes(t.id))
            .reduce((sum, t) => sum + t.seats, 0);
    }, [selectedTableIds, allTables]);

    const isCapacitySufficient = currentCapacity >= reservation.guests;

    const handleConfirm = () => {
        onConfirm(selectedTableIds);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assegna Tavolo per {reservation.customerName}</DialogTitle>
                    <DialogDescription>
                        Richiesti: <span className="font-bold text-foreground">{reservation.guests} posti</span>.
                        Seleziona i tavoli dalla griglia sottostante.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">

                    {/* Suggestions Section */}
                    {(suggestions.single.length > 0 || suggestions.pairs.length > 0) && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Suggerimenti Rapidi</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.single.slice(0, 2).map((table) => (
                                    <Button
                                        key={table.id}
                                        variant="outline"
                                        size="sm"
                                        className={`justify-start h-auto py-2 ${selectedTableIds.length === 1 && selectedTableIds[0] === table.id ? 'border-primary bg-primary/5' : ''}`}
                                        onClick={() => selectSuggestion([table.id])}
                                    >
                                        <Users className="w-3 h-3 mr-2 text-muted-foreground" />
                                        <span>{table.name} ({table.seats}p)</span>
                                    </Button>
                                ))}
                                {suggestions.pairs.map((combo, idx) => (
                                    <Button
                                        key={`combo-${idx}`}
                                        variant="outline"
                                        size="sm"
                                        className={`justify-start h-auto py-2 ${JSON.stringify(selectedTableIds.sort()) === JSON.stringify(combo.tables.map(t => t.id).sort()) ? 'border-primary bg-primary/5' : ''}`}
                                        onClick={() => selectSuggestion(combo.tables.map(t => t.id))}
                                    >
                                        <Users className="w-3 h-3 mr-2 text-muted-foreground" />
                                        <span>Unione: {combo.tables.map(t => t.name).join("+")} ({combo.totalSeats}p)</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Visual Map Selection */}
                    <div className="border rounded-md overflow-hidden">
                        <RoomLayoutEditor
                            tables={allTables}
                            mode="select"
                            selectedTableIds={selectedTableIds}
                            occupiedTableIds={occupiedTableIds}
                            onTableClick={toggleTable}
                        />
                    </div>

                    {/* Summary/Warning */}
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm">
                            Selezionati: <span className="font-bold">{selectedTableIds.length} tavoli</span> ({currentCapacity} posti)
                        </div>
                        {!isCapacitySufficient && currentCapacity > 0 && (
                            <div className="flex items-center text-amber-600 text-sm font-medium">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Capacità insuff.
                            </div>
                        )}
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleConfirm} disabled={selectedTableIds.length === 0}>
                        Conferma e Assegna
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
