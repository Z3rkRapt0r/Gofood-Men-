'use client';

import React from 'react';
import { useTheme } from './ThemeContext';

export function TextureOverlay() {
    const { currentTheme } = useTheme();
    const { texture, pattern, colors } = currentTheme;

    const getTextureStyle = (): React.CSSProperties => {
        switch (texture) {
            case 'paper':
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    filter: 'contrast(120%) brightness(100%)',
                    mixBlendMode: 'multiply',
                };
            case 'grain':
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                    opacity: 0.4,
                    mixBlendMode: 'multiply', // Changed from overlay to ensure visibility
                };
            case 'slate': // Implement Slate
                return {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                    filter: 'contrast(150%) brightness(90%)',
                    mixBlendMode: 'multiply',
                };
            default:
                return {};
        }
    };

    const getPatternStyle = (): React.CSSProperties => {
        switch (pattern) {
            case 'dots':
                return {
                    backgroundImage: `radial-gradient(${colors.secondary} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    opacity: 0.2
                };
            case 'grid':
                return {
                    backgroundImage: `linear-gradient(${colors.secondary} 1px, transparent 1px), linear-gradient(90deg, ${colors.secondary} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.1
                };
            case 'japanese-waves':
                return {
                    backgroundImage: `radial-gradient(circle, transparent 20%, ${colors.surface} 20%, ${colors.surface} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${colors.surface} 20%, ${colors.surface} 80%, transparent 80%, transparent) `,
                    backgroundSize: '30px 30px',
                    backgroundPosition: '0 0, 15px 15px',
                    opacity: 0.05
                };
            default:
                return {};
        }
    };

    return (
        <>
            {/* Base Background Color */}
            <div
                className="absolute inset-0 z-0 transition-colors duration-500"
                style={{ backgroundColor: colors.background }}
            />

            {/* Pattern Layer */}
            {pattern !== 'none' && (
                <div
                    className="absolute inset-0 z-1 pointer-events-none transition-all duration-500"
                    style={getPatternStyle()}
                />
            )}

            {/* Texture Layer */}
            {texture !== 'none' && (
                <div
                    className="absolute inset-0 z-2 pointer-events-none mix-blend-multiply opacity-50"
                    style={getTextureStyle()}
                />
            )}
        </>
    );
}
