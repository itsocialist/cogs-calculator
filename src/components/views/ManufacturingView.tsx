import { Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { ActiveIngredientsList } from '../ingredients/ActiveIngredientsList';
import { InactiveIngredientsList } from '../ingredients/InactiveIngredientsList';
import { PackagingList } from '../ingredients/PackagingList';
import type { BatchConfig, ActiveIngredient, InactiveIngredient, PackagingItem } from '../../lib/types';

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
    packaging: PackagingItem[];
    setPackaging: (items: PackagingItem[]) => void;
    totalBatchWeightGrams: number;
}

export const ManufacturingView = ({
    batchConfig, setBatchConfig,
    activeIngredients, addActive, removeActive, setActiveIngredients,
    inactiveIngredients, addInactive, removeInactive, setInactiveIngredients,
    packaging, setPackaging,
    totalBatchWeightGrams
}: Props) => {
    const updateBatch = (field: keyof BatchConfig, value: number) => {
        setBatchConfig({ ...batchConfig, [field]: value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left Column: Config & Packaging */}
            <div className="lg:col-span-4 space-y-6">
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

                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Batch Size (kg)" value={batchConfig.batchSizeKg} onChange={(v) => updateBatch('batchSizeKg', v)} suffix="kg" />
                            <NumberInput label="Unit Size (g)" value={batchConfig.unitSizeGrams} onChange={(v) => updateBatch('unitSizeGrams', v)} suffix="g" />
                            <NumberInput label="Target Potency" value={batchConfig.targetPotencyMg} onChange={(v) => updateBatch('targetPotencyMg', v)} suffix="mg" />
                            <NumberInput label="Labor Rate / Hr" value={batchConfig.laborRate} onChange={(v) => updateBatch('laborRate', v)} prefix="$" />
                            <NumberInput label="Labor Hours" value={batchConfig.laborHours} onChange={(v) => updateBatch('laborHours', v)} suffix="hrs" />
                            <NumberInput label="3PL / Unit" value={batchConfig.fulfillmentCost} onChange={(v) => updateBatch('fulfillmentCost', v)} prefix="$" />
                        </div>

                        <div className="pt-4 border-t border-neutral-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500">Total Formula Weight</span>
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

                <PackagingList items={packaging} onUpdate={setPackaging} />
            </div>

            {/* Right Column: Ingredients */}
            <div className="lg:col-span-8 space-y-6">
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
        </div>
    );
};
