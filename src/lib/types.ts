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

export interface SKU {
    id: number;
    name: string;
    unitSizeGrams: number;
    quantity: number;
    packaging: PackagingItem[];
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

