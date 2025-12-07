'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeConfig, ThemePreset } from '@/lib/theme-engine/types';
import { DEFAULT_THEME, THEME_PRESETS } from '@/lib/theme-engine/presets';

interface ThemeContextType {
    currentTheme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
    applyPreset: (presetId: string) => void;
    updateTheme: (updates: Partial<ThemeConfig>) => void;
    presets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: ThemeConfig }) {
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
        // Handle case where initialTheme is null, undefined, or empty object
        if (!initialTheme || Object.keys(initialTheme).length === 0) {
            return DEFAULT_THEME;
        }
        // Merge with defaults to ensure all required properties exist (like colors)
        return {
            ...DEFAULT_THEME,
            ...initialTheme,
            colors: { ...DEFAULT_THEME.colors, ...(initialTheme.colors || {}) }
        };
    });

    const applyPreset = (presetId: string) => {
        const preset = THEME_PRESETS.find((p) => p.id === presetId);
        if (preset) {
            setCurrentTheme(preset);
        }
    };

    const updateTheme = (updates: Partial<ThemeConfig>) => {
        setCurrentTheme((prev) => ({ ...prev, ...updates }));
    };

    const value = {
        currentTheme,
        setTheme: setCurrentTheme,
        applyPreset,
        updateTheme,
        presets: THEME_PRESETS,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
