"use client";

import { TableConfig } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface TableEditFormProps {
    table: TableConfig;
    onUpdate: (updates: Partial<TableConfig>) => void;
    onDelete: () => void;
    mode?: 'create' | 'edit';
    onSave?: () => void;
}

export function TableEditForm({ table, onUpdate, onDelete, mode = 'edit', onSave }: TableEditFormProps) {
    return (
        <div className="space-y-4">
            {mode === 'edit' && (
                <div className="flex justify-end border-b pb-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Nome/Numero</Label>
                    <Input
                        value={table.name}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                        placeholder="Es. T1, Sala A..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Posti (Pax)</Label>
                    <Input
                        type="number"
                        min={1}
                        value={table.seats}
                        onChange={(e) => onUpdate({ seats: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={onSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {mode === 'create' ? 'Crea' : 'Salva'}
                </Button>
            </div>
        </div>
    );
}
