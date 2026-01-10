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

                // Granular Variables
                '--tenant-price-bg': colors.priceBackground || 'transparent',
                '--tenant-badge-bg': colors.badgeBackground || colors.accent,
                '--tenant-badge-text': colors.badgeText ?? colors.surface,
                '--tenant-footer-bg': colors.footerBackground || colors.background, // Fallback to main background
                '--tenant-footer-text': colors.footerText ?? colors.textSecondary,
                '--tenant-header-bg': colors.headerBackground ?? colors.surface,
                '--tenant-header-text': colors.headerText ?? colors.primary,
                '--tenant-overlay': colors.overlay ?? colors.primary,
                '--tenant-overlay-opacity': colors.overlayOpacity ?? 0.1,
                '--tenant-text-shadow': currentTheme.textShadow ?? 'none',
            } as React.CSSProperties}
        >
            {getFontUrl() && (
                <link rel="stylesheet" href={getFontUrl()} />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
            .theme-heading { font-family: '${fontHeading}', serif; text-shadow: var(--tenant-text-shadow); }
            .theme-body { font-family: '${fontBody}', sans-serif; text-shadow: var(--tenant-text-shadow); }
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
