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
        timeZone: "Europe/Rome"
    });

    return (
        <EmailLayout preview={`Nuova prenotazione da ${customerName}`}>
            <Heading style={h1}>Nuova Richiesta di Prenotazione</Heading>
            <Text style={text}>
                Ciao <strong>{restaurantName}</strong>, hai ricevuto una nuova richiesta.
            </Text>

            <Section style={card}>
                <Row style={row}>
                    <Column style={labelCol}>Cliente</Column>
                    <Column style={valueCol}><strong>{customerName}</strong></Column>
                </Row>
                <Row style={row}>
                    <Column style={labelCol}>Persone</Column>
                    <Column style={valueCol}>
                        <strong>{guests} Totali</strong>
                        {highChairs > 0 && (
                            <div style={subInfo}>
                                ({guests - highChairs} Adulti, {highChairs} Bambini)
                            </div>
                        )}
                    </Column>
                </Row>
                <Row style={row}>
                    <Column style={labelCol}>Quando</Column>
                    <Column style={valueCol}>
                        {formattedDate} alle {time.slice(0, 5)}
                    </Column>
                </Row>
                <Row style={row}>
                    <Column style={labelCol}>Contatti</Column>
                    <Column style={valueCol}>
                        <div style={{ marginBottom: '4px' }}>{customerPhone}</div>
                        <div style={subInfo}>{customerEmail}</div>
                    </Column>
                </Row>

                {notes && (
                    <Row style={{ ...row, borderBottom: 'none' }}>
                        <Column style={labelCol}>Note</Column>
                        <Column style={{ ...valueCol, fontStyle: 'italic', color: '#555' }}>
                            "{notes}"
                        </Column>
                    </Row>
                )}
            </Section>

            <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                    style={button}
                    href={dashboardUrl}
                >
                    Gestisci Prenotazione
                </Button>
                <Text style={footerNote}>
                    Cliccando accederai alla dashboard per accettare o rifiutare.
                </Text>
            </Section>
        </EmailLayout>
    );
};

// Styles
const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '10px 0 20px 0',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const card = {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee',
    padding: '20px',
};

const row = {
    borderBottom: '1px solid #eee',
    padding: '10px 0',
};

const labelCol = {
    width: '30%',
    color: '#666',
    fontWeight: 'bold',
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    verticalAlign: 'top',
    paddingTop: '4px',
};

const valueCol = {
    width: '70%',
    color: '#333',
    fontSize: '16px',
    verticalAlign: 'top',
};

const subInfo = {
    fontSize: '14px',
    color: '#888',
};

const button = {
    backgroundColor: '#000',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
};

const footerNote = {
    fontSize: '12px',
    color: '#999',
    marginTop: '12px',
};

export default NewReservationEmail;
