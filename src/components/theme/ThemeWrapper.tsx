'use client';

import React from 'react';
import { useTheme } from './ThemeContext';
import { MenuFrame } from './MenuFrame';

export function ThemeWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
    const { currentTheme } = useTheme();
    const { fontHeading, fontBody, colors } = currentTheme;

    // Helper to construct Google Fonts URL
    const getFontUrl = () => {
        const fonts = [fontHeading, fontBody].filter(f => f && f !== 'sans-serif' && f !== 'serif');
        const uniqueFonts = [...new Set(fonts)];
        if (uniqueFonts.length === 0) return '';

        const query = uniqueFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
        return `https://fonts.googleapis.com/css2?${query}&display=swap`;
    };

    return (
        <div
            className={`relative w-full min-h-[600px] flex flex-col ${className || ''}`}
            style={{
                fontFamily: fontBody,
                '--tenant-primary': colors.primary,
                '--tenant-secondary': colors.secondary,
                '--tenant-background': colors.background,
                '--tenant-surface': colors.surface,
                '--tenant-text': colors.text,
                '--tenant-text-secondary': colors.textSecondary,
                '--tenant-border': colors.border,
                '--tenant-price': colors.price,
                '--tenant-accent': colors.accent,
                '--tenant-success': colors.success,
            } as React.CSSProperties}
        >
            {getFontUrl() && (
                <link rel="stylesheet" href={getFontUrl()} />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
            .theme-heading { font-family: '${fontHeading}', serif; }
            .theme-body { font-family: '${fontBody}', sans-serif; }
        `}} />

            <MenuFrame>
                {/* Content Layer */}
                <div className="relative z-10 h-full bg-[var(--tenant-background,#FFF8E7)]">
                    {children}
                </div>
            </MenuFrame>
        </div>
    );
}
