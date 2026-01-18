import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
    preview?: string;
    children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
    return (
        <Html>
            <Head />
            <Preview>{preview || ""} </Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={{ marginTop: '32px', marginBottom: '10px', textAlign: 'center' as const }}>
                        <Img
                            src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/public/Go%20Food/gofood-logoHD.jpg"
                            width="300"
                            height="66"
                            alt="GO! FOOD"
                            style={{ margin: '0 auto', objectFit: 'contain' }}
                        />
                    </Section>

                    {/* Content */}
                    <Section style={content}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Hr style={hr} />
                        <Text style={{ marginBottom: '16px', color: '#666' }}>
                            Powered by <strong>GoFood Menu</strong>
                        </Text>
                        <div style={{ marginBottom: '16px' }}>
                            <Link
                                href="https://www.iubenda.com/privacy-policy/23100081"
                                style={link}
                            >
                                Privacy Policy
                            </Link>
                            <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                            <Link
                                href="https://gofoodmenu.it/termini-e-condizioni"
                                style={link}
                            >
                                Termini di Servizio
                            </Link>
                        </div>
                        <Text style={{ fontSize: '10px', color: '#ccc' }}>
                            GO! FOOD © {new Date().getFullYear()} Tutti i diritti riservati. - P.IVA 06955440828
                        </Text>
                    </Section>
                </Container>
            </Body >
        </Html >
    );
};

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    color: '#333333',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
};

const content = {
    backgroundColor: '#ffffff',
    padding: '0 10px',
};

const footer = {
    marginTop: '48px',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#999',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const link = {
    color: '#999',
    textDecoration: 'underline',
};
