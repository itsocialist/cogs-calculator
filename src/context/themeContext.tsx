import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'production' | 'glass';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'rolos-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored === 'production' || stored === 'glass') ? stored : 'glass';
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme);
        // Apply theme class to document root
        document.documentElement.classList.remove('theme-production', 'theme-glass');
        document.documentElement.classList.add(`theme-${theme}`);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => prev === 'glass' ? 'production' : 'glass');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
