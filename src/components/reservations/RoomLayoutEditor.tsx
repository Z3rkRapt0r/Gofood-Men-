"use client";

import { useState } from "react";
import { TableConfig } from "./types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, LayoutGrid } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { TableEditForm } from "./TableEditForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RoomLayoutEditorProps {
    tables: TableConfig[];
    onUpdateTables?: (tables: TableConfig[]) => void;
    mode?: 'edit' | 'select' | 'view';
    selectedTableIds?: string[];
    onTableClick?: (tableId: string) => void;
    occupiedTableIds?: string[];
}

function GridTable({
    table,
    onSelect,
    selected,
    mode,
    isOccupied
}: {
    table: TableConfig,
    onSelect: (id: string) => void,
    selected: boolean,
    mode: 'edit' | 'select' | 'view',
    isOccupied?: boolean
}) {

    // Main table shape styles
    let shapeStyles = "relative flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-200 shadow-sm";

    // Status colors applied directly to the table shape
    if (isOccupied && mode !== 'edit') {
        shapeStyles += " bg-red-100 border-red-200 text-red-700 cursor-not-allowed opacity-60";
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
        if (name.length <= 6) return "text-sm";
        return "text-[10px] leading-tight break-all px-1";
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={cn(shapeStyles)}
                onClick={() => {
                    if (isOccupied && mode !== 'edit') return;
                    onSelect(table.id);
                }}
            >
                <span className={cn("font-bold text-center", getFontSize(table.name))}>
                    {table.name}
                </span>

                {selected && mode === 'select' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center text-[10px] shadow-sm">
                        ✓
                    </div>
                )}
            </div>

            <div className={`flex items-center gap-1 text-xs font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
                <Users className="w-3 h-3" />
                <span>{table.seats}</span>
            </div>
        </div>
    );
}


export function RoomLayoutEditor({
    tables,
    onUpdateTables,
    mode = 'edit',
    selectedTableIds = [],
    onTableClick,
    occupiedTableIds = []
}: RoomLayoutEditorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    // State for creating a new table
    const [newTable, setNewTable] = useState<TableConfig | null>(null);

    const handleTableClick = (id: string) => {
        if (mode === 'edit') {
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

            {/* Edit Dialog - For both Mobile and Desktop */}
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
        </div>
    );
}
