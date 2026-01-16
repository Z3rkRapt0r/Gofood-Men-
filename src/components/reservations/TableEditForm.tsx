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
}

export function TableEditForm({ table, onUpdate, onDelete }: TableEditFormProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-semibold">Modifica Tavolo</h4>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-2">
                <Label>Nome/Numero</Label>
                <Input
                    value={table.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Posti (Pax)</Label>
                <Input
                    type="number"
                    value={table.seats}
                    onChange={(e) => onUpdate({ seats: parseInt(e.target.value) || 0 })}
                />
            </div>

        </div>
    );
}
