"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ReservationConfig } from "./types";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Clock, Users, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface BookingFormProps {
    config: ReservationConfig;
    tenantId: string;
    restaurantName: string;
}

export function BookingForm({ config, tenantId, restaurantName }: BookingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        guests: "2",
        highChairs: "0",
        date: "",
        time: "",
        notes: ""
    });

    const supabase = createClient();

    // Calculate available time slots based on shifts and selected date
    const availableSlots = useMemo(() => {
        if (!formData.date || !config.shifts) return [];

        const date = new Date(formData.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const slots: string[] = [];

        // Filter active shifts for this day
        const activeShifts = config.shifts.filter(s =>
            s.isActive && s.daysOfWeek.includes(dayOfWeek)
        );

        activeShifts.forEach(shift => {
            const start = parseInt(shift.startTime.replace(':', ''));
            const end = parseInt(shift.endTime.replace(':', ''));

            let current = start; // e.g. 1900

            while (current < end) {
                // Convert back to HH:mm
                const hour = Math.floor(current / 100);
                const min = current % 100;
                const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                slots.push(timeStr);

                // Increment by 30 mins
                let nextMin = min + 30;
                let nextHour = hour;
                if (nextMin >= 60) {
                    nextMin -= 60;
                    nextHour += 1;
                }
                current = nextHour * 100 + nextMin;
            }
        });

        // Filter past times if today
        const today = new Date().toISOString().split('T')[0];
        if (formData.date === today) {
            const now = new Date();
            const currentHm = now.getHours() * 100 + now.getMinutes();
            return slots.filter(s => {
                const slotHm = parseInt(s.replace(':', ''));
                return slotHm > currentHm;
            }).sort();
        }

        return slots.sort();
    }, [formData.date, config.shifts]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!config.isActive) {
            toast.error("Le prenotazioni sono temporaneamente chiuse.");
            return;
        }

        setIsSubmitting(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('reservations') as any).insert({
                tenant_id: tenantId,
                customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
                customer_email: formData.email,
                customer_phone: formData.phone,
                guests: parseInt(formData.guests),
                high_chairs: parseInt(formData.highChairs),
                reservation_date: formData.date,
                reservation_time: formData.time,
                notes: formData.notes || null,
                status: 'pending'
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success("Richiesta inviata con successo!");

        } catch (error) {
            console.error("Error submitting reservation:", error);
            toast.error("Si è verificato un errore. Riprova più tardi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md mx-auto mt-8 border-green-200 bg-green-50/50 shadow-lg">
                <CardContent className="pt-10 pb-10 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Richiesta Inviata!</h2>
                        <p className="text-gray-600">
                            Grazie <strong>{formData.firstName}</strong>.<br />
                            Abbiamo ricevuto la tua richiesta per <strong>{restaurantName}</strong>.
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-green-100 text-left text-sm space-y-2 max-w-xs mx-auto shadow-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Data:</span>
                            <span className="font-medium">{new Date(formData.date).toLocaleDateString('it-IT')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ora:</span>
                            <span className="font-medium">{formData.time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ospiti:</span>
                            <span className="font-medium">{formData.guests}</span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Riceverai una conferma via email o telefono appena il ristoratore accetterà la prenotazione.
                    </p>

                    <Button
                        onClick={() => {
                            setIsSuccess(false);
                            setFormData(prev => ({ ...prev, date: "", time: "", notes: "" }));
                        }}
                        variant="outline"
                        className="mt-4"
                    >
                        Nuova Prenotazione
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Config validation
    if (!config.isActive) {
        return (
            <Card className="w-full max-w-lg mx-auto mt-10 text-center p-8">
                <h3 className="text-lg font-medium text-muted-foreground">
                    Le prenotazioni online sono momentaneamente disabilitate.
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                    Contatta il ristorante direttamente per prenotare.
                </p>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Prenota il tuo tavolo
                    </CardTitle>
                    <CardDescription>
                        Compila il modulo per richiedere disponibilità a {restaurantName}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Contatti */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-1 mb-3">I tuoi dati</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nome</Label>
                                <Input
                                    id="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => handleChange("firstName", e.target.value)}
                                    placeholder="Mario"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Cognome</Label>
                                <Input
                                    id="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => handleChange("lastName", e.target.value)}
                                    placeholder="Rossi"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="mario@email.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefono</Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                placeholder="+39 333 1234567"
                            />
                        </div>
                    </div>

                    {/* Dettagli Prenotazione */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b pb-1 mb-3">La Prenotazione</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="guests" className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Persone</Label>
                                <Input
                                    id="guests"
                                    type="number"
                                    min="1"
                                    max={config.totalSeats || 50}
                                    required
                                    value={formData.guests}
                                    onChange={(e) => handleChange("guests", e.target.value)}
                                    placeholder="2"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="highChairs">Di cui bambini (seggiolini)</Label>
                                <Input
                                    id="highChairs"
                                    type="number"
                                    min="0"
                                    max={formData.guests}
                                    required
                                    value={formData.highChairs}
                                    onChange={(e) => handleChange("highChairs", e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.date}
                                    onChange={(e) => handleChange("date", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Ora</Label>
                                <Select value={formData.time} onValueChange={(v) => handleChange("time", v)} disabled={!formData.date}>
                                    <SelectTrigger id="time">
                                        <SelectValue placeholder={!formData.date ? "Seleziona prima la data" : "Seleziona orario"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map(slot => (
                                                <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                {formData.date ? "Nessun orario disponibile" : "Scegli una data"}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Note (Intolleranze, ricorrenze special, ecc)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Scrivi qui eventuali richieste..."
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting || !formData.date || !formData.time}>
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Conferma Richiesta"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
