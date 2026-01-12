import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Accedi - Gofood Menù',
    description: 'Effettua il login per gestire il tuo menu digitale.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
