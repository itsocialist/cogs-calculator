import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Unit scale options
export type WeightScale = 'g' | 'kg';
export type VolumeScale = 'ml' | 'L' | 'floz';
export type SKUUnit = 'g' | 'ml' | 'oz';

// Config for each section
export interface UnitConfig {
    batch: {
        type: 'weight' | 'volume';
        weightScale: WeightScale;
        volumeScale: VolumeScale;
    };
    manifest: {
        weightScale: WeightScale;
        volumeScale: VolumeScale;
    };
    sku: {
        defaultUnit: SKUUnit;
    };
}

// Defaults
const DEFAULT_CONFIG: UnitConfig = {
    batch: {
        type: 'volume',
        weightScale: 'kg',
        volumeScale: 'L'
    },
    manifest: {
        weightScale: 'g',
        volumeScale: 'ml'
    },
    sku: {
        defaultUnit: 'ml'
    }
};

// Conversion helpers
export const CONVERSIONS = {
    floz_to_ml: 29.574,
    L_to_ml: 1000,
    kg_to_g: 1000,
    oz_to_g: 28.35
};

export function convertToMl(value: number, scale: VolumeScale): number {
    switch (scale) {
        case 'ml': return value;
        case 'L': return value * CONVERSIONS.L_to_ml;
        case 'floz': return value * CONVERSIONS.floz_to_ml;
    }
}

export function convertFromMl(ml: number, scale: VolumeScale): number {
    switch (scale) {
        case 'ml': return ml;
        case 'L': return ml / CONVERSIONS.L_to_ml;
        case 'floz': return ml / CONVERSIONS.floz_to_ml;
    }
}

export function convertToGrams(value: number, scale: WeightScale): number {
    switch (scale) {
        case 'g': return value;
        case 'kg': return value * CONVERSIONS.kg_to_g;
    }
}

export function convertFromGrams(grams: number, scale: WeightScale): number {
    switch (scale) {
        case 'g': return grams;
        case 'kg': return grams / CONVERSIONS.kg_to_g;
    }
}

// Context
interface ConfigContextType {
    config: UnitConfig;
    setConfig: (config: UnitConfig) => void;
    updateBatchConfig: (updates: Partial<UnitConfig['batch']>) => void;
    updateManifestConfig: (updates: Partial<UnitConfig['manifest']>) => void;
    updateSKUConfig: (updates: Partial<UnitConfig['sku']>) => void;
    convertFromGrams: (grams: number, scale: WeightScale) => number;
    convertToGrams: (value: number, scale: WeightScale) => number;
    convertFromMl: (ml: number, scale: VolumeScale) => number;
    convertToMl: (value: number, scale: VolumeScale) => number;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

const STORAGE_KEY = 'rolos-unit-config';

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfigState] = useState<UnitConfig>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            } catch {
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }, [config]);

    const setConfig = (newConfig: UnitConfig) => {
        setConfigState(newConfig);
    };

    const updateBatchConfig = (updates: Partial<UnitConfig['batch']>) => {
        setConfigState(prev => ({ ...prev, batch: { ...prev.batch, ...updates } }));
    };

    const updateManifestConfig = (updates: Partial<UnitConfig['manifest']>) => {
        setConfigState(prev => ({ ...prev, manifest: { ...prev.manifest, ...updates } }));
    };

    const updateSKUConfig = (updates: Partial<UnitConfig['sku']>) => {
        setConfigState(prev => ({ ...prev, sku: { ...prev.sku, ...updates } }));
    };

    return (
        <ConfigContext.Provider value={{
            config,
            setConfig,
            updateBatchConfig,
            updateManifestConfig,
            updateSKUConfig,
            convertFromGrams,
            convertToGrams,
            convertFromMl,
            convertToMl
        }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const ctx = useContext(ConfigContext);
    if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
    return ctx;
}
