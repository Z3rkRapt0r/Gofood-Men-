import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
    // 1. TRATTORIA (Ref: Image 3 - beige paper, classic text)
    {
        id: 'osteria-romana',
        name: 'Osteria Romana',
        description: 'Vibes autentiche: pergamena crema e rosso mattone.',
        category: 'restaurant',
        colors: {
            primary: '#7C2D12',     // Brick Red
            secondary: '#D97706',   // Golden Ochre
            background: '#FFF8E1',  // Warm Cream Paper
            surface: '#FFFFFF',     // Clean White
            text: '#27272a',        // Soft Black
            textSecondary: '#57534e', // Warm Grey
            accent: '#B45309',      // Deep Orange
            border: '#ECD0A9',      // Beige/Gold divider
            price: '#9A3412',       // Reddish Price
            success: '#166534',
        },
        frame: 'none',
        texture: 'none',
        pattern: 'none',
        fontHeading: 'Playfair Display',
        fontBody: 'Lato',
        scale: 1,
        rounded: 'sm',
        shadows: 'soft',
        dividerStyle: 'filigree',
        logoHeight: 60,
    },

    // 2. BURGER & STREET FOOD (Ref: Image 0 - "Burgoo", bold orange/brown)
    {
        id: 'street-burger',
        name: 'Street Burger',
        description: 'Energico e audace. Colori forti per appetiti forti.',
        category: 'bar',
        colors: {
            primary: '#EA580C',     // Vivid Orange
            secondary: '#F59E0B',   // Cheese Yellow
            background: '#FFF7ED',  // Light Orange Tint
            surface: '#FFFFFF',
            text: '#431407',        // Dark Brown
            textSecondary: '#78350F', // Lighter Brown
            accent: '#D97706',
            border: '#FDBA74',      // Orange Border
            price: '#EA580C',       // Orange Price
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

    // 3. SWEET BAKERY / Y2K (Ref: Image 1 - Pink, playful)
    {
        id: 'candy-pop',
        name: 'Candy Pop',
        description: 'Dolce, rosa e giocoso. Perfetto per dolci e gelati.',
        category: 'cafe',
        colors: {
            primary: '#EC4899',     // Hot Pink
            secondary: '#A855F7',   // Purple
            background: '#FDF2F8',  // Pink Rose
            surface: '#FFFFFF',
            text: '#831843',        // Dark Pink Text
            textSecondary: '#9D174D',
            accent: '#F472B6',
            border: '#FBCFE8',      // Pink Border
            price: '#DB2777',       // Pink Price
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

    // 4. SEAFOOD / FRESH (Ref: Image 2 - Blue watercolors)
    {
        id: 'freschezze-mare',
        name: 'Freschezze di Mare',
        description: 'Fresco come l\'oceano. Toni azzurri e acquerello.',
        category: 'restaurant',
        colors: {
            primary: '#0284C7',     // Ocean Blue
            secondary: '#38BDF8',   // Light Blue
            background: '#F0F9FF',  // Sky Blue Tint
            surface: '#FFFFFF',
            text: '#0C4A6E',        // Deep Navy
            textSecondary: '#0369A1',
            accent: '#0EA5E9',
            border: '#BAE6FD',      // Light Blue Border
            price: '#0284C7',       // Blue Price
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


];

export const DEFAULT_THEME = THEME_PRESETS[0];
