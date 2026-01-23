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
    }).replace(/^\w/, (c) => c.toUpperCase());

    return (
        <EmailLayout preview={`Nuova prenotazione da ${customerName}`}>
            <Section style={headerSection}>
                <Heading style={h1}>Nuova Richiesta</Heading>
            </Section>

            <Section style={mainContent}>
                <Text style={introText}>
                    Ciao <strong>{restaurantName}</strong>, hai ricevuto una nuova proposta di prenotazione tramite GoFood Menu.
                </Text>

                <Section style={detailsCard}>
                    <div style={cardHeader}>DETTAGLI CLIENTE</div>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Nome</Column>
                        <Column style={detailValue}><strong>{customerName}</strong></Column>
                    </Row>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Contatti</Column>
                        <Column style={detailValue}>
                            <div>{customerPhone}</div>
                            <div style={subValue}>{customerEmail}</div>
                        </Column>
                    </Row>

                    <div style={{ ...cardHeader, marginTop: '24px' }}>DETTAGLI PRENOTAZIONE</div>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Quando</Column>
                        <Column style={detailValue}>{formattedDate} ore {time.slice(0, 5)}</Column>
                    </Row>
                    <Row style={detailRow}>
                        <Column style={detailLabel}>Ospiti</Column>
                        <Column style={detailValue}>
                            {guests} {guests === 1 ? 'persona' : 'persone'}
                            {highChairs > 0 && <div style={subValue}>({highChairs} seggiolini)</div>}
                        </Column>
                    </Row>

                    {notes && (
                        <Row style={{ ...detailRow, borderBottom: 'none' }}>
                            <Column style={detailLabel}>Note</Column>
                            <Column style={{ ...detailValue, fontStyle: 'italic', fontWeight: '400' }}>
                                "{notes}"
                            </Column>
                        </Row>
                    )}
                </Section>

                <Section style={actionSection}>
                    <Button
                        style={button}
                        href={dashboardUrl}
                    >
                        Gestisci Prenotazione
                    </Button>
                    <Text style={footerNote}>
                        Accedi alla dashboard per confermare o rifiutare la richiesta.
                    </Text>
                </Section>
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
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: '800',
    textAlign: 'center' as const,
    margin: '0',
    letterSpacing: '-0.02em',
};

const mainContent = {
    padding: '0 20px',
};

const introText = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
    marginBottom: '32px',
    textAlign: 'center' as const,
};

const detailsCard = {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginBottom: '32px',
};

const cardHeader = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
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

const subValue = {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '400',
};

const actionSection = {
    textAlign: 'center' as const,
    marginTop: '32px',
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

const footerNote = {
    fontSize: '13px',
    color: '#94a3b8',
    marginTop: '16px',
    textAlign: 'center' as const,
};

export default NewReservationEmail;
