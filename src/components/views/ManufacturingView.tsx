import { Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { RecipeSection } from '../recipe/RecipeSection';
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

    // Calculate units from batch
    const batchWeightGrams = batchConfig.batchSizeKg * 1000;
    const calculatedUnits = recipeConfig.baseUnitSize > 0
        ? Math.floor(batchWeightGrams / recipeConfig.baseUnitSize)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* SECTION 1: Recipe Configuration - Contains ingredients */}
            <RecipeSection
                recipeConfig={recipeConfig}
                setRecipeConfig={setRecipeConfig}
                activeIngredients={activeIngredients}
                addActive={addActive}
                removeActive={removeActive}
                setActiveIngredients={setActiveIngredients}
                inactiveIngredients={inactiveIngredients}
                addInactive={addInactive}
                removeInactive={removeInactive}
                setInactiveIngredients={setInactiveIngredients}
            />

            {/* SECTION 2: Batch Scaling - Volume/weight based */}
            <Card title="Batch Scaling" icon={Settings} collapsible>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
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
                    <NumberInput label="Labor Rate" value={batchConfig.laborRate} onChange={(v) => updateBatch('laborRate', v)} prefix="$" />
                    <NumberInput label="Labor Hours" value={batchConfig.laborHours} onChange={(v) => updateBatch('laborHours', v)} suffix="hrs" />
                    <NumberInput label="Fulfillment" value={batchConfig.fulfillmentCost} onChange={(v) => updateBatch('fulfillmentCost', v)} prefix="$" />
                </div>

                {/* Batch Summary */}
                <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-neutral-500">Total Weight: </span>
                        <span className="font-bold text-neutral-800">{batchWeightGrams.toLocaleString()}g</span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Est. Volume: </span>
                        <span className="font-bold text-neutral-800">{Math.round(batchWeightGrams / recipeConfig.density).toLocaleString()}ml</span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Base Units: </span>
                        <span className="font-bold text-neutral-800">{calculatedUnits.toLocaleString()}</span>
                        <span className="text-neutral-400 text-xs ml-1">({recipeConfig.baseUnitLabel})</span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Formula: </span>
                        <span className={`font-mono font-bold ${totalBatchWeightGrams > batchWeightGrams ? 'text-red-500' : 'text-green-600'}`}>
                            {totalBatchWeightGrams.toLocaleString()}g
                            {totalBatchWeightGrams > batchWeightGrams && (
                                <span className="text-xs ml-1">⚠️ Over</span>
                            )}
                        </span>
                    </div>
                </div>
            </Card>

            {/* SECTION 3: SKU Configuration */}
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
