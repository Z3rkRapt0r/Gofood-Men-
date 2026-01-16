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
                <Label htmlFor="totalSeats">Numero Totale Posti a Sedere</Label>
                <Input
                    type="number"
                    id="totalSeats"
                    placeholder="Es. 50"
                    value={data.totalSeats || ""}
                    onChange={(e) => updateData({ totalSeats: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">
                    Indica la capienza massima del tuo locale.
                </p>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="totalHighChairs">Numero Totale Seggiolini</Label>
                <Input
                    type="number"
                    id="totalHighChairs"
                    placeholder="Es. 5"
                    value={data.totalHighChairs || ""}
                    onChange={(e) => updateData({ totalHighChairs: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground">
                    Indica quanti seggiolini hai a disposizione.
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
