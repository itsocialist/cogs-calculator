import { Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { ActiveIngredientsList } from '../ingredients/ActiveIngredientsList';
import { InactiveIngredientsList } from '../ingredients/InactiveIngredientsList';
import { SKUConfiguration } from '../ingredients/SKUConfiguration';
import type { BatchConfig, ActiveIngredient, InactiveIngredient, SKU, PackagingItem, RecipeConfig } from '../../lib/types';
import type { SKUCalculation } from '../../hooks/useCalculator';

interface Props {
    recipeConfig: RecipeConfig;
    setRecipeConfig: (config: RecipeConfig) => void;
    batchConfig: BatchConfig;
    setBatchConfig: (config: BatchConfig) => void;
    activeIngredients: ActiveIngredient[];
    addActive: (item: Omit<ActiveIngredient, 'id' | 'type'>) => void;
    removeActive: (id: number) => void;
    setActiveIngredients: (items: ActiveIngredient[]) => void;
    inactiveIngredients: InactiveIngredient[];
    addInactive: (item: Omit<InactiveIngredient, 'id'>) => void;
    removeInactive: (id: number) => void;
    setInactiveIngredients: (items: InactiveIngredient[]) => void;
    skus: SKU[];
    skuCalculations: SKUCalculation[];
    totalBatchWeightGrams: number;
    totalWeightAllocated: number;
    isOverAllocated: boolean;
    defaultPackaging: PackagingItem[];
    addSKU: (sku: Omit<SKU, 'id'>) => void;
    removeSKU: (id: number) => void;
    updateSKU: (id: number, updates: Partial<SKU>) => void;
    updateSKUPackaging: (skuId: number, packaging: PackagingItem[]) => void;
    addSKUPackagingItem: (skuId: number, item: Omit<PackagingItem, 'id'>) => void;
    removeSKUPackagingItem: (skuId: number, itemId: number) => void;
}

export const ManufacturingView = ({
    recipeConfig, setRecipeConfig,
    batchConfig, setBatchConfig,
    activeIngredients, addActive, removeActive, setActiveIngredients,
    inactiveIngredients, addInactive, removeInactive, setInactiveIngredients,
    skus, skuCalculations, totalBatchWeightGrams, totalWeightAllocated, isOverAllocated, defaultPackaging,
    addSKU, removeSKU, updateSKU, updateSKUPackaging, addSKUPackagingItem, removeSKUPackagingItem
}: Props) => {
    const updateBatch = (field: keyof BatchConfig, value: number) => {
        setBatchConfig({ ...batchConfig, [field]: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* SECTION 1: Active Ingredients - FULL WIDTH */}
            <ActiveIngredientsList
                ingredients={activeIngredients}
                onAdd={addActive}
                onRemove={removeActive}
                onUpdate={setActiveIngredients}
            />

            {/* SECTION 2: Base & Inactive Ingredients - FULL WIDTH */}
            <InactiveIngredientsList
                ingredients={inactiveIngredients}
                onAdd={addInactive}
                onRemove={removeInactive}
                onUpdate={setInactiveIngredients}
            />

            {/* SECTION 3: Batch Configuration - FULL WIDTH (compact horizontal) */}
            <Card title="Batch Configuration" icon={Settings} collapsible>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="text-xs font-bold text-neutral-400 uppercase">Product Name</label>
                        <input
                            type="text"
                            value={batchConfig.productName}
                            onChange={(e) => setBatchConfig({ ...batchConfig, productName: e.target.value })}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded px-2 py-1.5 text-sm font-bold mt-1"
                        />
                    </div>
                    <NumberInput label="Batch Size" value={batchConfig.batchSizeKg} onChange={(v) => updateBatch('batchSizeKg', v)} suffix="kg" />
                    <NumberInput label="Target Potency" value={recipeConfig.targetPotencyMg} onChange={(v) => setRecipeConfig({ ...recipeConfig, targetPotencyMg: v })} suffix="mg" />
                    <NumberInput label="Labor Rate" value={batchConfig.laborRate} onChange={(v) => updateBatch('laborRate', v)} prefix="$" />
                    <NumberInput label="Labor Hours" value={batchConfig.laborHours} onChange={(v) => updateBatch('laborHours', v)} suffix="hrs" />
                    <NumberInput label="Fulfillment" value={batchConfig.fulfillmentCost} onChange={(v) => updateBatch('fulfillmentCost', v)} prefix="$" />
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Formula Weight</span>
                    <span className={`font-mono font-bold ${totalBatchWeightGrams > (batchConfig.batchSizeKg * 1000) ? 'text-red-500' : 'text-green-600'}`}>
                        {totalBatchWeightGrams.toLocaleString()}g ({Math.round(totalBatchWeightGrams / 0.95).toLocaleString()}ml) / {(batchConfig.batchSizeKg * 1000).toLocaleString()}g
                        {totalBatchWeightGrams > (batchConfig.batchSizeKg * 1000) && (
                            <span className="text-xs ml-2">⚠️ Exceeds batch</span>
                        )}
                    </span>
                </div>
            </Card>

            {/* SECTION 4: SKU Configuration - FULL WIDTH */}
            <SKUConfiguration
                skus={skus}
                skuCalculations={skuCalculations}
                totalBatchWeightGrams={totalBatchWeightGrams}
                totalWeightAllocated={totalWeightAllocated}
                isOverAllocated={isOverAllocated}
                defaultPackaging={defaultPackaging}
                onAdd={addSKU}
                onRemove={removeSKU}
                onUpdate={updateSKU}
                onUpdatePackaging={updateSKUPackaging}
                onAddPackagingItem={addSKUPackagingItem}
                onRemovePackagingItem={removeSKUPackagingItem}
            />
        </div>
    );
};
