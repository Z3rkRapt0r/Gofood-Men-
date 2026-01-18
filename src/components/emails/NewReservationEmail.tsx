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

interface NewReservationEmailProps {
    restaurantName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    guests: number;
    highChairs: number;
    date: string;
    time: string;
    notes?: string;
    dashboardUrl: string;
}

export const NewReservationEmail = ({
    restaurantName = "Il Tuo Ristorante",
    customerName = "Mario Rossi",
    customerEmail = "mario@example.com",
    customerPhone = "+39 333 1234567",
    guests = 4,
    highChairs = 0,
    date = "2024-05-20",
    time = "20:30",
    notes = "Nessuna nota particolare",
    dashboardUrl = "https://gofoodmenu.it/dashboard/reservations",
}: NewReservationEmailProps) => {
    const formattedDate = new Date(date).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <EmailLayout preview={`Nuova prenotazione da ${customerName}`}>
            <Heading className="text-2xl font-bold text-center text-stone-800 mb-6">
                Nuova Richiesta di Prenotazione
            </Heading>
            <Text className="text-base text-stone-600 mb-6 text-center">
                Ciao <strong>{restaurantName}</strong>, hai ricevuto una nuova richiesta.
            </Text>

            <Section className="bg-stone-50 rounded-lg p-6 mb-8 border border-stone-100">
                <Row className="mb-4">
                    <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                        Cliente
                    </Column>
                    <Column className="text-stone-800 font-medium">
                        {customerName}
                    </Column>
                </Row>
                <Row className="mb-4">
                    <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                        Persone
                    </Column>
                    <Column className="text-stone-800 font-medium">
                        {guests} {highChairs > 0 && <span className="text-xs text-stone-500 font-normal">({highChairs} bambini)</span>}
                    </Column>
                </Row>
                <Row className="mb-4">
                    <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                        Quando
                    </Column>
                    <Column className="text-stone-800 font-medium">
                        {formattedDate} alle {time}
                    </Column>
                </Row>
                <Row className="mb-4">
                    <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                        Contatti
                    </Column>
                    <Column className="text-stone-800">
                        <div className="mb-1">{customerPhone}</div>
                        <div className="text-sm text-stone-500">{customerEmail}</div>
                    </Column>
                </Row>

                {notes && (
                    <Row>
                        <Column className="w-1/3 text-stone-500 text-sm font-semibold uppercase tracking-wider">
                            Note
                        </Column>
                        <Column className="text-stone-700 italic border-l-2 border-stone-200 pl-3">
                            "{notes}"
                        </Column>
                    </Row>
                )}
            </Section>

            <Section className="text-center">
                <Button
                    className="bg-stone-900 text-white font-medium px-8 py-3 rounded-md hover:bg-stone-800 transition-colors"
                    href={dashboardUrl}
                >
                    Gestisci Prenotazione
                </Button>
                <Text className="text-xs text-stone-400 mt-4">
                    Cliccando accederai alla dashboard per accettare o rifiutare.
                </Text>
            </Section>
        </EmailLayout>
    );
};

export default NewReservationEmail;
