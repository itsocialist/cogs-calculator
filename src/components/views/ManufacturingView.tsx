import { Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { ActiveIngredientsList } from '../ingredients/ActiveIngredientsList';
import { InactiveIngredientsList } from '../ingredients/InactiveIngredientsList';
import { SKUConfiguration } from '../ingredients/SKUConfiguration';
import type { BatchConfig, ActiveIngredient, InactiveIngredient, SKU, PackagingItem } from '../../lib/types';
import type { SKUCalculation } from '../../hooks/useCalculator';

interface Props {
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
            {/* ROW 1: Active & Inactive Ingredients - 50/50 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActiveIngredientsList
                    ingredients={activeIngredients}
                    onAdd={addActive}
                    onRemove={removeActive}
                    onUpdate={setActiveIngredients}
                />
                <InactiveIngredientsList
                    ingredients={inactiveIngredients}
                    onAdd={addInactive}
                    onRemove={removeInactive}
                    onUpdate={setInactiveIngredients}
                />
            </div>

            {/* ROW 2: Batch Config & SKU Config - 30/70 */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Batch Configuration - 30% (3/10) */}
                <div className="lg:col-span-3">
                    <Card title="Batch Configuration" icon={Settings}>
                        <div className="space-y-4">
                            <div className="border-b border-neutral-100 pb-4 mb-4">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Product Name</label>
                                <input
                                    type="text"
                                    value={batchConfig.productName}
                                    onChange={(e) => setBatchConfig({ ...batchConfig, productName: e.target.value })}
                                    className="w-full bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-sm font-bold mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <NumberInput label="Batch Size (kg)" value={batchConfig.batchSizeKg} onChange={(v) => updateBatch('batchSizeKg', v)} suffix="kg" />
                                <NumberInput label="Target Potency" value={batchConfig.targetPotencyMg} onChange={(v) => updateBatch('targetPotencyMg', v)} suffix="mg" />
                                <NumberInput label="Labor Rate" value={batchConfig.laborRate} onChange={(v) => updateBatch('laborRate', v)} prefix="$" />
                                <NumberInput label="Labor Hours" value={batchConfig.laborHours} onChange={(v) => updateBatch('laborHours', v)} suffix="hrs" />
                            </div>

                            <NumberInput label="3PL Fulfillment / Unit" value={batchConfig.fulfillmentCost} onChange={(v) => updateBatch('fulfillmentCost', v)} prefix="$" />

                            <div className="pt-4 border-t border-neutral-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-500">Formula Weight</span>
                                    <span className={`font-mono font-bold ${totalBatchWeightGrams > (batchConfig.batchSizeKg * 1000) ? 'text-red-500' : 'text-green-600'}`}>
                                        {totalBatchWeightGrams.toLocaleString()}g / {(batchConfig.batchSizeKg * 1000).toLocaleString()}g
                                    </span>
                                </div>
                                {totalBatchWeightGrams > (batchConfig.batchSizeKg * 1000) && (
                                    <p className="text-xs text-red-500 mt-1">Warning: Formula exceeds batch size!</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* SKU Configuration - 70% (7/10) */}
                <div className="lg:col-span-7">
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
            </div>
        </div>
    );
};
