
import { useState, useMemo } from 'react';
import type {
    BatchConfig,
    ActiveIngredient,
    InactiveIngredient,
    PackagingItem,
    LogisticsConfig,
    Snapshot,
    SKU
} from '../lib/types';

// Default Packaging (used as template for new SKUs)
const DEFAULT_PACKAGING: PackagingItem[] = [
    { id: 1, name: "Amber Glass Jar (2oz)", costPerUnit: 1.15 },
    { id: 2, name: "Plastic Lid (Black)", costPerUnit: 0.25 },
    { id: 3, name: "Vinyl Label (Waterproof)", costPerUnit: 0.18 },
    { id: 4, name: "Outer Box (Soft Touch)", costPerUnit: 0.45 },
    { id: 5, name: "Tamper Seal", costPerUnit: 0.05 },
];

// Defaults
const DEFAULT_BATCH_CONFIG: BatchConfig = {
    productName: "Recovery Salve",
    batchSizeKg: 10,
    targetPotencyMg: 500,
    laborRate: 25,
    laborHours: 6,
    fulfillmentCost: 2.50
};

const DEFAULT_ACTIVES: ActiveIngredient[] = [
    { id: 1, name: "CBD Isolate", costPerKg: 550, unit: 'g', amountInUnit: 100, densityGPerMl: 1.0, gramsInBatch: 100, purityPercent: 99.5, type: 'active' },
    { id: 2, name: "CBG Distillate", costPerKg: 1200, unit: 'g', amountInUnit: 10, densityGPerMl: 1.0, gramsInBatch: 10, purityPercent: 85, type: 'active' },
];

const DEFAULT_INACTIVES: InactiveIngredient[] = [
    { id: 101, name: "Organic Shea Butter", costPerKg: 18, unit: 'cup', amountInUnit: 2, densityGPerMl: 0.95, gramsInBatch: 449.5, type: 'base' },
    { id: 102, name: "Beeswax Pellets", costPerKg: 22, unit: 'cup', amountInUnit: 1.5, densityGPerMl: 0.95, gramsInBatch: 337.1, type: 'base' },
    { id: 103, name: "MCT Oil", costPerKg: 12, unit: 'cup', amountInUnit: 2, densityGPerMl: 0.92, gramsInBatch: 435.3, type: 'carrier' },
    { id: 104, name: "Menthol Crystals", costPerKg: 45, unit: 'tsp', amountInUnit: 6, densityGPerMl: 1.0, gramsInBatch: 29.6, type: 'terpene' },
    { id: 105, name: "Lavender Essential Oil", costPerKg: 120, unit: 'tsp', amountInUnit: 3, densityGPerMl: 0.9, gramsInBatch: 13.3, type: 'terpene' },
];

const DEFAULT_SKUS: SKU[] = [
    {
        id: 1,
        name: "Recovery Salve 50g",
        unitSizeGrams: 50,
        quantity: 200,
        packaging: [...DEFAULT_PACKAGING]
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
    wholesaleMargin: number;
    retailMargin: number;
}

export function useCalculator() {
    // State
    const [batchConfig, setBatchConfig] = useState<BatchConfig>(DEFAULT_BATCH_CONFIG);
    const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>(DEFAULT_ACTIVES);
    const [inactiveIngredients, setInactiveIngredients] = useState<InactiveIngredient[]>(DEFAULT_INACTIVES);
    const [skus, setSkus] = useState<SKU[]>(DEFAULT_SKUS);
    const [logistics, setLogistics] = useState<LogisticsConfig>(DEFAULT_LOGISTICS);
    const [pricing, setPricing] = useState({ wholesale: 25, msrp: 55 });
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    // Calculations
    const calculations = useMemo(() => {
        // Formula weight
        const activeWeight = activeIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const inactiveWeight = inactiveIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const totalBatchWeightGrams = activeWeight + inactiveWeight;

        // Total active mg in batch
        const totalActiveMg = activeIngredients.reduce((sum, item) => {
            const rawMg = item.gramsInBatch * 1000;
            const pureMg = rawMg * (item.purityPercent / 100);
            return sum + pureMg;
        }, 0);

        // Formula costs
        const activeCost = activeIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const inactiveCost = inactiveIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const totalFormulaCost = activeCost + inactiveCost;

        // Total labor cost for batch
        const totalLaborCost = batchConfig.laborRate * batchConfig.laborHours;

        // SKU-level calculations
        const totalUnitsAcrossSkus = skus.reduce((sum, sku) => sum + sku.quantity, 0);
        const totalWeightAllocated = skus.reduce((sum, sku) => sum + (sku.unitSizeGrams * sku.quantity), 0);
        const weightUtilization = totalBatchWeightGrams > 0 ? totalWeightAllocated / totalBatchWeightGrams : 0;
        const isOverAllocated = totalWeightAllocated > totalBatchWeightGrams;

        // Per-SKU calculations
        const skuCalculations: SKUCalculation[] = skus.map(sku => {
            const skuWeightGrams = sku.unitSizeGrams * sku.quantity;
            const weightRatio = totalBatchWeightGrams > 0 ? skuWeightGrams / totalBatchWeightGrams : 0;
            const unitRatio = totalUnitsAcrossSkus > 0 ? sku.quantity / totalUnitsAcrossSkus : 0;

            // Potency per unit for this SKU
            const potencyMg = sku.quantity > 0 ? (totalActiveMg * weightRatio) / sku.quantity : 0;
            const isPotencySafe = Math.abs(potencyMg - batchConfig.targetPotencyMg) < (batchConfig.targetPotencyMg * 0.1);

            // Formula cost allocated by weight
            const formulaCostPerUnit = sku.quantity > 0 ? (totalFormulaCost * weightRatio) / sku.quantity : 0;

            // Packaging cost for this SKU
            const packagingCostPerUnit = sku.packaging.reduce((sum, p) => sum + p.costPerUnit, 0);

            // Labor allocated by unit count
            const laborCostPerUnit = sku.quantity > 0 ? (totalLaborCost * unitRatio) / sku.quantity : 0;

            // Fulfillment is per-unit
            const fulfillmentCostPerUnit = batchConfig.fulfillmentCost;

            const manufCostPerUnit = formulaCostPerUnit + packagingCostPerUnit + laborCostPerUnit + fulfillmentCostPerUnit;

            // Logistics allocated by unit count
            const labTestPerUnit = sku.quantity > 0 ? (logistics.labTestingFee * unitRatio) / sku.quantity : 0;
            const shippingPerUnit = sku.quantity > 0 ? (logistics.shippingToDistro * unitRatio) / sku.quantity : 0;
            const totalDistroFeesPerUnit = logistics.distroFees.reduce((sum, fee) => sum + (fee.percent / 100) * pricing.wholesale, 0);
            const logisticsCostPerUnit = labTestPerUnit + shippingPerUnit + totalDistroFeesPerUnit;

            const fullyLoadedCost = manufCostPerUnit + logisticsCostPerUnit;
            const wholesaleMargin = pricing.wholesale - fullyLoadedCost;
            const retailMargin = pricing.msrp - fullyLoadedCost;

            return {
                skuId: sku.id,
                name: sku.name,
                unitSizeGrams: sku.unitSizeGrams,
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
                wholesaleMargin,
                retailMargin
            };
        });

        // Aggregate metrics (weighted average by quantity)
        const avgFullyLoadedCost = totalUnitsAcrossSkus > 0
            ? skuCalculations.reduce((sum, s) => sum + (s.fullyLoadedCost * s.quantity), 0) / totalUnitsAcrossSkus
            : 0;
        const avgWholesaleMargin = pricing.wholesale - avgFullyLoadedCost;
        const avgRetailMargin = pricing.msrp - avgFullyLoadedCost;

        // For backward compatibility, use first SKU's potency or average
        const actualPotencyMg = skuCalculations.length > 0 ? skuCalculations[0].potencyMg : 0;
        const isPotencySafe = skuCalculations.every(s => s.isPotencySafe);

        return {
            activeWeight,
            inactiveWeight,
            totalBatchWeightGrams,
            totalActiveMg,
            activeCost,
            inactiveCost,
            totalFormulaCost,
            totalLaborCost,

            // SKU aggregates
            totalUnitsAcrossSkus,
            totalWeightAllocated,
            weightUtilization,
            isOverAllocated,

            // Per-SKU data
            skuCalculations,

            // Backward-compatible aggregates
            unitsProduced: totalUnitsAcrossSkus,
            actualPotencyMg,
            isPotencySafe,
            fullyLoadedCost: avgFullyLoadedCost,
            wholesaleMargin: avgWholesaleMargin,
            retailMargin: avgRetailMargin,

            // Legacy fields (using averages)
            manufCostPerUnit: skuCalculations.length > 0 ? skuCalculations.reduce((s, c) => s + c.manufCostPerUnit * c.quantity, 0) / totalUnitsAcrossSkus : 0,
            totalLogisticsPerUnit: skuCalculations.length > 0 ? skuCalculations.reduce((s, c) => s + c.logisticsCostPerUnit * c.quantity, 0) / totalUnitsAcrossSkus : 0,
            packagingCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].packagingCostPerUnit : 0,
            laborCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].laborCostPerUnit : 0,
            goopCostPerUnit: skuCalculations.length > 0 ? skuCalculations[0].formulaCostPerUnit : 0,
            labTestPerUnit: totalUnitsAcrossSkus > 0 ? logistics.labTestingFee / totalUnitsAcrossSkus : 0,
            shippingPerUnit: totalUnitsAcrossSkus > 0 ? logistics.shippingToDistro / totalUnitsAcrossSkus : 0,
            totalDistroFeesPerUnit: logistics.distroFees.reduce((sum, fee) => sum + (fee.percent / 100) * pricing.wholesale, 0),
            potencyDiff: actualPotencyMg - batchConfig.targetPotencyMg
        };
    }, [batchConfig, activeIngredients, inactiveIngredients, skus, logistics, pricing]);

    // Actions - Ingredients
    const addActive = (item: Omit<ActiveIngredient, 'id' | 'type'>) => {
        setActiveIngredients([...activeIngredients, { ...item, id: Date.now(), type: 'active' }]);
    };

    const addInactive = (item: Omit<InactiveIngredient, 'id'>) => {
        setInactiveIngredients([...inactiveIngredients, { ...item, id: Date.now() }]);
    };

    const removeActive = (id: number) => setActiveIngredients(activeIngredients.filter(i => i.id !== id));
    const removeInactive = (id: number) => setInactiveIngredients(inactiveIngredients.filter(i => i.id !== id));

    // Actions - SKUs
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
            config: { batchConfig, activeIngredients, inactiveIngredients, skus, logistics, pricing },
            cost: calculations.fullyLoadedCost
        };
        setSnapshots([snap, ...snapshots]);
        return snap;
    };

    const loadSnapshot = (snap: Snapshot) => {
        setBatchConfig(snap.config.batchConfig);
        setActiveIngredients(snap.config.activeIngredients);
        setInactiveIngredients(snap.config.inactiveIngredients);
        setSkus(snap.config.skus);
        setLogistics(snap.config.logistics);
        setPricing(snap.config.pricing);
    };

    return {
        // State
        batchConfig, setBatchConfig,
        activeIngredients, setActiveIngredients,
        inactiveIngredients, setInactiveIngredients,
        skus, setSkus,
        logistics, setLogistics,
        pricing, setPricing,
        snapshots, setSnapshots,

        // Derived
        ...calculations,

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

        // Template
        defaultPackaging: DEFAULT_PACKAGING
    };
}
