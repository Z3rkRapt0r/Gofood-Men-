import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reimposta Password - Gofood Menù',
    description: 'Imposta una nuova password per il tuo account.',
};

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
