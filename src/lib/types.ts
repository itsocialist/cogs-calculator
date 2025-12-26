export interface Ingredient {
    id: number;
    name: string;
    costPerKg: number;
    gramsInBatch: number;
}

export interface ActiveIngredient extends Ingredient {
    purityPercent: number;
    type: 'active';
}

export interface InactiveIngredient extends Ingredient {
    type: 'base' | 'carrier' | 'terpene';
}

export interface PackagingItem {
    id: number;
    name: string;
    costPerUnit: number;
}

export interface BatchConfig {
    productName: string;
    batchSizeKg: number;
    unitSizeGrams: number;
    targetPotencyMg: number;
    laborRate: number;
    laborHours: number;
    fulfillmentCost: number;
}

export interface LogisticsConfig {
    labTestingFee: number;
    shippingToDistro: number;
    distributorFeePercent: number;
    salesCommissionPercent: number;
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
        packaging: PackagingItem[];
        logistics: LogisticsConfig;
        pricing: PricingConfig;
    };
    cost: number;
}
