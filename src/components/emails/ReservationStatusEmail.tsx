import {
    Section,
    Text,
    Button,
    Heading,
    Row,
    Column,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";

interface ReservationStatusEmailProps {
    status: "confirmed" | "rejected";
    restaurantName: string;
    customerName: string;
    date: string;
    time: string;
    guests: number;
    rejectionReason?: string;
    restaurantPhone?: string;
}

export const ReservationStatusEmail = ({
    status = "confirmed",
    restaurantName = "Il Tuo Ristorante",
    customerName = "Mario",
    date = "2024-05-20",
    time = "20:30",
    guests = 4,
    rejectionReason,
    restaurantPhone,
}: ReservationStatusEmailProps) => {
    const isConfirmed = status === "confirmed";
    const formattedDate = new Date(date).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const title = isConfirmed ? "Prenotazione Confermata!" : "Aggiornamento Prenotazione";
    const colorClass = isConfirmed ? "text-green-600" : "text-stone-800";
    const icon = isConfirmed ? "✅" : "❌";

    return (
        <EmailLayout preview={`${title} - ${restaurantName}`}>
            <Section className="text-center mb-6">
                <Text className="text-4xl mb-2">{icon}</Text>
                <Heading className={`text-2xl font-bold ${colorClass}`}>
                    {title}
                </Heading>
            </Section>

            <Text className="text-base text-stone-600 mb-6 text-center">
                Ciao <strong>{customerName}</strong>,
                {isConfirmed
                    ? ` siamo felici di confermare la tua prenotazione da ${restaurantName}.`
                    : ` ci dispiace informarti che non possiamo accettare la tua richiesta per ${restaurantName}.`}
            </Text>

            {isConfirmed && (
                <Section className="bg-green-50 rounded-lg p-6 mb-8 border border-green-100">
                    <Row className="mb-3">
                        <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                            Quando
                        </Column>
                        <Column className="text-stone-800 font-medium">
                            {formattedDate} ore {time}
                        </Column>
                    </Row>
                    <Row className="mb-3">
                        <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                            Ospiti
                        </Column>
                        <Column className="text-stone-800 font-medium">
                            {guests} persone
                        </Column>
                    </Row>
                    <Row>
                        <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                            Dove
                        </Column>
                        <Column className="text-stone-800 font-medium">
                            {restaurantName}
                        </Column>
                    </Row>
                </Section>
            )}

            {!isConfirmed && (
                <Section className="bg-red-50 rounded-lg p-6 mb-8 border border-red-100">
                    <Heading as="h3" className="text-lg font-semibold text-red-800 mb-2">
                        Motivo / Messaggio:
                    </Heading>
                    <Text className="text-stone-700">
                        {rejectionReason || "Il ristorante non ha specificato un motivo, ma potrebbe essere al completo per l'orario richiesto."}
                    </Text>
                </Section>
            )}

            <Section className="text-center border-t border-stone-100 pt-6">
                <Text className="text-stone-500 text-sm mb-4">
                    Hai bisogno di modificare o cancellare?
                </Text>
                {restaurantPhone && (
                    <Button
                        className="bg-white text-stone-800 border border-stone-200 font-medium px-6 py-2 rounded-md hover:bg-stone-50 transition-colors"
                        href={`tel:${restaurantPhone}`}
                    >
                        Chiama {restaurantPhone}
                    </Button>
                )}
            </Section>
        </EmailLayout>
    );
};

export default ReservationStatusEmail;
