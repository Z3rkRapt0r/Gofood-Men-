export type FrameStyle = 'none' | 'simple' | 'double' | 'elegant' | 'wooden' | 'geometric' | 'gold-leaf' | 'minimal';
export type TextureType = 'none' | 'paper' | 'grain' | 'slate' | 'fabric' | 'marble' | 'wood';
export type PatternType = 'none' | 'dots' | 'lines' | 'waves' | 'grid' | 'leaves' | 'japanese-waves';
export type AnimationType = 'none' | 'fade' | 'slide' | 'zoom' | 'float';
export type ElementStyle = 'modern' | 'vintage' | ' handwritten' | 'bold';
export type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'wavy' | 'slash' | 'filigree';

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
    price: string;
    success: string;
}

export interface ThemeConfig {
    id: string;
    name: string;
    colors: ThemeColors;
    frame: FrameStyle;
    texture: TextureType;
    pattern: PatternType;
    fontHeading: string;
    fontBody: string;
    scale: number; // 0.8 to 1.2
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadows: 'none' | 'soft' | 'hard' | 'floating';
    dividerStyle: DividerStyle;
    logoHeight?: number; // Pixel height for logo (default 40-50)
    mobileHeaderStyle?: 'center' | 'left';
}

export interface ThemePreset extends ThemeConfig {
    description: string;
    category: 'restaurant' | 'cafe' | 'bar' | 'other';
}
