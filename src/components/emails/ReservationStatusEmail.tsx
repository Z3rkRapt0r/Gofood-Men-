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

    // Formattazione data italiana: "Venerdì 23 Gennaio 2026"
    const formattedDate = new Date(date).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Europe/Rome"
    }).replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter

    const formattedTime = time.split(':').slice(0, 2).join(':');

    const title = isConfirmed ? "Prenotazione Confermata!" : "Aggiornamento Prenotazione";
    const colorStyle = isConfirmed ? { color: '#059669' } : { color: '#dc2626' }; // emerald-600 : red-600

    return (
        <EmailLayout preview={`${title} - ${restaurantName}`}>
            <Section style={headerSection}>
                <Heading style={{ ...h1, ...colorStyle }}>
                    {title}
                </Heading>
            </Section>

            <Section style={mainContent}>
                <Text style={greeting}>
                    Ciao <strong>{customerName}</strong>,
                </Text>

                <Text style={introText}>
                    {isConfirmed
                        ? `Siamo lieti di confermare la tua prenotazione presso `
                        : `Ti ringraziamo per l'interesse, purtroppo dobbiamo informarti che non è stato possibile accettare la tua richiesta di prenotazione presso `}
                    <strong>{restaurantName}</strong>.
                </Text>

                {isConfirmed ? (
                    <Section style={detailsCard}>
                        <div style={cardHeader}>DETTAGLI PRENOTAZIONE</div>
                        <Row style={detailRow}>
                            <Column style={detailLabel}>Data</Column>
                            <Column style={detailValue}>{formattedDate}</Column>
                        </Row>
                        <Row style={detailRow}>
                            <Column style={detailLabel}>Orario</Column>
                            <Column style={detailValue}>{formattedTime}</Column>
                        </Row>
                        <Row style={detailRow}>
                            <Column style={detailLabel}>Ospiti</Column>
                            <Column style={detailValue}>{guests} {guests === 1 ? 'persona' : 'persone'}</Column>
                        </Row>
                        <Row style={{ ...detailRow, borderBottom: 'none' }}>
                            <Column style={detailLabel}>Ristorante</Column>
                            <Column style={detailValue}>{restaurantName}</Column>
                        </Row>
                    </Section>
                ) : (
                    <Section style={rejectionCard}>
                        <Text style={rejectionText}>
                            {rejectionReason
                                ? rejectionReason
                                : "Purtroppo non abbiamo disponibilità per la data o l'orario richiesto. Ti invitiamo a riprovare per un'altra data o a contattarci direttamente."}
                        </Text>
                    </Section>
                )}

                {isConfirmed && (
                    <Text style={note}>
                        Ti aspettiamo! Se dovessi avere ritardi o necessità di modificare la prenotazione, ti preghiamo di avvisarci il prima possibile.
                    </Text>
                )}
            </Section>

            <Section style={footerAction}>
                {restaurantPhone && (
                    <div style={{ textAlign: 'center' as const }}>
                        <Text style={supportText}>Hai bisogno di aiuto?</Text>
                        <Button
                            style={button}
                            href={`tel:${restaurantPhone}`}
                        >
                            Chiama il Ristorante
                        </Button>
                    </div>
                )}
            </Section>
        </EmailLayout>
    );
};

// Styles
const headerSection = {
    textAlign: 'center' as const,
    padding: '32px 0 24px',
};

const h1 = {
    fontSize: '28px',
    fontWeight: '800',
    textAlign: 'center' as const,
    margin: '0',
    letterSpacing: '-0.02em',
};

const mainContent = {
    padding: '0 20px',
};

const greeting = {
    fontSize: '18px',
    color: '#1f2937',
    marginBottom: '12px',
};

const introText = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
    marginBottom: '32px',
};

const detailsCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginBottom: '32px',
};

const cardHeader = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.1em',
    marginBottom: '16px',
};

const detailRow = {
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
};

const detailLabel = {
    width: '30%',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
};

const detailValue = {
    width: '70%',
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'right' as const,
};

const rejectionCard = {
    backgroundColor: '#fff1f2',
    borderRadius: '16px',
    border: '1px solid #fecdd3',
    padding: '24px',
    marginBottom: '32px',
};

const rejectionText = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#9f1239',
    textAlign: 'center' as const,
    margin: '0',
};

const note = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#6b7280',
    textAlign: 'center' as const,
    fontStyle: 'italic',
};

const footerAction = {
    marginTop: '32px',
    textAlign: 'center' as const,
};

const supportText = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
};

const button = {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 28px',
};

export default ReservationStatusEmail;

