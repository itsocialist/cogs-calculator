import { Beaker, AlertTriangle, CheckCircle } from 'lucide-react';
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
    const totalActiveGrams = activeIngredients.reduce((sum, i) => sum + i.gramsPerRecipeUnit, 0);
    const totalInactiveGrams = inactiveIngredients.reduce((sum, i) => sum + i.gramsPerRecipeUnit, 0);
    const totalRecipeGrams = totalActiveGrams + totalInactiveGrams;
    const totalRecipeMl = totalRecipeGrams / recipeConfig.density;

    // Calculate actual potency per base unit
    const totalActiveMg = activeIngredients.reduce((sum, item) => {
        const pureMg = item.gramsPerRecipeUnit * 1000 * (item.purityPercent / 100);
        return sum + pureMg;
    }, 0);

    // Coverage calculation
    const coveragePercent = recipeConfig.baseUnitSize > 0
        ? (totalRecipeGrams / recipeConfig.baseUnitSize) * 100
        : 0;
    const isUnderDefined = coveragePercent < 90;
    const isOverDefined = coveragePercent > 110;

    return (
        <Card
            title="Recipe Configuration"
            icon={Beaker}
            collapsible
            defaultCollapsed={true}
            subtitle={`${recipeConfig.baseUnitLabel} = ${totalRecipeGrams.toFixed(1)}g (${totalRecipeMl.toFixed(1)}ml)`}
        >
            <div className="space-y-6">
                {/* Base Unit Configuration */}
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/15">
                    <div className="text-xs font-bold text-amber-300/80 uppercase mb-3">Base Unit Definition</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-white/50 uppercase">Unit Label</label>
                            <input
                                type="text"
                                value={recipeConfig.baseUnitLabel}
                                onChange={(e) => setRecipeConfig({ ...recipeConfig, baseUnitLabel: e.target.value })}
                                className="w-full bg-white/15 backdrop-blur-sm border-0 rounded-lg px-2 py-1.5 text-sm font-bold text-white/90 mt-1 focus:outline-none focus:ring-1 focus:ring-white/30"
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
                    <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap gap-6 text-sm">
                        <div>
                            <span className="text-white/50">Formula Weight: </span>
                            <span className="font-bold text-white/90">{totalRecipeGrams.toFixed(1)}g</span>
                            <span className="text-white/40"> ({totalRecipeMl.toFixed(1)}ml)</span>
                        </div>
                        <div>
                            <span className="text-white/50">Actual Potency: </span>
                            <span className={`font-bold ${Math.abs(totalActiveMg - recipeConfig.targetPotencyMg) < recipeConfig.targetPotencyMg * 0.1 ? 'text-green-400' : 'text-orange-400'}`}>
                                {totalActiveMg.toFixed(0)}mg
                            </span>
                            <span className="text-white/40"> (target: {recipeConfig.targetPotencyMg}mg)</span>
                        </div>
                    </div>
                </div>

                {/* Recipe Coverage Warning */}
                {(isUnderDefined || isOverDefined) && (
                    <div className={`p-3 rounded-lg border flex items-start gap-3 ${isUnderDefined ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <AlertTriangle size={18} className={isUnderDefined ? 'text-amber-400 mt-0.5' : 'text-red-400 mt-0.5'} />
                        <div>
                            <div className={`font-bold text-sm ${isUnderDefined ? 'text-amber-300' : 'text-red-300'}`}>
                                Recipe {isUnderDefined ? 'Under-Defined' : 'Over-Defined'}: {coveragePercent.toFixed(1)}% coverage
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                                Ingredients sum to <span className="font-mono font-bold">{totalRecipeGrams.toFixed(1)}g</span> but base unit is <span className="font-mono font-bold">{recipeConfig.baseUnitSize.toFixed(1)}g</span>.
                                {isUnderDefined && ' Add ingredients or reduce base unit size.'}
                                {isOverDefined && ' Remove ingredients or increase base unit size.'}
                            </div>
                        </div>
                    </div>
                )}
                {!isUnderDefined && !isOverDefined && totalRecipeGrams > 0 && (
                    <div className="p-3 rounded-lg border bg-green-500/10 border-green-500/30 flex items-center gap-3">
                        <CheckCircle size={18} className="text-green-400" />
                        <div className="text-sm text-green-300 font-medium">
                            Recipe Complete: {coveragePercent.toFixed(1)}% coverage ({totalRecipeGrams.toFixed(1)}g / {recipeConfig.baseUnitSize.toFixed(1)}g)
                        </div>
                    </div>
                )}

                {/* Active Ingredients - Collapsible */}
                <ActiveIngredientsList
                    ingredients={activeIngredients}
                    onAdd={addActive}
                    onRemove={removeActive}
                    onUpdate={setActiveIngredients}
                    baseUnitSize={recipeConfig.baseUnitSize}
                />

                {/* Inactive Ingredients - Collapsible */}
                <InactiveIngredientsList
                    ingredients={inactiveIngredients}
                    onAdd={addInactive}
                    onRemove={removeInactive}
                    onUpdate={setInactiveIngredients}
                    baseUnitSize={recipeConfig.baseUnitSize}
                />
            </div>
        </Card>
    );
};
