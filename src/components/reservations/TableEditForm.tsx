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
            <div className="pt-4 flex gap-2">
                {mode === 'edit' && (
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={onDelete}>
                        <Trash2 className="w-4 h-4 mr-2" /> Elimina
                    </Button>
                )}
                <Button onClick={onSave} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {mode === 'create' ? 'Crea' : 'Salva'}
                </Button>
            </div>
        </div>
    );
}
