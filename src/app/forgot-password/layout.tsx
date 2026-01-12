import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recupera Password - Gofood Menù',
    description: 'Hai dimenticato la password? Recuperala qui.',
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
