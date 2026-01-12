import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Termini e Condizioni - Gofood Menù',
    description: 'Leggi i termini e le condizioni di utilizzo di Gofood Menù.',
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
