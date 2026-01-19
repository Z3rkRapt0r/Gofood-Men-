import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepCapacity } from "./steps/StepCapacity";
import { StepTables } from "./steps/StepTables";
import { StepTimeSlots } from "./steps/StepTimeSlots";
import { ReservationConfig } from "../types";

interface ReservationWizardProps {
    onComplete: (config: ReservationConfig) => void;
    initialData?: ReservationConfig;
}

export function ReservationWizard({ onComplete, initialData }: ReservationWizardProps) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<ReservationConfig>(initialData || {
        isActive: true,
        totalSeats: 0,
        totalHighChairs: 0,
        tables: [],
        shifts: [],

    });

    const updateData = (newData: Partial<ReservationConfig>) => {
        setData((prev) => ({ ...prev, ...newData }));
    };

    const nextStep = () => setStep((p) => p + 1);
    const prevStep = () => setStep((p) => p - 1);

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepCapacity data={data} updateData={updateData} />;
            case 2:
                return <StepTables data={data} updateData={updateData} />;
            case 3:
                return <StepTimeSlots data={data} updateData={updateData} />;
            default:
                return null;
        }
    };

    const isLastStep = step === 3;

    const isNextDisabled = () => {
        if (step === 2) {
            const allocatedSeats = (data.tables || []).reduce((acc, t) => acc + t.seats, 0);
            return allocatedSeats !== data.totalSeats;
        }
        return false;
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-7xl">
                <CardHeader>
                    <CardTitle>Configurazione Prenotazioni - Passo {step} di 3</CardTitle>
                    <CardDescription>
                        {step === 1 && "Definisci la capacità totale del tuo locale."}
                        {step === 2 && "Crea e configura i tuoi tavoli."}
                        {step === 3 && "Imposta le fasce orarie in cui è possibile prenotare."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderStep()}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        Indietro
                    </Button>
                    {isLastStep ? (
                        <Button onClick={() => onComplete(data)}>Salva e Attiva</Button>
                    ) : (
                        <Button onClick={nextStep} disabled={isNextDisabled()}>Avanti</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
