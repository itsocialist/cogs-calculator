import { Beaker } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { ActiveIngredientsList } from '../ingredients/ActiveIngredientsList';
import { InactiveIngredientsList } from '../ingredients/InactiveIngredientsList';
import type { RecipeConfig, ActiveIngredient, InactiveIngredient } from '../../lib/types';

interface Props {
    recipeConfig: RecipeConfig;
    setRecipeConfig: (config: RecipeConfig) => void;
    activeIngredients: ActiveIngredient[];
    addActive: (item: Omit<ActiveIngredient, 'id' | 'type'>) => void;
    removeActive: (id: number) => void;
    setActiveIngredients: (items: ActiveIngredient[]) => void;
    inactiveIngredients: InactiveIngredient[];
    addInactive: (item: Omit<InactiveIngredient, 'id'>) => void;
    removeInactive: (id: number) => void;
    setInactiveIngredients: (items: InactiveIngredient[]) => void;
}

export const RecipeSection = ({
    recipeConfig, setRecipeConfig,
    activeIngredients, addActive, removeActive, setActiveIngredients,
    inactiveIngredients, addInactive, removeInactive, setInactiveIngredients
}: Props) => {
    // Calculate total recipe weight per base unit
    const totalActiveGrams = activeIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
    const totalInactiveGrams = inactiveIngredients.reduce((sum, i) => sum + i.gramsInBatch, 0);
    const totalRecipeGrams = totalActiveGrams + totalInactiveGrams;
    const totalRecipeMl = totalRecipeGrams / recipeConfig.density;

    // Calculate actual potency per base unit
    const totalActiveMg = activeIngredients.reduce((sum, item) => {
        const pureMg = item.gramsInBatch * 1000 * (item.purityPercent / 100);
        return sum + pureMg;
    }, 0);

    return (
        <Card
            title="Recipe Configuration"
            icon={Beaker}
            collapsible
            subtitle={`${recipeConfig.baseUnitLabel} = ${totalRecipeGrams.toFixed(1)}g (${totalRecipeMl.toFixed(1)}ml)`}
        >
            <div className="space-y-6">
                {/* Base Unit Configuration */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-xs font-bold text-blue-700 uppercase mb-3">Base Unit Definition</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase">Unit Label</label>
                            <input
                                type="text"
                                value={recipeConfig.baseUnitLabel}
                                onChange={(e) => setRecipeConfig({ ...recipeConfig, baseUnitLabel: e.target.value })}
                                className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-sm font-bold mt-1"
                                placeholder="e.g., 1 oz jar"
                            />
                        </div>
                        <NumberInput
                            label="Unit Size"
                            value={recipeConfig.baseUnitSize}
                            onChange={(v) => setRecipeConfig({ ...recipeConfig, baseUnitSize: v })}
                            suffix="g"
                        />
                        <NumberInput
                            label="Target Potency"
                            value={recipeConfig.targetPotencyMg}
                            onChange={(v) => setRecipeConfig({ ...recipeConfig, targetPotencyMg: v })}
                            suffix="mg"
                        />
                        <NumberInput
                            label="Density"
                            value={recipeConfig.density}
                            onChange={(v) => setRecipeConfig({ ...recipeConfig, density: v })}
                            suffix="g/ml"
                        />
                    </div>

                    {/* Recipe Summary */}
                    <div className="mt-4 pt-3 border-t border-blue-200 flex flex-wrap gap-6 text-sm">
                        <div>
                            <span className="text-neutral-500">Formula Weight: </span>
                            <span className="font-bold text-neutral-800">{totalRecipeGrams.toFixed(1)}g</span>
                            <span className="text-neutral-400"> ({totalRecipeMl.toFixed(1)}ml)</span>
                        </div>
                        <div>
                            <span className="text-neutral-500">Actual Potency: </span>
                            <span className={`font-bold ${Math.abs(totalActiveMg - recipeConfig.targetPotencyMg) < recipeConfig.targetPotencyMg * 0.1 ? 'text-green-600' : 'text-orange-500'}`}>
                                {totalActiveMg.toFixed(0)}mg
                            </span>
                            <span className="text-neutral-400"> (target: {recipeConfig.targetPotencyMg}mg)</span>
                        </div>
                    </div>
                </div>

                {/* Active Ingredients - Collapsible */}
                <ActiveIngredientsList
                    ingredients={activeIngredients}
                    onAdd={addActive}
                    onRemove={removeActive}
                    onUpdate={setActiveIngredients}
                />

                {/* Inactive Ingredients - Collapsible */}
                <InactiveIngredientsList
                    ingredients={inactiveIngredients}
                    onAdd={addInactive}
                    onRemove={removeInactive}
                    onUpdate={setInactiveIngredients}
                />
            </div>
        </Card>
    );
};
