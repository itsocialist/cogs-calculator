import { Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { RecipeSection } from '../recipe/RecipeSection';
import { IngredientsManifest } from '../manifest/IngredientsManifest';
import { SKUConfiguration } from '../ingredients/SKUConfiguration';
import { useConfig, convertToMl, convertFromMl, convertToGrams, convertFromGrams } from '../../context/configContext';
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
    const { config } = useConfig();

    const updateBatch = (field: keyof BatchConfig, value: number) => {
        setBatchConfig({ ...batchConfig, [field]: value });
    };

    // Config-driven batch display
    const batchType = config.batch.type;
    const volumeScale = config.batch.volumeScale;
    const weightScale = config.batch.weightScale;

    // Calculate units from batch - use targetVolumeMl for volume-based products
    const batchVolumeMl = batchConfig.targetVolumeMl;
    const batchWeightGrams = batchVolumeMl * recipeConfig.density;
    const calculatedUnits = recipeConfig.baseUnitSize > 0
        ? Math.floor(batchWeightGrams / recipeConfig.baseUnitSize)
        : 0;

    // Get display values based on config
    const getBatchDisplayValue = () => {
        if (batchType === 'volume') {
            return convertFromMl(batchVolumeMl, volumeScale);
        } else {
            return convertFromGrams(batchWeightGrams, weightScale);
        }
    };

    const getBatchSuffix = () => {
        if (batchType === 'volume') {
            return volumeScale === 'floz' ? 'fl oz' : volumeScale;
        } else {
            return weightScale;
        }
    };

    const handleBatchChange = (value: number) => {
        if (batchType === 'volume') {
            const ml = convertToMl(value, volumeScale);
            setBatchConfig({ ...batchConfig, targetVolumeMl: ml });
        } else {
            // Convert weight input to volume using density
            const grams = convertToGrams(value, weightScale);
            const ml = grams / recipeConfig.density;
            setBatchConfig({ ...batchConfig, targetVolumeMl: ml });
        }
    };

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
            <Card
                title="Batch Scaling"
                icon={Settings}
                collapsible
                headerClassName="bg-blue-50 border-b border-blue-100"
            >
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
                    <NumberInput
                        label={batchType === 'volume' ? 'Batch Volume' : 'Batch Weight'}
                        value={getBatchDisplayValue()}
                        onChange={handleBatchChange}
                        suffix={getBatchSuffix()}
                    />
                    <NumberInput label="Labor Rate" value={batchConfig.laborRate} onChange={(v) => updateBatch('laborRate', v)} prefix="$" />
                    <NumberInput label="Labor Hours" value={batchConfig.laborHours} onChange={(v) => updateBatch('laborHours', v)} suffix="hrs" />
                    <NumberInput label="Fulfillment" value={batchConfig.fulfillmentCost} onChange={(v) => updateBatch('fulfillmentCost', v)} prefix="$" />
                </div>

                {/* Batch Summary */}
                <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-neutral-500">Weight: </span>
                        <span className="font-bold text-neutral-800">
                            {convertFromGrams(batchWeightGrams, config.manifest.weightScale).toLocaleString()}{config.manifest.weightScale}
                        </span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Volume: </span>
                        <span className="font-bold text-neutral-800">
                            {convertFromMl(batchVolumeMl, config.manifest.volumeScale).toLocaleString()}{config.manifest.volumeScale === 'floz' ? ' fl oz' : config.manifest.volumeScale}
                        </span>
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

            {/* SECTION 3: Ingredients Manifest (Shopping List) */}
            <IngredientsManifest
                recipeConfig={recipeConfig}
                activeIngredients={activeIngredients}
                inactiveIngredients={inactiveIngredients}
                batchSizeKg={batchConfig.batchSizeKg}
            />

            {/* SECTION 4: SKU Configuration */}
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
