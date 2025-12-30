// Volume unit types and conversion
export type VolumeUnit = 'g' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'floz';

// Conversion to ml (null means it's weight, not volume)
export const VOLUME_TO_ML: Record<VolumeUnit, number | null> = {
    g: null,      // weight, needs density for conversion
    ml: 1,
    tsp: 4.929,
    tbsp: 14.787,
    floz: 29.574,
    cup: 236.588,
};

// Default densities (g/ml) for common ingredient types
export const DEFAULT_DENSITIES: Record<string, number> = {
    'CBD Isolate': 1.0,
    'CBG Isolate': 1.0,
    'CBN Isolate': 1.0,
    'MCT Oil': 0.92,
    'Coconut Oil': 0.92,
    'Organic Shea Butter': 0.95,
    'Shea Butter': 0.95,
    'Beeswax': 0.95,
    'Beeswax Pellets': 0.95,
    'Essential Oil': 0.90,
    'Lavender Essential Oil': 0.90,
    'Menthol Crystals': 1.0,
    'Water': 1.0,
};

// Smart default units based on ingredient type
export const DEFAULT_UNITS: Record<string, VolumeUnit> = {
    'active': 'g',      // Isolates measured in grams
    'base': 'cup',      // Shea butter, beeswax in cups
    'carrier': 'cup',   // MCT, coconut oil in cups
    'terpene': 'tsp',   // Essential oils in tsp
};

// Base ingredient interface
// Cannabinoid types for active ingredients
export type CannabinoidType = 'CBD' | 'THC' | 'CBG' | 'CBN' | 'other';

export interface Ingredient {
    id: number;
    name: string;
    costPerKg: number;
    // Volume support fields
    unit: VolumeUnit;
    amountInUnit: number;
    densityGPerMl: number;
    // Computed field (kept for backward compatibility)
    gramsInBatch: number;
}

export interface ActiveIngredient extends Ingredient {
    purityPercent: number;
    type: 'active';
    cannabinoid: CannabinoidType;
}

export interface InactiveIngredient extends Ingredient {
    type: 'base' | 'carrier' | 'terpene';
}

export interface PackagingItem {
    id: number;
    name: string;
    costPerUnit: number;
}

export interface SKU {
    id: number;
    name: string;
    unitSizeValue: number;
    unitSizeUnit: 'g' | 'ml' | 'floz';
    quantity: number;
    packaging: PackagingItem[];
    wholesalePrice: number;
}

export interface BatchConfig {
    productName: string;
    batchSizeKg: number;
    targetPotencyMg: number;
    laborRate: number;
    laborHours: number;
    fulfillmentCost: number;
}


export interface DistroFee {
    id: number;
    name: string;
    percent: number;
}

export interface LogisticsConfig {
    labTestingFee: number;
    shippingToDistro: number;
    distroFees: DistroFee[];
}

export interface PricingConfig {
    wholesale: number;
    msrp: number;
}

export interface Snapshot {
    id: number;
    name: string;
    config: {
        batchConfig: BatchConfig;
        activeIngredients: ActiveIngredient[];
        inactiveIngredients: InactiveIngredient[];
        skus: SKU[];
        logistics: LogisticsConfig;
        pricing: PricingConfig;
    };
    cost: number;
}

// Helper function to convert amount to grams
export function convertToGrams(amount: number, unit: VolumeUnit, densityGPerMl: number): number {
    const mlFactor = VOLUME_TO_ML[unit];
    if (mlFactor === null) {
        // Unit is 'g', already in grams
        return amount;
    }
    // Convert to ml, then apply density
    const ml = amount * mlFactor;
    return ml * densityGPerMl;
}

// Helper to get density for ingredient name
export function getDensityForIngredient(name: string): number {
    // Try exact match first
    if (DEFAULT_DENSITIES[name]) {
        return DEFAULT_DENSITIES[name];
    }
    // Try partial match
    for (const key of Object.keys(DEFAULT_DENSITIES)) {
        if (name.toLowerCase().includes(key.toLowerCase())) {
            return DEFAULT_DENSITIES[key];
        }
    }
    // Default to 1.0 (water-like)
    return 1.0;
}

// Helper to get default unit for ingredient type
export function getDefaultUnit(type: 'active' | 'base' | 'carrier' | 'terpene'): VolumeUnit {
    return DEFAULT_UNITS[type] || 'g';
}
