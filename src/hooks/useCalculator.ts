
import { useState, useMemo, useEffect } from 'react';
import type {
    BatchConfig,
    ActiveIngredient,
    InactiveIngredient,
    PackagingItem,
    LogisticsConfig,
    Snapshot,
    SKU,
    RecipeConfig
} from '../lib/types';
import { convertToGrams } from '../lib/types';

// Unit conversions
const SALVE_DENSITY = 0.95; // g/ml - typical for balms/salves
const FLOZ_TO_ML = 29.574;
const OZ_TO_GRAMS = 28.35;

// Convert SKU size to grams
function skuSizeToGrams(sku: SKU, density: number = SALVE_DENSITY): number {
    switch (sku.unitSizeUnit) {
        case 'g':
            return sku.unitSizeValue;
        case 'ml':
            return sku.unitSizeValue * density;
        case 'oz':
            return sku.unitSizeValue * OZ_TO_GRAMS;
        default:
            return sku.unitSizeValue;
    }
}

// Default Packaging (used as template for new SKUs)
const DEFAULT_PACKAGING: PackagingItem[] = [
    { id: 1, name: "Amber Glass Jar (2oz)", costPerUnit: 1.15 },
    { id: 2, name: "Plastic Lid (Black)", costPerUnit: 0.25 },
    { id: 3, name: "Vinyl Label (Waterproof)", costPerUnit: 0.18 },
    { id: 4, name: "Outer Box (Soft Touch)", costPerUnit: 0.45 },
    { id: 5, name: "Tamper Seal", costPerUnit: 0.05 },
];

// Default Recipe Configuration (1 fl oz base unit)
const DEFAULT_RECIPE_CONFIG: RecipeConfig = {
    baseUnitSize: FLOZ_TO_ML * SALVE_DENSITY, // 1 fl oz ≈ 28.1g at 0.95 density
    baseUnitLabel: "1 fl oz",
    targetPotencyMg: 500,           // 500mg CBD per base unit
    density: SALVE_DENSITY          // 0.95 g/ml
};

// Defaults
const DEFAULT_BATCH_CONFIG: BatchConfig = {
    productName: "Recovery Salve",
    targetVolumeMl: 10000,          // 10 liters in ml
    batchSizeKg: 9.5,               // Will be auto-calculated
    laborRate: 25,
    laborHours: 6,
    fulfillmentCost: 2.50
};

// Recipe Defaults (Per Base Unit) for a 1oz (28g) Salve
const DEFAULT_ACTIVES: ActiveIngredient[] = [
    // 500mg CBD Isolate (~1.76% of 28.35g) = 0.5g
    { id: 1, name: "CBD Isolate", costPerKg: 550, unit: 'g', amount: 0.5, densityGPerMl: 1.0, gramsPerRecipeUnit: 0.5, gramsInBatch: 0, purityPercent: 99.5, type: 'active', cannabinoid: 'CBD' },
    // 25mg CBG Distillate = 0.025g
    { id: 2, name: "CBG Distillate", costPerKg: 1200, unit: 'g', amount: 0.03, densityGPerMl: 1.0, gramsPerRecipeUnit: 0.03, gramsInBatch: 0, purityPercent: 85, type: 'active', cannabinoid: 'CBG' },
];

const DEFAULT_INACTIVES: InactiveIngredient[] = [
    // Shea Butter ~ 12g
    { id: 101, name: "Organic Shea Butter", costPerKg: 18, unit: 'g', amount: 12, densityGPerMl: 0.95, gramsPerRecipeUnit: 12, gramsInBatch: 0, type: 'base' },
    // Beeswax ~ 8g
    { id: 102, name: "Beeswax Pellets", costPerKg: 22, unit: 'g', amount: 8, densityGPerMl: 0.95, gramsPerRecipeUnit: 8, gramsInBatch: 0, type: 'base' },
    // MCT ~ 6g
    { id: 103, name: "MCT Oil", costPerKg: 12, unit: 'g', amount: 6, densityGPerMl: 0.92, gramsPerRecipeUnit: 6, gramsInBatch: 0, type: 'carrier' },
    // Terpenes ~ 1.5g
    { id: 104, name: "Menthol Crystals", costPerKg: 45, unit: 'g', amount: 1.5, densityGPerMl: 1.0, gramsPerRecipeUnit: 1.5, gramsInBatch: 0, type: 'terpene' },
    { id: 105, name: "Lavender Essential Oil", costPerKg: 120, unit: 'ml', amount: 0.3, densityGPerMl: 0.9, gramsPerRecipeUnit: 0.27, gramsInBatch: 0, type: 'terpene' },
];

const DEFAULT_SKUS: SKU[] = [
    {
        id: 1,
        name: "Recovery Salve 2oz",
        unitSizeValue: 60,
        unitSizeUnit: 'ml',
        quantity: 150,
        packaging: [...DEFAULT_PACKAGING],
        wholesalePrice: 24.99,
        msrp: 49.99
    }
];

const DEFAULT_LOGISTICS: LogisticsConfig = {
    labTestingFee: 700,
    shippingToDistro: 150,
    distroFees: [
        { id: 1, name: "Distributor Fee", percent: 15 },
        { id: 2, name: "Sales Commission", percent: 5 },
        { id: 3, name: "Distro Transfer Fee", percent: 0 },
    ]
};

// Per-SKU calculation result
export interface SKUCalculation {
    skuId: number;
    name: string;
    unitSizeGrams: number;
    unitSizeValue: number;
    unitSizeUnit: 'g' | 'ml' | 'oz';
    quantity: number;
    potencyMg: number;
    isPotencySafe: boolean;
    formulaCostPerUnit: number;
    packagingCostPerUnit: number;
    laborCostPerUnit: number;
    fulfillmentCostPerUnit: number;
    manufCostPerUnit: number;
    logisticsCostPerUnit: number;
    fullyLoadedCost: number;
    wholesalePrice: number;
    wholesaleMargin: number;
    wholesaleMarginPercent: number;
    msrp: number;
    retailMargin: number;
    retailMarginPercent: number;
}

export function useCalculator() {
    // State
    const [recipeConfig, setRecipeConfig] = useState<RecipeConfig>(DEFAULT_RECIPE_CONFIG);
    const [batchConfig, setBatchConfig] = useState<BatchConfig>(DEFAULT_BATCH_CONFIG);
    const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>(DEFAULT_ACTIVES);
    const [inactiveIngredients, setInactiveIngredients] = useState<InactiveIngredient[]>(DEFAULT_INACTIVES);
    const [skus, setSkus] = useState<SKU[]>(DEFAULT_SKUS);
    const [logistics, setLogistics] = useState<LogisticsConfig>(DEFAULT_LOGISTICS);
    const [pricing, setPricing] = useState({ wholesale: 25, msrp: 55 });

    // Snapshots with localStorage persistence
    const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
        try {
            const saved = localStorage.getItem('rolos-cogs-snapshots');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist snapshots to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('rolos-cogs-snapshots', JSON.stringify(snapshots));
        } catch (e) {
            console.error('Failed to save snapshots:', e);
        }
    }, [snapshots]);

    // -------------------------------------------------------------------------
    // CORE CALCULATION LOOP
    // -------------------------------------------------------------------------

    // 1. Calculate Batch Scale (Volume -> Weight -> Units)
    const batchScale = useMemo(() => {
        // Start from Target Volume (ml)
        // Weight = Volume * Density
        const calculatedWeightG = batchConfig.targetVolumeMl * recipeConfig.density;

        // Base Units = Weight / Base Unit Size
        const calculatedBaseUnits = recipeConfig.baseUnitSize > 0
            ? calculatedWeightG / recipeConfig.baseUnitSize
            : 0;

        return { calculatedWeightG, calculatedBaseUnits };
    }, [batchConfig.targetVolumeMl, recipeConfig]);

    // 2. Synch batchConfig.batchSizeKg with calculated weight (for display consistency)
    // NOTE: In a real app, strict one-way flow might be better, but we keep batchSizeKg 
    // in sync here for UI inputs that expect it.
    useEffect(() => {
        const kg = batchScale.calculatedWeightG / 1000;
        if (Math.abs(kg - batchConfig.batchSizeKg) > 0.01) {
            setBatchConfig(prev => ({ ...prev, batchSizeKg: kg }));
        }
    }, [batchScale.calculatedWeightG]);

    // 3. Derive Ingredients with Values (Recipe -> Batch)
    const derivedActiveIngredients = useMemo(() => activeIngredients.map(i => {
        const gramsPerRecipeUnit = convertToGrams(i.amount, i.unit, i.densityGPerMl);
        return {
            ...i,
            gramsPerRecipeUnit,
            gramsInBatch: gramsPerRecipeUnit * batchScale.calculatedBaseUnits
        };
    }), [activeIngredients, batchScale.calculatedBaseUnits]);

    const derivedInactiveIngredients = useMemo(() => inactiveIngredients.map(i => {
        const gramsPerRecipeUnit = convertToGrams(i.amount, i.unit, i.densityGPerMl);
        return {
            ...i,
            gramsPerRecipeUnit,
            gramsInBatch: gramsPerRecipeUnit * batchScale.calculatedBaseUnits
        };
    }), [inactiveIngredients, batchScale.calculatedBaseUnits]);

    // 4. Perform Financial & Physical Calculations
    const calculations = useMemo(() => {
        // Formula weight (should match batchScale.calculatedWeightG ideally)
        const activeWeight = derivedActiveIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const inactiveWeight = derivedInactiveIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const totalBatchWeightGrams = activeWeight + inactiveWeight;

        // Total active mg in batch
        const totalActiveMg = derivedActiveIngredients.reduce((sum, item) => {
            const rawMg = item.gramsInBatch * 1000;
            const pureMg = rawMg * (item.purityPercent / 100);
            return sum + pureMg;
        }, 0);

        // Cannabinoid totals
        const cannabinoidTotals = derivedActiveIngredients.reduce((acc, item) => {
            const pureMg = item.gramsInBatch * 1000 * (item.purityPercent / 100);
            const type = item.cannabinoid || 'Other';
            acc[type] = (acc[type] || 0) + pureMg;
            return acc;
        }, {} as Record<string, number>);

        // Formula costs
        const activeCost = derivedActiveIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const inactiveCost = derivedInactiveIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const totalFormulaCost = activeCost + inactiveCost;

        // Total labor cost
        const totalLaborCost = batchConfig.laborRate * batchConfig.laborHours;

        // SKU-level calculations
        const totalUnitsAcrossSkus = skus.reduce((sum, sku) => sum + sku.quantity, 0);
        const totalWeightAllocated = skus.reduce((sum, sku) => sum + (skuSizeToGrams(sku) * sku.quantity), 0);
        const weightUtilization = totalBatchWeightGrams > 0 ? totalWeightAllocated / totalBatchWeightGrams : 0;
        const isOverAllocated = totalWeightAllocated > totalBatchWeightGrams;

        // Per-SKU calculations
        const skuCalculations: SKUCalculation[] = skus.map(sku => {
            const unitSizeGrams = skuSizeToGrams(sku);
            const skuWeightGrams = unitSizeGrams * sku.quantity;
            const weightRatio = totalBatchWeightGrams > 0 ? skuWeightGrams / totalBatchWeightGrams : 0;
            const unitRatio = totalUnitsAcrossSkus > 0 ? sku.quantity / totalUnitsAcrossSkus : 0;

            // Potency per unit for this SKU
            // Simple formula-based: mg per gram of formula × SKU size in grams
            const mgPerGramFormula = totalBatchWeightGrams > 0
                ? totalActiveMg / totalBatchWeightGrams
                : 0;
            const potencyMg = mgPerGramFormula * unitSizeGrams;

            // Check against recipe target potency (scaled to SKU size)
            // If base unit is 1oz (28g) and target is 500mg, then a 2oz SKU should be 1000mg.
            // Target Potency Density = targetPotencyMg / baseUnitSize
            const targetPotencyPerGram = recipeConfig.baseUnitSize > 0
                ? recipeConfig.targetPotencyMg / recipeConfig.baseUnitSize
                : 0;
            const targetSkuPotency = targetPotencyPerGram * unitSizeGrams;

            const isPotencySafe = Math.abs(potencyMg - targetSkuPotency) < (targetSkuPotency * 0.1);

            // Formula cost allocated by weight
            const formulaCostPerUnit = sku.quantity > 0 ? (totalFormulaCost * weightRatio) / sku.quantity : 0;

            // Packaging cost
            const packagingCostPerUnit = sku.packaging.reduce((sum, p) => sum + p.costPerUnit, 0);

            // Labor allocated by unit count
            const laborCostPerUnit = sku.quantity > 0 ? (totalLaborCost * unitRatio) / sku.quantity : 0;

            // Fulfillment is per-unit
            const fulfillmentCostPerUnit = batchConfig.fulfillmentCost;

            const manufCostPerUnit = formulaCostPerUnit + packagingCostPerUnit + laborCostPerUnit + fulfillmentCostPerUnit;

            // Logistics allocated by unit count
            const labTestPerUnit = sku.quantity > 0 ? (logistics.labTestingFee * unitRatio) / sku.quantity : 0;
            const shippingPerUnit = sku.quantity > 0 ? (logistics.shippingToDistro * unitRatio) / sku.quantity : 0;
            const totalDistroFeesPerUnit = logistics.distroFees.reduce((sum, fee) => sum + (fee.percent / 100) * sku.wholesalePrice, 0);
            const logisticsCostPerUnit = labTestPerUnit + shippingPerUnit + totalDistroFeesPerUnit;

            const fullyLoadedCost = manufCostPerUnit + logisticsCostPerUnit;
            const wholesaleMargin = sku.wholesalePrice - fullyLoadedCost;
            const wholesaleMarginPercent = sku.wholesalePrice > 0 ? (wholesaleMargin / sku.wholesalePrice) * 100 : 0;
            const retailMargin = sku.msrp - fullyLoadedCost;
            const retailMarginPercent = sku.msrp > 0 ? (retailMargin / sku.msrp) * 100 : 0;

            return {
                skuId: sku.id,
                name: sku.name,
                unitSizeGrams,
                unitSizeValue: sku.unitSizeValue,
                unitSizeUnit: sku.unitSizeUnit,
                quantity: sku.quantity,
                potencyMg,
                isPotencySafe,
                formulaCostPerUnit,
                packagingCostPerUnit,
                laborCostPerUnit,
                fulfillmentCostPerUnit,
                manufCostPerUnit,
                logisticsCostPerUnit,
                fullyLoadedCost,
                wholesalePrice: sku.wholesalePrice,
                wholesaleMargin,
                wholesaleMarginPercent,
                msrp: sku.msrp,
                retailMargin,
                retailMarginPercent
            };
        });

        // Aggregate metrics
        const avgFullyLoadedCost = totalUnitsAcrossSkus > 0
            ? skuCalculations.reduce((sum, s) => sum + (s.fullyLoadedCost * s.quantity), 0) / totalUnitsAcrossSkus
            : 0;
        const avgWholesaleMargin = pricing.wholesale - avgFullyLoadedCost;
        const avgRetailMargin = pricing.msrp - avgFullyLoadedCost;

        const actualPotencyMg = skuCalculations.length > 0 ? skuCalculations[0].potencyMg : 0;
        const isPotencySafe = skuCalculations.every(s => s.isPotencySafe);

        return {
            activeWeight,
            inactiveWeight,
            totalBatchWeightGrams,
            totalActiveMg,
            cannabinoidTotals,
            activeCost,
            inactiveCost,
            totalFormulaCost,
            totalLaborCost,
            totalUnitsAcrossSkus,
            totalWeightAllocated,
            weightUtilization,
            isOverAllocated,
            skuCalculations,
            unitsProduced: totalUnitsAcrossSkus,
            actualPotencyMg,
            isPotencySafe,
            fullyLoadedCost: avgFullyLoadedCost,
            wholesaleMargin: avgWholesaleMargin,
            retailMargin: avgRetailMargin,

            // Legacy helpers
            manufCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].manufCostPerUnit : 0,
            packagingCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].packagingCostPerUnit : 0,
            laborCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].laborCostPerUnit : 0,
            goopCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].formulaCostPerUnit : 0,
            totalLogisticsPerUnit: skuCalculations.length > 0 ? skuCalculations.reduce((s, c) => s + c.logisticsCostPerUnit * c.quantity, 0) / totalUnitsAcrossSkus : 0,
            labTestPerUnit: totalUnitsAcrossSkus > 0 ? logistics.labTestingFee / totalUnitsAcrossSkus : 0,
            shippingPerUnit: totalUnitsAcrossSkus > 0 ? logistics.shippingToDistro / totalUnitsAcrossSkus : 0,
            totalDistroFeesPerUnit: logistics.distroFees.reduce((sum, fee) => sum + (fee.percent / 100) * pricing.wholesale, 0),
            potencyDiff: actualPotencyMg - recipeConfig.targetPotencyMg
        };
    }, [recipeConfig, batchConfig, derivedActiveIngredients, derivedInactiveIngredients, skus, logistics, pricing, batchScale]);

    // Actions
    const addActive = (item: Omit<ActiveIngredient, 'id' | 'type'>) => {
        setActiveIngredients([...activeIngredients, { ...item, id: Date.now(), type: 'active' }]);
    };

    const addInactive = (item: Omit<InactiveIngredient, 'id'>) => {
        setInactiveIngredients([...inactiveIngredients, { ...item, id: Date.now() }]);
    };

    const removeActive = (id: number) => setActiveIngredients(activeIngredients.filter(i => i.id !== id));
    const removeInactive = (id: number) => setInactiveIngredients(inactiveIngredients.filter(i => i.id !== id));

    const addSKU = (sku: Omit<SKU, 'id'>) => {
        setSkus([...skus, { ...sku, id: Date.now() }]);
    };

    const removeSKU = (id: number) => setSkus(skus.filter(s => s.id !== id));

    const updateSKU = (id: number, updates: Partial<SKU>) => {
        setSkus(skus.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const updateSKUPackaging = (skuId: number, packaging: PackagingItem[]) => {
        setSkus(skus.map(s => s.id === skuId ? { ...s, packaging } : s));
    };

    const addSKUPackagingItem = (skuId: number, item: Omit<PackagingItem, 'id'>) => {
        setSkus(skus.map(s => {
            if (s.id !== skuId) return s;
            return { ...s, packaging: [...s.packaging, { ...item, id: Date.now() }] };
        }));
    };

    const removeSKUPackagingItem = (skuId: number, itemId: number) => {
        setSkus(skus.map(s => {
            if (s.id !== skuId) return s;
            return { ...s, packaging: s.packaging.filter(p => p.id !== itemId) };
        }));
    };

    // Actions - Distribution Fees
    const addDistroFee = (fee: Omit<import('../lib/types').DistroFee, 'id'>) => {
        setLogistics({
            ...logistics,
            distroFees: [...logistics.distroFees, { ...fee, id: Date.now() }]
        });
    };

    const removeDistroFee = (id: number) => {
        setLogistics({
            ...logistics,
            distroFees: logistics.distroFees.filter(f => f.id !== id)
        });
    };

    const updateDistroFee = (id: number, updates: Partial<import('../lib/types').DistroFee>) => {
        setLogistics({
            ...logistics,
            distroFees: logistics.distroFees.map(f => f.id === id ? { ...f, ...updates } : f)
        });
    };

    // Snapshots
    const saveSnapshot = () => {
        const snap: Snapshot = {
            id: Date.now(),
            name: `${batchConfig.productName} (${new Date().toLocaleTimeString()})`,
            version: '0.1.3',  // Analytics dashboard release
            // Use derived ingredients (with computed gramsInBatch) for accurate snapshot
            config: { recipeConfig, batchConfig, activeIngredients: derivedActiveIngredients, inactiveIngredients: derivedInactiveIngredients, skus, logistics, pricing },
            cost: calculations.fullyLoadedCost
        };
        setSnapshots([snap, ...snapshots]);
        return snap;
    };

    const loadSnapshot = (snap: Snapshot) => {
        // Migration logic: reset gramsInBatch to force recalculation from amount/unit
        if (snap.config.recipeConfig) setRecipeConfig(snap.config.recipeConfig);
        setBatchConfig(snap.config.batchConfig);
        // Force recalculation by resetting gramsInBatch to 0 (derived values will recompute)
        setActiveIngredients(snap.config.activeIngredients.map(i => ({
            ...i,
            gramsInBatch: 0,
            gramsPerRecipeUnit: 0
        })));
        setInactiveIngredients(snap.config.inactiveIngredients.map(i => ({
            ...i,
            gramsInBatch: 0,
            gramsPerRecipeUnit: 0
        })));
        setSkus(snap.config.skus);
        setLogistics(snap.config.logistics);
        setPricing(snap.config.pricing);
    };

    // Load recipe from Recipe Library (formulation only)
    const loadRecipeFromLibrary = (recipe: import('../lib/types').SavedRecipe) => {
        // Load recipe configuration
        setRecipeConfig(recipe.recipeConfig);

        // Convert saved ingredients back to full ingredient objects with IDs
        const loadedActives: ActiveIngredient[] = recipe.activeIngredients.map((ing, idx) => ({
            ...ing,
            id: idx + 1,
            type: 'active' as const,
            gramsPerRecipeUnit: ing.amount, // Will be recalculated by derivation
            gramsInBatch: 0, // Will be recalculated
        }));

        const loadedInactives: InactiveIngredient[] = recipe.inactiveIngredients.map((ing, idx) => ({
            ...ing,
            id: 100 + idx + 1,
            gramsPerRecipeUnit: ing.amount, // Will be recalculated by derivation
            gramsInBatch: 0, // Will be recalculated
        }));

        setActiveIngredients(loadedActives);
        setInactiveIngredients(loadedInactives);
    };

    return {
        // State (read: derived, write: state)
        recipeConfig, setRecipeConfig,
        batchConfig, setBatchConfig,
        activeIngredients: derivedActiveIngredients, setActiveIngredients,
        inactiveIngredients: derivedInactiveIngredients, setInactiveIngredients,
        skus, setSkus,
        logistics, setLogistics,
        pricing, setPricing,
        snapshots, setSnapshots,

        // Derived
        ...calculations,
        batchScale,

        // Actions
        addActive,
        addInactive,
        removeActive,
        removeInactive,
        addSKU,
        removeSKU,
        updateSKU,
        updateSKUPackaging,
        addSKUPackagingItem,
        removeSKUPackagingItem,
        addDistroFee,
        removeDistroFee,
        updateDistroFee,
        saveSnapshot,
        loadSnapshot,
        loadRecipeFromLibrary,

        // Template
        defaultPackaging: DEFAULT_PACKAGING
    };
}
