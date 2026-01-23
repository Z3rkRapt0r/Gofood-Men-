import {
    Section,
    Text,
    Heading,
    Row,
    Column,
} from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/EmailLayout";

interface ReservationCancelledEmailProps {
    restaurantName: string;
    customerName: string;
    date: string;
    time: string;
}

export const ReservationCancelledEmail = ({
    restaurantName = "Il Tuo Ristorante",
    customerName = "Mario",
    date = "2024-05-20",
    time = "20:30",
}: ReservationCancelledEmailProps) => {
    const formattedDate = new Date(date).toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).replace(/^\w/, (c) => c.toUpperCase());

    const formattedTime = time.split(':').slice(0, 2).join(':');

    return (
        <EmailLayout preview={`Prenotazione Cancellata - ${restaurantName}`}>
            <Section style={headerSection}>
                <Heading style={h1}>
                    Prenotazione Cancellata
                </Heading>
            </Section>

            <Section style={mainContent}>
                <Text style={greeting}>
                    Ciao <strong>{customerName}</strong>,
                </Text>

                <Text style={introText}>
                    Ti confermiamo che la tua prenotazione presso <strong>{restaurantName}</strong> è stata cancellata correttamente.
                </Text>

                <Section style={detailsCard}>
                    <div style={cardHeader}>DETTAGLI PRENOTAZIONE CANCELLATA</div>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Data</Column>
                        <Column style={detailValue}>{formattedDate}</Column>
                    </Row>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Orario</Column>
                        <Column style={detailValue}>{formattedTime}</Column>
                    </Row>
                    <Row style={{ ...detailRow, borderBottom: 'none' }}>
                        <Column style={detailLabel}>Ristorante</Column>
                        <Column style={detailValue}>{restaurantName}</Column>
                    </Row>
                </Section>

                <Text style={note}>
                    Se hai cancellato per errore o vuoi effettuare una nuova prenotazione, non esitare a contattarci o a visitare nuovamente il nostro sito.
                </Text>
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
    color: '#dc2626', // Red color for cancellation
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
    width: '40%',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
};

const detailValue = {
    width: '60%',
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'right' as const,
};

const note = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#6b7280',
    textAlign: 'center' as const,
    fontStyle: 'italic',
};

export default ReservationCancelledEmail;
