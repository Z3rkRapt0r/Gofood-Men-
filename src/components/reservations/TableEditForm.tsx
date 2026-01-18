import { useState, useEffect } from "react";
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
    isNew?: boolean;
    onSave?: (table: TableConfig) => void;
}

export function TableEditForm({ table, onUpdate, onDelete, isNew = false, onSave }: TableEditFormProps) {
    const [formData, setFormData] = useState<TableConfig>(table);

    // Sync local state when table prop changes (important for switching selections)
    useEffect(() => {
        setFormData(table);
    }, [table]);

    const handleNameChange = (name: string) => {
        const newData = { ...formData, name };
        setFormData(newData);
        if (!isNew) {
            onUpdate({ name });
        }
    };

    const handleSeatsChange = (seats: number) => {
        const newData = { ...formData, seats: seats || 0 };
        setFormData(newData);
        if (!isNew) {
            onUpdate({ seats: newData.seats });
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave(formData);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-semibold">{isNew ? "Aggiungi Tavolo" : "Modifica Tavolo"}</h4>
                {!isNew && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="space-y-2">
                <Label>Nome/Numero</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Posti (Pax)</Label>
                <Input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => handleSeatsChange(parseInt(e.target.value))}
                />
            </div>

            {isNew && (
                <div className="pt-2 flex justify-end">
                    <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
                        Crea
                    </Button>
                </div>
            )}
        </div>
    );
}
