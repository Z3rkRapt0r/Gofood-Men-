import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReservationConfig, ReservationShift } from "../../types";
import { X, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface StepTimeSlotsProps {
    data: ReservationConfig;
    updateData: (data: Partial<ReservationConfig>) => void;
}

export function StepTimeSlots({ data, updateData }: StepTimeSlotsProps) {
    const [name, setName] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const addShift = () => {
        if (name && start && end) {
            const newShift: ReservationShift = {
                id: uuidv4(),
                name,
                startTime: start,
                endTime: end,
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Default to all days
                isActive: true
            };
            updateData({ shifts: [...data.shifts, newShift] });
            setName("");
            setStart("");
            setEnd("");
        }
    };

    const removeShift = (id: string) => {
        updateData({ shifts: data.shifts.filter((s) => s.id !== id) });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Aggiungi Fascia Oraria
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="shiftName">Nome (es. Pranzo)</Label>
                        <Input
                            id="shiftName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Pranzo"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Inizio</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">Fine</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={addShift} disabled={!name || !start || !end} className="w-full md:w-auto self-end">
                    Aggiungi Fascia
                </Button>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Fasce Attive</h4>
                {data.shifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg">
                        Nessuna fascia oraria configurata.
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {data.shifts.map((shift) => (
                            <div
                                key={shift.id}
                                className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{shift.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {shift.startTime} - {shift.endTime} • Tutti i giorni
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeShift(shift.id)} className="text-muted-foreground hover:text-destructive">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
