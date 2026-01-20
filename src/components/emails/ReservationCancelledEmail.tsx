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
    });
    const formattedTime = time.split(':').slice(0, 2).join(':');

    return (
        <EmailLayout preview={`Prenotazione Cancellata - ${restaurantName}`}>
            <Section style={headerSection}>
                <Heading style={h1}>
                    Prenotazione Cancellata
                </Heading>
            </Section>

            <Text style={text}>
                Ciao <strong>{customerName}</strong>,
                <br />
                ti confermiamo che la tua prenotazione presso <strong>{restaurantName}</strong> è stata cancellata correttamente.
            </Text>

            <Section style={stoneCard}>
                <Row style={row}>
                    <Column style={labelCol}>Quando era</Column>
                    <Column style={valueCol}>
                        {formattedDate} ore {formattedTime}
                    </Column>
                </Row>
                <Row style={{ ...row, borderBottom: 'none' }}>
                    <Column style={labelCol}>Dove</Column>
                    <Column style={valueCol}>
                        {restaurantName}
                    </Column>
                </Row>
            </Section>

            <Text style={{ ...text, fontSize: '12px', color: '#666', marginTop: '20px' }}>
                Se hai cancellato per errore o vuoi effettuare una nuova prenotazione, contattaci o visita nuovamente il nostro sito.
            </Text>
        </EmailLayout>
    );
};

// Styles
const headerSection = {
    textAlign: 'center' as const,
    padding: '20px 0',
};

const iconStyle = {
    fontSize: '48px',
    margin: '0 0 10px',
};

const h1 = {
    color: '#dc2626', // Red color for cancellation
    fontSize: '24px',
    fontWeight: '700',
    margin: '0',
    lineHeight: '1.3',
};

const text = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151',
    margin: '16px 0',
    textAlign: 'center' as const,
};

const stoneCard = {
    backgroundColor: '#f5f5f4', // stone-100
    borderRadius: '12px',
    padding: '16px',
    margin: '24px 0',
    border: '1px solid #e7e5e4',
};

const row = {
    borderBottom: '1px solid #d6d3d1',
    padding: '8px 0',
};

const labelCol = {
    width: '30%',
    color: '#78716c',
    fontSize: '14px',
    fontWeight: '500',
};

const valueCol = {
    width: '70%',
    color: '#1c1917',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'right' as const,
};
