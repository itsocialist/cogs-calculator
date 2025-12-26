
import { useState, useMemo } from 'react';
import type {
    BatchConfig,
    ActiveIngredient,
    InactiveIngredient,
    PackagingItem,
    LogisticsConfig,
    Snapshot
} from '../lib/types';

// Defaults
const DEFAULT_BATCH_CONFIG: BatchConfig = {
    productName: "Recovery Salve",
    batchSizeKg: 10,
    unitSizeGrams: 50,
    targetPotencyMg: 500,
    laborRate: 25,
    laborHours: 6,
    fulfillmentCost: 2.50
};

const DEFAULT_ACTIVES: ActiveIngredient[] = [
    { id: 1, name: "CBD Isolate", costPerKg: 550, gramsInBatch: 100, purityPercent: 99.5, type: 'active' },
    { id: 2, name: "CBG Distillate", costPerKg: 1200, gramsInBatch: 10, purityPercent: 85, type: 'active' },
];

const DEFAULT_INACTIVES: InactiveIngredient[] = [
    { id: 101, name: "Organic Shea Butter", costPerKg: 18, gramsInBatch: 4000, type: 'base' },
    { id: 102, name: "Beeswax Pellets", costPerKg: 22, gramsInBatch: 2500, type: 'base' },
    { id: 103, name: "MCT Oil", costPerKg: 12, gramsInBatch: 3200, type: 'carrier' },
    { id: 104, name: "Menthol Crystals", costPerKg: 45, gramsInBatch: 150, type: 'terpene' },
    { id: 105, name: "Lavender Essential Oil", costPerKg: 120, gramsInBatch: 50, type: 'terpene' },
];

const DEFAULT_PACKAGING: PackagingItem[] = [
    { id: 1, name: "Amber Glass Jar (2oz)", costPerUnit: 1.15 },
    { id: 2, name: "Plastic Lid (Black)", costPerUnit: 0.25 },
    { id: 3, name: "Vinyl Label (Waterproof)", costPerUnit: 0.18 },
    { id: 4, name: "Outer Box (Soft Touch)", costPerUnit: 0.45 },
    { id: 5, name: "Tamper Seal", costPerUnit: 0.05 },
];

const DEFAULT_LOGISTICS: LogisticsConfig = {
    labTestingFee: 700,
    shippingToDistro: 150,
    distributorFeePercent: 15,
    salesCommissionPercent: 5,
};

export function useCalculator() {
    // State
    const [batchConfig, setBatchConfig] = useState<BatchConfig>(DEFAULT_BATCH_CONFIG);
    const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>(DEFAULT_ACTIVES);
    const [inactiveIngredients, setInactiveIngredients] = useState<InactiveIngredient[]>(DEFAULT_INACTIVES);
    const [packaging, setPackaging] = useState<PackagingItem[]>(DEFAULT_PACKAGING);
    const [logistics, setLogistics] = useState<LogisticsConfig>(DEFAULT_LOGISTICS);
    const [pricing, setPricing] = useState({ wholesale: 25, msrp: 55 });
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    // Calculations
    const calculations = useMemo(() => {
        const activeWeight = activeIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const inactiveWeight = inactiveIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
        const totalBatchWeightGrams = activeWeight + inactiveWeight;
        const unitsProduced = Math.floor(totalBatchWeightGrams / batchConfig.unitSizeGrams) || 1;

        const totalActiveMg = activeIngredients.reduce((sum, item) => {
            const rawMg = item.gramsInBatch * 1000;
            const pureMg = rawMg * (item.purityPercent / 100);
            return sum + pureMg;
        }, 0);

        const actualPotencyMg = totalActiveMg / unitsProduced;
        const potencyDiff = actualPotencyMg - batchConfig.targetPotencyMg;
        const isPotencySafe = Math.abs(potencyDiff) < (batchConfig.targetPotencyMg * 0.1);

        const activeCost = activeIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const inactiveCost = inactiveIngredients.reduce((sum, i) => sum + ((i.gramsInBatch / 1000) * i.costPerKg), 0);
        const totalFormulaCost = activeCost + inactiveCost;

        const goopCostPerUnit = totalFormulaCost / unitsProduced;
        const packagingCostPerUnit = packaging.reduce((sum, item) => sum + item.costPerUnit, 0);
        const laborCostPerUnit = (batchConfig.laborRate * batchConfig.laborHours) / unitsProduced;

        const manufCostPerUnit = goopCostPerUnit + packagingCostPerUnit + laborCostPerUnit + batchConfig.fulfillmentCost;

        const labTestPerUnit = logistics.labTestingFee / unitsProduced;
        const shippingPerUnit = logistics.shippingToDistro / unitsProduced;
        const distroFeePerUnit = (logistics.distributorFeePercent / 100) * pricing.wholesale;
        const commissionsPerUnit = (logistics.salesCommissionPercent / 100) * pricing.wholesale;
        const totalLogisticsPerUnit = labTestPerUnit + shippingPerUnit + distroFeePerUnit + commissionsPerUnit;

        const fullyLoadedCost = manufCostPerUnit + totalLogisticsPerUnit;
        const wholesaleMargin = pricing.wholesale - fullyLoadedCost;
        const retailMargin = pricing.msrp - fullyLoadedCost;

        return {
            activeWeight,
            inactiveWeight,
            totalBatchWeightGrams,
            unitsProduced,
            totalActiveMg,
            actualPotencyMg,
            potencyDiff,
            isPotencySafe,
            activeCost,
            inactiveCost,
            totalFormulaCost,
            goopCostPerUnit,
            packagingCostPerUnit,
            laborCostPerUnit,
            manufCostPerUnit,
            labTestPerUnit,
            shippingPerUnit,
            distroFeePerUnit,
            commissionsPerUnit,
            totalLogisticsPerUnit,
            fullyLoadedCost,
            wholesaleMargin,
            retailMargin
        };
    }, [batchConfig, activeIngredients, inactiveIngredients, packaging, logistics, pricing]);

    // Actions
    const addActive = (item: Omit<ActiveIngredient, 'id' | 'type'>) => {
        setActiveIngredients([...activeIngredients, { ...item, id: Date.now(), type: 'active' }]);
    };

    const addInactive = (item: Omit<InactiveIngredient, 'id'>) => {
        setInactiveIngredients([...inactiveIngredients, { ...item, id: Date.now() }]);
    };

    const removeActive = (id: number) => setActiveIngredients(activeIngredients.filter(i => i.id !== id));
    const removeInactive = (id: number) => setInactiveIngredients(inactiveIngredients.filter(i => i.id !== id));

    const saveSnapshot = () => {
        const snap: Snapshot = {
            id: Date.now(),
            name: `${batchConfig.productName} (${new Date().toLocaleTimeString()})`,
            config: { batchConfig, activeIngredients, inactiveIngredients, packaging, logistics, pricing },
            cost: calculations.fullyLoadedCost
        };
        setSnapshots([snap, ...snapshots]);
        return snap;
    };

    const loadSnapshot = (snap: Snapshot) => {
        setBatchConfig(snap.config.batchConfig);
        setActiveIngredients(snap.config.activeIngredients);
        setInactiveIngredients(snap.config.inactiveIngredients);
        setPackaging(snap.config.packaging);
        setLogistics(snap.config.logistics);
        setPricing(snap.config.pricing);
    };

    return {
        // State
        batchConfig, setBatchConfig,
        activeIngredients, setActiveIngredients,
        inactiveIngredients, setInactiveIngredients,
        packaging, setPackaging,
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
        saveSnapshot,
        loadSnapshot
    };
}
