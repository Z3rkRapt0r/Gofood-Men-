import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlutenFilterProvider } from "@/contexts/GlutenFilterContext";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Script from 'next/script';
import QueryProvider from "@/components/providers/QueryProvider";
import CookieBanner from "@/components/CookieBanner";
import { TawkToWidget } from "@/components/TawkToWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gofood Menù - Il tuo menu digitale",
  description: "Crea e gestisci il tuo menu digitale con Gofood Menù",
  keywords: "menu digitale, ristorante, gofood, menu online",
  openGraph: {
    title: "Gofood Menù - Il tuo menu digitale",
    description: "Crea e gestisci il tuo menu digitale con Gofood Menù",
    type: "website",
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'Gofood Menù Logo',
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8B0000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-[#FFF8E7]`}
      >
        <LanguageProvider>
          <QueryProvider>
            <GlutenFilterProvider>
              {children}
              {/* <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              /> */}
              <SonnerToaster position="top-center" />
              <CookieBanner />
              <TawkToWidget />
            </GlutenFilterProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
