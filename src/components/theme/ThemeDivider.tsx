import React from 'react';
import { DividerStyle } from '@/lib/theme-engine/types';

interface ThemeDividerProps {
    dividerStyle?: DividerStyle;
    color?: string; // Should be a CSS var or color string
    className?: string;
}

export const ThemeDivider: React.FC<ThemeDividerProps> = ({
    dividerStyle = 'solid',
    color = 'var(--tenant-border)',
    className = ''
}) => {

    // Base styles for all dividers
    const baseStyle: React.CSSProperties = {
        borderColor: color,
        width: '100%',
        opacity: 0.6,
    };



    if (dividerStyle === 'wavy') {
        // True wavy line
        // True wavy line
        return (
            <div className={`h-3 w-full ${className}`} style={{
                color: color, // For currentColor to work if possible, but bg images need explicit color usually. 
                // Since we can't easily pass var() to SVG data URI without extensive hacks (mask-image), 
                // we will use mask-image which is cleaner for coloring.
                backgroundColor: color,
                maskImage: `url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 5 0 10 5 T 20 5' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E")`,
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 5 0 10 5 T 20 5' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E")`,
                maskRepeat: 'repeat-x',
                WebkitMaskRepeat: 'repeat-x',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                opacity: 0.8
            }} />
        );
    }

    if (dividerStyle === 'slash') {
        // Slash/Diagonal pattern (Street Style)
        return (
            <div className={`h-3 w-full ${className}`} style={{
                backgroundColor: color,
                // Diagonal line path
                maskImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 12 L12 -2' stroke='black' stroke-width='2'/%3E%3C/svg%3E")`,
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 12 L12 -2' stroke='black' stroke-width='2'/%3E%3C/svg%3E")`,
                maskRepeat: 'repeat-x',
                WebkitMaskRepeat: 'repeat-x',
                maskSize: '10px 10px',
                WebkitMaskSize: '10px 10px',
                opacity: 0.8
            }} />
        );
    }

    if (dividerStyle === 'filigree') {
        // A more complex ornamental pattern
        return (
            <div className={`h-4 w-full ${className}`} style={{
                backgroundColor: color,
                maskImage: `url("data:image/svg+xml,%3Csvg width='40' height='10' viewBox='0 0 40 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 10 0 20 5 T 40 5' fill='none' stroke='black' stroke-width='1'/%3E%3Ccircle cx='20' cy='5' r='2' fill='black'/%3E%3C/svg%3E")`,
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='40' height='10' viewBox='0 0 40 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q 10 0 20 5 T 40 5' fill='none' stroke='black' stroke-width='1'/%3E%3Ccircle cx='20' cy='5' r='2' fill='black'/%3E%3C/svg%3E")`,
                maskRepeat: 'repeat-x',
                WebkitMaskRepeat: 'repeat-x',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                opacity: 0.8
            }} />
        );
    }

    if (dividerStyle === 'double') {
        return (
            <div
                className={`border-t-4 ${className}`}
                style={{
                    ...baseStyle,
                    borderTopStyle: 'double',
                    height: '4px' // Double needs height
                }}
            />
        );
    }

    if (dividerStyle === 'groove') {
        return (
            <div
                className={`border-t-2 ${className}`}
                style={{
                    ...baseStyle,
                    borderTopStyle: 'groove',
                }}
            />
        );
    }

    // Default: solid, dashed, dotted
    return (
        <div
            className={`border-t ${className}`}
            style={{
                ...baseStyle,
                borderTopStyle: dividerStyle as React.CSSProperties['borderTopStyle'] // solid, dashed, dotted are valid CSS
            }}
        />
    );
};
