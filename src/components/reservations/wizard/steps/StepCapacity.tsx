import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReservationConfig } from "../../types";

interface StepCapacityProps {
    data: ReservationConfig;
    updateData: (data: Partial<ReservationConfig>) => void;
}

export function StepCapacity({ data, updateData }: StepCapacityProps) {
    return (
        <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="totalSeats" className="flex gap-1">
                    Numero Totale Posti a Sedere <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    id="totalSeats"
                    min="1"
                    placeholder="Es. 50"
                    value={data.totalSeats || ""}
                    onChange={(e) => updateData({ totalSeats: parseInt(e.target.value) || 0 })}
                    className={!data.totalSeats ? "border-amber-500" : ""}
                    required
                />
                <p className="text-sm text-muted-foreground">
                    I posti fissi totali (sedie standard) del locale. Campo obbligatorio.
                </p>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="totalHighChairs" className="flex gap-1">
                    Numero Totale Seggiolini <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="number"
                    id="totalHighChairs"
                    min="0"
                    placeholder="Es. 5"
                    value={data.totalHighChairs !== undefined ? data.totalHighChairs : ""}
                    onChange={(e) => updateData({ totalHighChairs: parseInt(e.target.value) || 0 })}
                    required
                />
                <p className="text-sm text-muted-foreground">
                    Risorse "Jolly" da assegnare al bisogno. Non scalano dai posti fissi.
                </p>
            </div>



            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="notificationEmail">Email Notifiche (Opzionale)</Label>
                <Input
                    type="email"
                    id="notificationEmail"
                    placeholder="prenotazioni@ristorante.it"
                    value={data.notificationEmail || ""}
                    onChange={(e) => updateData({ notificationEmail: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                    Dove vuoi ricevere le richieste. Se vuoto, useremo la tua email account.
                </p>
            </div>
        </div>
    );
}
