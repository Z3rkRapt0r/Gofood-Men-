import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReservationConfig, ReservationShift } from "../../types";
import { X, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";

interface StepTimeSlotsProps {
    data: ReservationConfig;
    updateData: (data: Partial<ReservationConfig>) => void;
}

const DAYS = [
    { id: 1, label: "Lun" },
    { id: 2, label: "Mar" },
    { id: 3, label: "Mer" },
    { id: 4, label: "Gio" },
    { id: 5, label: "Ven" },
    { id: 6, label: "Sab" },
    { id: 0, label: "Dom" },
];

export function StepTimeSlots({ data, updateData }: StepTimeSlotsProps) {
    const [name, setName] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

    const addShift = () => {
        if (name && start && end && selectedDays.length > 0) {
            const newShift: ReservationShift = {
                id: uuidv4(),
                name,
                startTime: start,
                endTime: end,
                daysOfWeek: selectedDays,
                isActive: true
            };
            updateData({ shifts: [...data.shifts, newShift] });
            setName("");
            setStart("");
            setEnd("");
            // Non resettiamo i giorni per comodità
        }
    };

    const removeShift = (id: string) => {
        updateData({ shifts: data.shifts.filter((s) => s.id !== id) });
    };

    const toggleDay = (dayId: number) => {
        setSelectedDays(prev =>
            prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId]
        );
    };

    const formatDays = (days: number[]) => {
        if (days.length === 7) return "Tutti i giorni";
        if (days.length === 0) return "Nessun giorno";

        // Ordina per lunedì (1) -> domenica (0) per visualizzazione
        const sortedDays = [...days].sort((a, b) => {
            const aAdjusted = a === 0 ? 7 : a;
            const bAdjusted = b === 0 ? 7 : b;
            return aAdjusted - bAdjusted;
        });

        return sortedDays.map(d => DAYS.find(day => day.id === d)?.label).join(", ");
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuovo Orario
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="shiftName">Nome (es. Cena)</Label>
                        <Input
                            id="shiftName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Cena"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Dalle</Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endTime">Alle</Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>In quali giorni?</Label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS.map((day) => (
                            <div key={day.id} className="flex items-center space-x-2 border rounded-md p-2 bg-background">
                                <Checkbox
                                    id={`day-${day.id}`}
                                    checked={selectedDays.includes(day.id)}
                                    onCheckedChange={() => toggleDay(day.id)}
                                />
                                <Label htmlFor={`day-${day.id}`} className="cursor-pointer">{day.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={addShift} disabled={!name || !start || !end || selectedDays.length === 0} className="w-full md:w-auto self-end">
                    Aggiungi
                </Button>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Orari salvati</h4>
                {data.shifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg">
                        Non hai ancora aggiunto orari.
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
                                            {shift.startTime} - {shift.endTime} • {formatDays(shift.daysOfWeek)}
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
