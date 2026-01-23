"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ReservationConfig } from "./types";
import { getTodayItaly } from "@/lib/date-utils";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Clock, Users, CheckCircle2, Baby, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { submitReservation } from "@/app/actions/reservation-actions";
import { motion, AnimatePresence } from "framer-motion";

interface BookingFormProps {
    config: ReservationConfig;
    tenantId: string;
    restaurantName: string;
}

export function BookingForm({ config, tenantId, restaurantName }: BookingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        guests: "2",
        highChairs: "0",
        date: getTodayItaly(),
        time: "",
        notes: ""
    });

    // Calculate available time slots based on shifts and selected date
    const availableSlots = useMemo(() => {
        if (!formData.date || !config.shifts) return [];

        const date = new Date(formData.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday
        const slots: string[] = [];

        const activeShifts = config.shifts.filter(s =>
            s.isActive && s.daysOfWeek.includes(dayOfWeek)
        );

        activeShifts.forEach(shift => {
            const start = parseInt(shift.startTime.replace(':', ''));
            const end = parseInt(shift.endTime.replace(':', ''));

            const generateSlots = (s: number, e: number) => {
                let current = s;
                while (current < e) {
                    const hour = Math.floor(current / 100);
                    const min = current % 100;
                    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    slots.push(timeStr);

                    let nextMin = min + 30;
                    let nextHour = hour;
                    if (nextMin >= 60) {
                        nextMin -= 60;
                        nextHour += 1;
                    }
                    current = nextHour * 100 + nextMin;
                }
            }

            if (end < start) {
                generateSlots(start, 2400);
                generateSlots(0, end);
            } else {
                generateSlots(start, end);
            }
        });

        const today = getTodayItaly();
        if (formData.date === today) {
            const nowItaly = new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" });
            const now = new Date(nowItaly);
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

    const handleNext = () => {
        if (step === 1) {
            if (!formData.guests || !formData.date || !formData.time) {
                toast.error("Per favore, compila tutti i campi richiesti.");
                return;
            }
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!config.isActive) {
            toast.error("Le prenotazioni sono temporaneamente chiuse.");
            return;
        }

        setIsSubmitting(true);

        try {
            const adults = parseInt(formData.guests);
            const children = parseInt(formData.highChairs);
            const totalGuests = adults + children;

            const result = await submitReservation({
                tenantId,
                restaurantName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                guests: totalGuests,
                highChairs: children,
                date: formData.date,
                time: formData.time,
                notes: formData.notes
            });

            if (!result.success) {
                throw new Error(result.error);
            }

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
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4"
                    >
                        <CheckCircle2 className="w-8 h-8" />
                    </motion.div>
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
                            <span className="font-medium flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{formData.guests}</span>
                                </span>
                                {parseInt(formData.highChairs) > 0 && (
                                    <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md text-xs font-medium border border-orange-100">
                                        <span>+</span>
                                        <Baby className="w-3.5 h-3.5" />
                                        <span>{formData.highChairs}</span>
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Riceverai una conferma via email o telefono appena il ristoratore accetterà la prenotazione.
                    </p>

                    <Button
                        onClick={() => {
                            setIsSuccess(false);
                            setStep(1);
                            setFormData({
                                firstName: "",
                                lastName: "",
                                email: "",
                                phone: "",
                                guests: "2",
                                highChairs: "0",
                                date: getTodayItaly(),
                                time: "",
                                notes: ""
                            });
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
            <Card className="w-full max-w-lg mx-auto shadow-2xl border-none overflow-hidden bg-white">
                <CardContent className="pt-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guests" className="text-sm font-semibold">Adulti</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="guests"
                                                type="number"
                                                min="1"
                                                max={config.totalSeats || 999}
                                                required
                                                value={formData.guests}
                                                onChange={(e) => handleChange("guests", e.target.value)}
                                                className="pl-9 h-12 text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="highChairs" className="text-sm font-semibold">Bambini</Label>
                                        <div className="relative">
                                            <Baby className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="highChairs"
                                                type="number"
                                                min="0"
                                                max={config.totalSeats || 999}
                                                value={formData.highChairs}
                                                onChange={(e) => handleChange("highChairs", e.target.value)}
                                                className="pl-9 h-12 text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date" className="text-sm font-semibold">Giorno</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="date"
                                            type="date"
                                            required
                                            min={getTodayItaly()}
                                            max={(() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + 60);
                                                return d.toISOString().split('T')[0];
                                            })()}
                                            value={formData.date}
                                            onChange={(e) => handleChange("date", e.target.value)}
                                            className="pl-9 h-12 text-lg appearance-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-sm font-semibold">Orario</Label>
                                    <Select
                                        value={formData.time}
                                        onValueChange={(v) => handleChange("time", v)}
                                        disabled={!formData.date}
                                    >
                                        <SelectTrigger id="time" className="h-12 text-lg pl-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <SelectValue placeholder={!formData.date ? "Scegli prima la data" : "Seleziona ora"} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSlots.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-1 p-1">
                                                    {availableSlots.map(slot => (
                                                        <SelectItem
                                                            key={slot}
                                                            value={slot}
                                                            className="justify-center py-2"
                                                        >
                                                            {slot}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-sm text-muted-foreground text-center">
                                                    Nessun orario per questa data
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-sm font-semibold">Nome</Label>
                                        <Input
                                            id="firstName"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleChange("firstName", e.target.value)}
                                            placeholder="Mario"
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-semibold">Cognome</Label>
                                        <Input
                                            id="lastName"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleChange("lastName", e.target.value)}
                                            placeholder="Rossi"
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="mario@esempio.com"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold">Cellulare</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="+39 340 123 4567"
                                        className="h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-semibold">Note extra (opzionale)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Allergie, intolleranze o richieste particolari..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        className="min-h-[100px] resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 pb-8 px-6">
                    {step === 1 ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="w-full h-14 text-lg font-bold group"
                            disabled={!formData.date || !formData.time}
                        >
                            Procedi al passo finale
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <div className="w-full flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="h-14 px-6"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-14 text-lg font-bold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Conferma Prenotazione"
                                )}
                            </Button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                            <ChevronRight className="w-3 h-3 text-primary" />
                            <span>Richiedi disponibilità in pochi secondi</span>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </form>
    );
}
