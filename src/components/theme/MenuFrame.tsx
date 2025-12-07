'use client';

import React from 'react';
import { useTheme } from './ThemeContext';

export function MenuFrame({ children }: { children: React.ReactNode }) {
    const { currentTheme } = useTheme();
    const { frame, colors, rounded, shadows } = currentTheme;

    const getFrameStyles = () => {
        switch (frame) {
            case 'simple':
                return `border-4 border-[${colors.primary}]`;
            case 'double':
                return `border-4 border-[${colors.primary}] ring-4 ring-[${colors.secondary}] ring-offset-4 ring-offset-[${colors.background}]`;
            case 'elegant':
                return `border border-[${colors.primary}] shadow-[0_0_0_4px_${colors.secondary},0_0_0_8px_${colors.primary}]`;
            case 'wooden':
                return `border-[12px] border-[#8B4513] shadow-inner`;
            case 'gold-leaf':
                return `border-[2px] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)]`;
            case 'minimal':
                return `border border-gray-200`;
            case 'none':
            default:
                return '';
        }
    };

    const getShadowStyles = () => {
        switch (shadows) {
            case 'soft': return 'shadow-xl';
            case 'hard': return 'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]';
            case 'floating': return 'shadow-2xl hover:translate-y-[-4px] transition-transform duration-500';
            case 'none': return '';
            default: return 'shadow-md';
        }
    };

    // Safe rounded classes mapping
    const getRoundedClass = () => {
        switch (rounded) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'full': return 'rounded-3xl'; // using 3xl for full menu card
            default: return 'rounded-none';
        }
    };

    // Inline styles for dynamic colors where tailwind arbitrary values might struggle with variable interpolation in strings
    const frameStyle: React.CSSProperties = {
        borderColor: frame === 'wooden' ? undefined : colors.primary
    };

    if (frame === 'double') {
        // Complex ring logic is easier with direct style injection for dynamic colors
        // but let's stick to inline styles for the wrapper to be safe
    }

    return (
        <div
            className={`
        relative w-full mx-auto 
        ${getShadowStyles()}
        ${getRoundedClass()}
        overflow-hidden
        transition-all duration-300
      `}
            style={{
                boxShadow: shadows === 'floating' ? `0 25px 50px -12px ${colors.primary}20` : undefined
            }}
        >
            {/* Frame Border Layer */}
            <div
                className={`absolute inset-0 pointer-events-none z-20 ${getRoundedClass()}`}
                style={{
                    borderWidth: frame === 'simple' ? '4px' : frame === 'minimal' ? '1px' : frame === 'gold-leaf' ? '2px' : '0px',
                    borderColor: colors.border || colors.primary,
                    // Custom frame logic
                    boxShadow: frame === 'elegant' ? `inset 0 0 0 4px ${colors.border || colors.secondary}, inset 0 0 0 8px ${colors.border || colors.primary}` : undefined
                }}
            />

            {/* Wooden Frame Exception */}
            {frame === 'wooden' && (
                <div className="absolute inset-0 z-20 pointer-events-none border-[12px] border-[#5D4037] opacity-90 rounded-none mix-blend-multiply" />
            )}

            {children}
        </div>
    );
}
