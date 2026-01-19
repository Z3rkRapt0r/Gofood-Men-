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
        timeZone: "Europe/Rome"
    });
    const formattedTime = time.split(':').slice(0, 2).join(':');

    const title = isConfirmed ? "Prenotazione Confermata!" : "Prenotazione Rifiutata";
    const colorStyle = isConfirmed ? { color: '#16a34a' } : { color: '#dc2626' }; // green-600 : red-600
    const icon = isConfirmed ? "✅" : null;

    return (
        <EmailLayout preview={`${title} - ${restaurantName}`}>
            <Section style={headerSection}>
                {icon && <Text style={iconStyle}>{icon}</Text>}
                <Heading style={{ ...h1, ...colorStyle }}>
                    {title}
                </Heading>
            </Section>

            <Text style={text}>
                Ciao <strong>{customerName}</strong>,
                {isConfirmed
                    ? ` siamo felici di confermare la tua prenotazione da ${restaurantName}.`
                    : ` ci dispiace informarti che non possiamo accettare la tua richiesta di prenotazione presso ${restaurantName}.`}
            </Text>

            {isConfirmed && (
                <Section style={greenCard}>
                    <Row style={row}>
                        <Column style={labelCol}>Quando</Column>
                        <Column style={valueCol}>
                            {formattedDate} ore {formattedTime}
                        </Column>
                    </Row>
                    <Row style={row}>
                        <Column style={labelCol}>Ospiti</Column>
                        <Column style={valueCol}>
                            {guests} persone
                        </Column>
                    </Row>
                    <Row style={{ ...row, borderBottom: 'none' }}>
                        <Column style={labelCol}>Dove</Column>
                        <Column style={valueCol}>
                            {restaurantName}
                        </Column>
                    </Row>
                </Section>
            )}

            {!isConfirmed && (
                <Section style={stoneCard}>
                    <Text style={{ ...text, marginBottom: 0, marginTop: 0 }}>
                        Purtroppo non abbiamo disponibilità per la data o l'orario richiesto.
                        <br />
                        Ti invitiamo a contattarci telefonicamente per trovare una soluzione alternativa.
                    </Text>
                </Section>
            )}

            <Section style={footerSection}>
                {restaurantPhone && (
                    <Button
                        style={button}
                        href={`tel:${restaurantPhone}`}
                    >
                        Chiama {restaurantPhone}
                    </Button>
                )}
            </Section>
        </EmailLayout>
    );
};

// Styles
const headerSection = {
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const iconStyle = {
    fontSize: '36px',
    marginBottom: '8px',
    textAlign: 'center' as const,
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0',
};

const text = {
    color: '#44403c', // stone-700ish
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const greenCard = {
    backgroundColor: '#f0fdf4', // green-50
    borderRadius: '8px',
    border: '1px solid #dcfce7', // green-100
    padding: '24px',
    marginBottom: '32px',
};

const stoneCard = {
    backgroundColor: '#fafaf9', // stone-50
    borderRadius: '8px',
    border: '1px solid #f5f5f4', // stone-100
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center' as const,
};

const row = {
    borderBottom: '1px solid #dcfce7',
    padding: '12px 0',
};

const labelCol = {
    width: '30%',
    color: '#78716c', // stone-500
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    verticalAlign: 'top',
};

const valueCol = {
    width: '70%',
    color: '#1c1917', // stone-900
    fontWeight: '500',
    fontSize: '16px',
    verticalAlign: 'top',
};

const footerSection = {
    textAlign: 'center' as const,
    borderTop: '1px solid #f5f5f4',
    paddingTop: '24px',
};

const button = {
    backgroundColor: '#ffffff',
    color: '#1c1917',
    border: '1px solid #e7e5e4',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
};

export default ReservationStatusEmail;

