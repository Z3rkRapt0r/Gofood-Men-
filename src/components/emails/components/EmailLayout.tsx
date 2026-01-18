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
    Tailwind,
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
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans text-stone-800">
                    <Container className="mx-auto p-5 pb-10 max-w-[580px]">
                        {/* Header */}
                        <Section className="mt-8 mb-8 text-center">
                            <Img
                                src="https://gofoodmenu.vercel.app/gofood-logoHD.png" // Hosting externally or using full URL is safer for emails
                                width="180"
                                height="40"
                                alt="GoFood Menu"
                                className="mx-auto object-contain"
                            />
                        </Section>

                        {/* Content */}
                        <Section className="bg-white rounded-lg px-2">
                            {children}
                        </Section>

                        {/* Footer */}
                        <Section className="mt-12 text-center text-xs text-stone-400">
                            <Hr className="border-stone-200 my-6" />
                            <Text className="mb-4 text-stone-500">
                                Powered by <strong>GoFood Menu</strong>
                            </Text>
                            <div className="space-x-4">
                                <Link
                                    href="https://gofoodmenu.it/privacy"
                                    className="text-stone-400 underline decoration-stone-300"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href="https://gofoodmenu.it/terms"
                                    className="text-stone-400 underline decoration-stone-300"
                                >
                                    Termini di Servizio
                                </Link>
                            </div>
                            <Text className="mt-4 text-[10px] text-stone-300">
                                GoFood Menu © {new Date().getFullYear()} - P.IVA 12345678901
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
