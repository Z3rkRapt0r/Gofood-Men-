"use client";

import { useState } from "react";
import { TableConfig } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, LayoutGrid, Clock, Baby } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { TableEditForm } from "./TableEditForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface RoomLayoutEditorProps {
    tables: TableConfig[];
    onUpdateTables?: (tables: TableConfig[]) => void;
    mode?: 'edit' | 'select' | 'view';
    selectedTableIds?: string[];
    onTableClick?: (tableId: string) => void;
    occupiedTableIds?: string[];
    allowEditExisting?: boolean;
    occupancyDetails?: Record<string, { time: string; guests: number; highChairs: number; customerName: string; notes?: string }>;
}

function GridTable({
    table,
    onSelect,
    selected,
    mode,
    isOccupied,
    occupancyInfo
}: {
    table: TableConfig,
    onSelect: (id: string) => void,
    selected: boolean,
    mode: 'edit' | 'select' | 'view',
    isOccupied?: boolean,
    occupancyInfo?: { time: string; guests: number; highChairs: number; customerName: string; notes?: string }
}) {

    // Main table shape styles
    let shapeStyles = "relative flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-200 shadow-sm";

    // Status colors applied directly to the table shape
    if (isOccupied && mode !== 'edit') {
        shapeStyles += " bg-red-100 border-red-200 text-red-700 cursor-pointer hover:bg-red-200";
    } else if (selected) {
        shapeStyles += " bg-primary text-primary-foreground border-primary ring-offset-2 ring-2 ring-primary cursor-pointer scale-105";
    } else {
        if (mode === 'edit') {
            shapeStyles += " bg-card hover:bg-accent border-muted-foreground/20 cursor-pointer";
        } else {
            // Select mode (available)
            shapeStyles += " bg-green-50 hover:bg-green-100 border-green-200 text-green-700 cursor-pointer";
        }
    }

    // Dynamic font size based on name length
    const getFontSize = (name: string) => {
        if (name.length <= 2) return "text-xl";
        if (name.length <= 3) return "text-lg";
        if (name.length <= 4) return "text-base";
        return "text-xs";
    };

    return (
        <div
            className={cn(shapeStyles)}
            onClick={() => onSelect(table.id)}
        >
            <div className="flex flex-col items-center justify-center text-center p-0.5 w-full">
                {isOccupied && occupancyInfo && mode !== 'edit' ? (
                    // Occupied View: Minimal info
                    <div className="flex flex-col items-center justify-center space-y-0.5">
                        <span className="font-bold text-[10px] leading-tight truncate w-14 block">
                            {table.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                            <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-0.5" />
                                {occupancyInfo.time.slice(0, 5)}
                            </div>
                        </div>
                        <div className="flex items-center text-[10px]">
                            <Users className="w-3 h-3 mr-0.5 text-gray-700" />
                            {occupancyInfo.guests - (occupancyInfo.highChairs || 0)}
                            {(occupancyInfo.highChairs || 0) > 0 && (
                                <span className="flex items-center ml-1 text-orange-700 font-bold">
                                    +<Baby className="w-3 h-3 mr-0.5" />{occupancyInfo.highChairs}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    // Normal View
                    <>
                        <span className={`font-bold leading-none ${getFontSize(table.name)}`}>
                            {table.name}
                        </span>
                        <div className="flex items-center mt-1 text-xs opacity-70 font-medium">
                            <Users className="w-3 h-3 mr-0.5" />
                            {table.seats}
                        </div>
                    </>
                )}
            </div>
            {/* Selection/Occupied Indicator */}
            {selected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm text-[10px] border border-white">
                    ✓
                </div>
            )}
        </div>
    );
}


export function RoomLayoutEditor({
    tables,
    onUpdateTables,
    mode = 'view',
    selectedTableIds = [],
    onTableClick,
    occupiedTableIds = [],
    allowEditExisting = true,
    occupancyDetails
}: RoomLayoutEditorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    // State for creating a new table
    const [newTable, setNewTable] = useState<TableConfig | null>(null);
    const [viewOccupiedTable, setViewOccupiedTable] = useState<{ id: string, name: string, info: any } | null>(null);

    const handleTableClick = (id: string) => {
        // Handle click on occupied table for summary
        if (occupiedTableIds && occupiedTableIds.includes(id) && mode !== 'edit') {
            if (occupancyDetails && occupancyDetails[id]) {
                const table = tables.find(t => t.id === id);
                setViewOccupiedTable({
                    id,
                    name: table?.name || "??",
                    info: occupancyDetails[id]
                });
            }
            return;
        }

        if (mode === 'edit') {
            if (!allowEditExisting) return; // Prevent editing existing tables if disabled

            setSelectedId(id);
            setNewTable(null); // Ensure we are not in create mode
            setIsEditDialogOpen(true);
        } else if (onTableClick) {
            onTableClick(id);
        }
    };

    const addTable = () => {
        if (!onUpdateTables) return;
        const tempTable: TableConfig = {
            id: uuidv4(),
            name: `T${tables.length + 1}`,
            seats: 4,
            isActive: true
        };
        // Do NOT add to tables yet
        setNewTable(tempTable);
        setSelectedId(null); // Ensure no existing table is selected
        setIsEditDialogOpen(true);
    };

    const handleCreateConfirm = (createdTable: TableConfig) => {
        if (!onUpdateTables) return;
        onUpdateTables([...tables, createdTable]);
        setNewTable(null);
        setIsEditDialogOpen(false);
    };

    const handleEditConfirm = (updatedTable: TableConfig) => {
        if (!selectedId || !onUpdateTables) return;
        onUpdateTables(tables.map(t =>
            t.id === selectedId ? updatedTable : t
        ));
        setIsEditDialogOpen(false);
    };

    const deleteSelectedTable = () => {
        if (!selectedId || !onUpdateTables) return;
        onUpdateTables(tables.filter(t => t.id !== selectedId));
        setSelectedId(null);
    };

    const selectedTable = tables.find(t => t.id === selectedId);

    // Determine what to show in the dialog
    const editingTable = newTable || selectedTable;
    const isCreating = !!newTable;

    return (
        <div className="flex flex-col space-y-4">
            {mode === 'edit' && (
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 ml-2 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Gestione Sala (Griglia)</h3>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={addTable}>
                            <Plus className="w-4 h-4 mr-1" /> Aggiungi Tavolo
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {/* Visual Grid Area */}
                <div className="col-span-full">
                    <div
                        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4 min-h-[300px] bg-muted/10 border-2 border-dashed border-muted-foreground/10 rounded-lg"
                    >
                        {tables.map(table => (
                            <GridTable
                                key={table.id}
                                table={table}
                                onSelect={handleTableClick}
                                selected={mode === 'edit' ? selectedId === table.id : selectedTableIds.includes(table.id)}
                                mode={mode}
                                isOccupied={occupiedTableIds.includes(table.id)}
                                occupancyInfo={occupancyDetails ? occupancyDetails[table.id] : undefined}
                            />
                        ))}
                        {tables.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12">
                                <LayoutGrid className="w-12 h-12 mb-2 opacity-20" />
                                <p>Nessun tavolo presente</p>
                                {mode === 'edit' && <p className="text-sm">Clicca "Aggiungi Tavolo" per iniziare</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>{isCreating ? "Aggiungi Tavolo" : "Modifica Tavolo"}</DialogTitle>
                    </DialogHeader>
                    {editingTable && (
                        <TableEditForm
                            table={editingTable}
                            onUpdate={() => { }} // No-op, updates handled by onSave
                            onDelete={() => {
                                deleteSelectedTable();
                                setIsEditDialogOpen(false);
                            }}
                            isNew={isCreating}
                            onSave={isCreating ? handleCreateConfirm : handleEditConfirm}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Occupied Table Summary Dialog */}
            <Dialog open={!!viewOccupiedTable} onOpenChange={(open) => !open && setViewOccupiedTable(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Tavolo {viewOccupiedTable?.name} - Occupato</DialogTitle>
                    </DialogHeader>

                    {viewOccupiedTable && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="font-medium text-muted-foreground">Cliente:</div>
                                <div className="col-span-2 font-medium">{viewOccupiedTable.info.customerName}</div>

                                <div className="font-medium text-muted-foreground">Orario:</div>
                                <div className="col-span-2">{viewOccupiedTable.info.time.slice(0, 5)}</div>

                                <div className="font-medium text-muted-foreground">Ospiti:</div>
                                <div className="col-span-2">{viewOccupiedTable.info.guests} persone</div>

                                {viewOccupiedTable.info.notes && (
                                    <>
                                        <div className="font-medium text-muted-foreground">Note:</div>
                                        <div className="col-span-2 italic text-muted-foreground">"{viewOccupiedTable.info.notes}"</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setViewOccupiedTable(null)}>Chiudi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
