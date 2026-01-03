// Edibles Mode Recipe Templates
// Pre-built ratio formulas for common edible types

import type { VolumeUnit } from './types';

export interface EdibleIngredientTemplate {
    name: string;
    type: 'base' | 'carrier' | 'terpene';
    ratioPercent: number;  // Percentage of total batch weight
    costPerKg: number;     // Default cost
    unit: VolumeUnit;
    densityGPerMl: number;
    optional?: boolean;
    notes?: string;
}

export interface EdibleRecipeTemplate {
    id: string;
    name: string;
    description: string;
    extractType: 'rosin' | 'distillate' | 'isolate' | 'fso';
    defaultExtractPotency: number;  // Default THC/CBD % of extract
    defaultMoldSizeGrams: number;
    ingredients: EdibleIngredientTemplate[];
}

// Gummy Recipe (Gelatin-based) - Based on Hashtek formula
export const GUMMY_GELATIN_TEMPLATE: EdibleRecipeTemplate = {
    id: 'gummy_gelatin',
    name: 'Gelatin Gummies',
    description: 'Classic gelatin-based gummies with rosin or distillate',
    extractType: 'rosin',
    defaultExtractPotency: 70,  // 70% THC/CBD typical for rosin
    defaultMoldSizeGrams: 3.75, // Standard mold size
    ingredients: [
        { name: 'Water', type: 'base', ratioPercent: 42.06, costPerKg: 0.01, unit: 'g', densityGPerMl: 1.0, notes: 'Distilled preferred' },
        { name: 'Sugar', type: 'base', ratioPercent: 52.57, costPerKg: 2.5, unit: 'g', densityGPerMl: 1.55 },
        { name: 'Gelatin (200 Bloom)', type: 'base', ratioPercent: 3.33, costPerKg: 25, unit: 'g', densityGPerMl: 1.3, notes: 'Sheet gelatin preferred' },
        { name: 'Citric Acid', type: 'terpene', ratioPercent: 1.05, costPerKg: 8, unit: 'g', densityGPerMl: 1.66 },
        { name: 'Liquid Lecithin', type: 'carrier', ratioPercent: 0.23, costPerKg: 15, unit: 'g', densityGPerMl: 1.03, notes: 'Emulsifier' },
        { name: 'Lemon Juice', type: 'terpene', ratioPercent: 1.5, costPerKg: 3, unit: 'ml', densityGPerMl: 1.03, optional: true, notes: 'For citrus flavor' },
        { name: 'Potassium Sorbate', type: 'base', ratioPercent: 0.01, costPerKg: 12, unit: 'g', densityGPerMl: 1.36, optional: true, notes: 'Preservative' },
    ]
};

// Vegan Gummy (Pectin-based)
export const GUMMY_PECTIN_TEMPLATE: EdibleRecipeTemplate = {
    id: 'gummy_pectin',
    name: 'Vegan Gummies (Pectin)',
    description: 'Pectin-based vegan gummies with distillate',
    extractType: 'distillate',
    defaultExtractPotency: 85,  // 85% typical for distillate
    defaultMoldSizeGrams: 3.5,
    ingredients: [
        { name: 'Water', type: 'base', ratioPercent: 35, costPerKg: 0.01, unit: 'g', densityGPerMl: 1.0 },
        { name: 'Sugar', type: 'base', ratioPercent: 55, costPerKg: 2.5, unit: 'g', densityGPerMl: 1.55 },
        { name: 'Pectin', type: 'base', ratioPercent: 3, costPerKg: 35, unit: 'g', densityGPerMl: 1.5 },
        { name: 'Citric Acid', type: 'terpene', ratioPercent: 1.5, costPerKg: 8, unit: 'g', densityGPerMl: 1.66 },
        { name: 'MCT Oil', type: 'carrier', ratioPercent: 2, costPerKg: 12, unit: 'ml', densityGPerMl: 0.92, notes: 'Carrier for distillate' },
        { name: 'Fruit Puree', type: 'base', ratioPercent: 3, costPerKg: 5, unit: 'g', densityGPerMl: 1.05, optional: true, notes: 'Natural flavor' },
    ]
};

// Chocolate Template
export const CHOCOLATE_TEMPLATE: EdibleRecipeTemplate = {
    id: 'chocolate',
    name: 'Cannabis Chocolate',
    description: 'Infused chocolate using cocoa butter and distillate',
    extractType: 'distillate',
    defaultExtractPotency: 85,
    defaultMoldSizeGrams: 10,  // Typical chocolate square
    ingredients: [
        { name: 'Cocoa Butter', type: 'carrier', ratioPercent: 35, costPerKg: 25, unit: 'g', densityGPerMl: 0.91 },
        { name: 'Cocoa Powder', type: 'base', ratioPercent: 25, costPerKg: 15, unit: 'g', densityGPerMl: 0.5 },
        { name: 'Sugar', type: 'base', ratioPercent: 38, costPerKg: 2.5, unit: 'g', densityGPerMl: 1.55 },
        { name: 'Lecithin', type: 'carrier', ratioPercent: 2, costPerKg: 15, unit: 'g', densityGPerMl: 1.03, notes: 'Emulsifier' },
    ]
};

// Tincture Template
export const TINCTURE_TEMPLATE: EdibleRecipeTemplate = {
    id: 'tincture',
    name: 'MCT Tincture',
    description: 'Simple MCT oil-based sublingual tincture',
    extractType: 'distillate',
    defaultExtractPotency: 85,
    defaultMoldSizeGrams: 1,  // 1ml dropper serving
    ingredients: [
        { name: 'MCT Oil', type: 'carrier', ratioPercent: 96, costPerKg: 12, unit: 'ml', densityGPerMl: 0.92 },
    ]
};

// All templates indexed by ID
export const EDIBLE_TEMPLATES: Record<string, EdibleRecipeTemplate> = {
    gummy_gelatin: GUMMY_GELATIN_TEMPLATE,
    gummy_pectin: GUMMY_PECTIN_TEMPLATE,
    chocolate: CHOCOLATE_TEMPLATE,
    tincture: TINCTURE_TEMPLATE,
};

// Helper: Calculate extract needed for target potency
export function calculateExtractNeeded(
    numUnits: number,
    targetMgPerUnit: number,
    extractPotencyPercent: number
): number {
    // Formula: (units × mg_per_unit) / (potency% × 10)
    // Result in grams
    return (numUnits * targetMgPerUnit) / (extractPotencyPercent * 10);
}

// Helper: Generate ingredient amounts from template
export function generateIngredientsFromTemplate(
    template: EdibleRecipeTemplate,
    totalBatchGrams: number,
    extractGrams: number
): Array<{ name: string; amountGrams: number; costPerKg: number; type: 'base' | 'carrier' | 'terpene'; optional: boolean }> {
    // Calculate non-extract weight (batch - extract)
    const baseWeight = totalBatchGrams - extractGrams;

    return template.ingredients.map(ing => ({
        name: ing.name,
        amountGrams: (baseWeight * ing.ratioPercent) / 100,
        costPerKg: ing.costPerKg,
        type: ing.type,
        optional: ing.optional || false,
    }));
}
