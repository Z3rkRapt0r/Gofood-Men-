import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReservationConfig } from "./types";
import { Mail } from "lucide-react";

interface EmailSettingsDialogProps {
    config: ReservationConfig;
    onSave: (email: string) => void;
}

export function EmailSettingsDialog({ config, onSave }: EmailSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(config.notificationEmail || "");

    const handleSave = () => {
        onSave(email);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Impostazioni Email
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Impostazioni Notifiche</DialogTitle>
                    <DialogDescription>
                        Inserisci l'indirizzo email dove vuoi ricevere le richieste di prenotazione.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="prenotazioni@ristorante.it"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Salva Modifiche</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
