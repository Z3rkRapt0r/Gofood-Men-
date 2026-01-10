import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
    // 1. OSTERIA ROMANA
    {
        id: 'osteria-romana',
        name: 'Osteria Romana',
        description: 'Vibes autentiche: pergamena crema, rosso Roma e oro.',
        category: 'restaurant',
        colors: {
            // Updated to match Magna Roma Live Site (Verified)
            primary: '#8B0000',    // Roma Red
            secondary: '#C5A059',  // Antique Gold (Verified)
            accent: '#C5A059',     // Antique Gold (Verified)
            background: '#FFF8E7', // Cream Background
            surface: '#FFFFFF',    // White Surface (Cards)
            text: '#171717',       // Coal Text
            textSecondary: '#374151', // Gray-700 (Darker than before to match inactive buttons)
            border: '#E5E7EB',     // Border Gray
            price: '#171717',      // Price matches text color
            success: '#16A34A',

            // New Granular Slots
            priceBackground: '#C5A059', // Antique Gold
            badgeBackground: '#C5A059', // Antique Gold
            badgeText: '#FFFFFF',       // White text on Gold (Verified)
            // footerBackground removed to restore default gradient/background
            footerText: '#374151',      // Darker Gray (Text Secondary)
            headerBackground: '#FFFFFF', // Header is white
            headerText: '#8B0000',       // Header text/icons are red
            overlay: '#8B0000',          // Default overlay matches primary
            overlayOpacity: 0.1          // Default subtle opacity
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Playfair Display',
        fontBody: 'Lato',
        scale: 1,
        rounded: 'sm',
        shadows: 'soft',
        dividerStyle: 'filigree', // Keep filigree as it fits the style
        logoHeight: 60,
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)', // Subtle shadow for legibility
    },

    // 2. STREET BURGER
    {
        id: 'street-burger',
        name: 'Street Burger',
        description: 'Energico e audace. Colori forti per appetiti forti.',
        category: 'bar',
        colors: {
            primary: '#EA580C',
            secondary: '#F59E0B',
            accent: '#D97706',
            background: '#FFF7ED',
            surface: '#FFFFFF',
            text: '#431407',
            textSecondary: '#78350F',
            border: '#FDBA74', // Orange Border
            price: '#EA580C',
            success: '#16A34A',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Oswald',
        fontBody: 'Roboto',
        scale: 1,
        rounded: 'md',
        shadows: 'hard',
        dividerStyle: 'slash',
        logoHeight: 60,
    },

    // 3. CANDY POP
    {
        id: 'candy-pop',
        name: 'Candy Pop',
        description: 'Dolce, rosa e giocoso. Perfetto per dolci e gelati.',
        category: 'cafe',
        colors: {
            primary: '#EC4899',
            secondary: '#A855F7',
            accent: '#F472B6',
            background: '#FDF2F8',
            surface: '#FFFFFF',
            text: '#831843',
            textSecondary: '#9D174D',
            border: '#FBCFE8',
            price: '#DB2777',
            success: '#10B981',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Dancing Script',
        fontBody: 'Quicksand',
        scale: 1,
        rounded: 'lg',
        shadows: 'soft',
        dividerStyle: 'dotted',
        logoHeight: 80,
    },

    // 4. RISTORANTINO DI PESCE
    {
        id: 'ristorantino-pesce',
        name: 'Ristorantino di Pesce',
        description: 'Fresco come l\'oceano. Toni azzurri e acquerello.',
        category: 'restaurant',
        colors: {
            primary: '#0284C7',
            secondary: '#38BDF8',
            accent: '#0EA5E9',
            background: '#F0F9FF',
            surface: '#FFFFFF',
            text: '#0C4A6E',
            textSecondary: '#0369A1',
            border: '#BAE6FD',
            price: '#0284C7',
            success: '#059669',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Merriweather',
        fontBody: 'Open Sans',
        scale: 1,
        rounded: 'md',
        shadows: 'soft',
        dividerStyle: 'wavy',
        logoHeight: 60,
    },

    // 5. BISTROT ELEGANTE
    {
        id: 'bistrot-elegante',
        name: 'Bistrot Elegante',
        description: 'Lusso discreto con toni oro e champagne.',
        category: 'restaurant',
        colors: {
            primary: '#D4AF37',
            secondary: '#F4E4C1',
            accent: '#92400E',
            background: '#FFFEF7',
            surface: '#FFFFFF',
            text: '#1C1917',
            textSecondary: '#44403C',
            border: '#E8DCC8',
            price: '#C9A961',
            success: '#15803D',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Cinzel',
        fontBody: 'Lato',
        scale: 1,
        rounded: 'sm',
        shadows: 'soft',
        dividerStyle: 'double',
        logoHeight: 65,
    },

    // 6. PIZZERIA NAPOLETANA
    {
        id: 'pizzeria-napoletana',
        name: 'Pizzeria Napoletana',
        description: 'I colori della tradizione: pomodoro, basilico e mozzarella.',
        category: 'restaurant',
        colors: {
            primary: '#DC2626',
            secondary: '#EF4444',
            accent: '#15803D',
            background: '#FEF2F2',
            surface: '#FFFFFF',
            text: '#7C2D12',
            textSecondary: '#7F1D1D',
            border: '#FECACA',
            price: '#B91C1C',
            success: '#16A34A',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Lobster',
        fontBody: 'Open Sans',
        scale: 1,
        rounded: 'lg',
        shadows: 'soft',
        dividerStyle: 'dotted',
        logoHeight: 70,
    },

    // 7. SUSHI BAR MODERNO
    {
        id: 'sushi-bar',
        name: 'Sushi Bar Moderno',
        description: 'Minimalismo rosso e nero per un tocco orientale.',
        category: 'restaurant',
        colors: {
            primary: '#DC2626',
            secondary: '#EF4444',
            accent: '#991B1B',
            background: '#FEF2F2',
            surface: '#FFFFFF',
            text: '#18181B',
            textSecondary: '#3F3F46',
            border: '#FCA5A5',
            price: '#7F1D1D',
            success: '#059669',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Montserrat',
        fontBody: 'Roboto',
        scale: 1,
        rounded: 'none',
        shadows: 'none',
        dividerStyle: 'solid',
        logoHeight: 60,
    },

    // 8. STEAKHOUSE PREMIUM
    {
        id: 'steakhouse-premium',
        name: 'Steakhouse Premium',
        description: 'Toni scuri e intensi per amanti della carne.',
        category: 'restaurant',
        colors: {
            primary: '#7C2D12',
            secondary: '#991B1B',
            accent: '#92400E',
            background: '#FFF1F2',
            surface: '#FFFFFF',
            text: '#1C0A00',
            textSecondary: '#44403C',
            border: '#F4E4C1',
            price: '#581C0C',
            success: '#15803D',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Oswald',
        fontBody: 'Open Sans',
        scale: 1,
        rounded: 'sm',
        shadows: 'hard',
        dividerStyle: 'double',
        logoHeight: 65,
    },

    // 9. TRATTORIA TOSCANA
    {
        id: 'trattoria-toscana',
        name: 'Trattoria Toscana',
        description: 'Verde oliva e colori della terra.',
        category: 'restaurant',
        colors: {
            primary: '#84CC16',
            secondary: '#A3E635',
            accent: '#65A30D',
            background: '#FEFCE8',
            surface: '#FFFFFF',
            text: '#3F3F46',
            textSecondary: '#713F12',
            border: '#FDE047',
            price: '#854D0E',
            success: '#4D7C0F',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Merriweather',
        fontBody: 'Lato',
        scale: 1,
        rounded: 'md',
        shadows: 'soft',
        dividerStyle: 'filigree',
        logoHeight: 60,
    },
];

export const DEFAULT_THEME = THEME_PRESETS[0];
