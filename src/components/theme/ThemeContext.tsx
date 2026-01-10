'use client';

import React, { createContext, useContext, useState } from 'react';
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
        if (!initialTheme || Object.keys(initialTheme).length === 0) {
            return DEFAULT_THEME;
        }
        return {
            ...DEFAULT_THEME,
            ...initialTheme,
            colors: { ...DEFAULT_THEME.colors, ...(initialTheme.colors || {}) }
        };
    });

    // Update state when initialTheme changes (e.g. loaded from DB)
    React.useEffect(() => {
        if (initialTheme && Object.keys(initialTheme).length > 0) {
            setCurrentTheme((prev) => ({
                ...DEFAULT_THEME,
                ...initialTheme,
                colors: { ...DEFAULT_THEME.colors, ...(initialTheme.colors || {}) }
            }));
        }
    }, [initialTheme]);

    const applyPreset = (presetId: string) => {
        const preset = THEME_PRESETS.find((p) => p.id === presetId);
        if (preset) {
            setCurrentTheme(preset);
        }
    };

    const updateTheme = (updates: Partial<ThemeConfig>) => {
        setCurrentTheme((prev) => ({ ...prev, ...updates }));
    };

    const value = React.useMemo(() => ({
        currentTheme,
        setTheme: setCurrentTheme,
        applyPreset,
        updateTheme,
        presets: THEME_PRESETS,
    }), [currentTheme]);

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
