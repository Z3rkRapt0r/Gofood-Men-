import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Registrati',
    description: 'Crea un account gratuito e inizia a creare il tuo menu digitale.',
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
