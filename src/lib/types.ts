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

    // Recipe Definition (Per Base Unit)
    unit: VolumeUnit;
    amount: number;           // Amount per base unit (replaces amountInUnit)
    densityGPerMl: number;

    // Computed Fields
    gramsPerRecipeUnit: number; // Derived from amount/unit/density
    gramsInBatch: number;       // Derived from gramsPerRecipeUnit * totalBaseUnits
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
    unitSizeUnit: 'g' | 'ml' | 'oz';
    quantity: number;
    packaging: PackagingItem[];
    wholesalePrice: number;
    msrp: number;
}

// NEW: Recipe configuration for base unit
export interface RecipeConfig {
    baseUnitSize: number;           // Size in grams (e.g., 28.35 for 1 oz)
    baseUnitLabel: string;          // Human-readable (e.g., "1 oz jar")
    targetPotencyMg: number;        // Target potency per base unit
    density: number;                // g/ml for volume calculations (default 0.95)
}

// UPDATED: Batch configuration with volume-based scaling
export interface BatchConfig {
    productName: string;

    // Volume-based input
    targetVolumeMl: number;         // Target batch volume in ml

    // Legacy field (will be auto-calculated)
    batchSizeKg: number;

    // Moved from BatchConfig to RecipeConfig
    // targetPotencyMg: number;     // DEPRECATED - now in RecipeConfig

    // Labor costs
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
    version?: string;  // Calculator version (e.g., "0.1.0")
    config: {
        recipeConfig: RecipeConfig;
        batchConfig: BatchConfig;
        activeIngredients: ActiveIngredient[];
        inactiveIngredients: InactiveIngredient[];
        skus: SKU[];
        logistics: LogisticsConfig;
        pricing: PricingConfig;
    };
    cost: number;
}

// Recipe Library - Saved Recipes
export type RecipeMode = 'topical' | 'edibles';
export type EdibleProductType = 'gummy' | 'chocolate' | 'tincture' | 'custom';

export interface SavedRecipe {
    id: string;
    name: string;
    description?: string;
    createdAt: string;  // ISO date string
    updatedAt: string;  // ISO date string

    // Mode
    mode: RecipeMode;
    productType?: EdibleProductType;

    // Recipe Config
    recipeConfig: RecipeConfig;

    // Ingredients (formulation only, no computed fields)
    activeIngredients: Array<{
        name: string;
        costPerKg: number;
        unit: VolumeUnit;
        amount: number;
        densityGPerMl: number;
        purityPercent: number;
        cannabinoid: CannabinoidType;
    }>;
    inactiveIngredients: Array<{
        name: string;
        costPerKg: number;
        unit: VolumeUnit;
        amount: number;
        densityGPerMl: number;
        type: 'base' | 'carrier' | 'terpene';
    }>;

    // Tags for organization
    tags?: string[];
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
