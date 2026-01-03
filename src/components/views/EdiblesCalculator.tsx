import { useState, useMemo } from 'react';
import {
    Cookie, Droplet, ChefHat, Beaker, Calculator,
    ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import {
    EDIBLE_TEMPLATES,
    calculateExtractNeeded,
    generateIngredientsFromTemplate,
} from '../../lib/edibleTemplates';

interface EdiblesCalculatorProps {
    onApplyToManufacturing: (ingredients: {
        activeIngredients: Array<{
            name: string;
            costPerKg: number;
            amount: number;
            purityPercent: number;
            cannabinoid: 'CBD' | 'THC' | 'CBG' | 'CBN' | 'other';
        }>;
        inactiveIngredients: Array<{
            name: string;
            costPerKg: number;
            amount: number;
            type: 'base' | 'carrier' | 'terpene';
        }>;
        recipeConfig: {
            baseUnitSize: number;
            baseUnitLabel: string;
            targetPotencyMg: number;
            density: number;
        };
    }) => void;
}

const TEMPLATE_ICONS: Record<string, typeof Cookie> = {
    gummy_gelatin: Cookie,
    gummy_pectin: Cookie,
    chocolate: ChefHat,
    tincture: Droplet,
};

export const EdiblesCalculator = ({ onApplyToManufacturing }: EdiblesCalculatorProps) => {
    // Form state
    const [selectedTemplateId, setSelectedTemplateId] = useState('gummy_gelatin');
    const [numUnits, setNumUnits] = useState(50);
    const [moldSizeGrams, setMoldSizeGrams] = useState(3.75);
    const [targetMgPerUnit, setTargetMgPerUnit] = useState(10);
    const [extractPotency, setExtractPotency] = useState(70);
    const [cannabinoidType, setCannabinoidType] = useState<'CBD' | 'THC'>('THC');
    const [extractCostPerKg, setExtractCostPerKg] = useState(15000); // $15/g

    const selectedTemplate = EDIBLE_TEMPLATES[selectedTemplateId];

    // Update defaults when template changes
    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const template = EDIBLE_TEMPLATES[templateId];
        if (template) {
            setMoldSizeGrams(template.defaultMoldSizeGrams);
            setExtractPotency(template.defaultExtractPotency);
        }
    };

    // Calculations
    const calculations = useMemo(() => {
        const totalBatchGrams = numUnits * moldSizeGrams;
        const extractNeededGrams = calculateExtractNeeded(numUnits, targetMgPerUnit, extractPotency);
        const totalMg = numUnits * targetMgPerUnit;
        const ingredients = generateIngredientsFromTemplate(selectedTemplate, totalBatchGrams, extractNeededGrams);

        // Calculate costs
        const extractCost = (extractNeededGrams / 1000) * extractCostPerKg;
        const ingredientsCost = ingredients.reduce((sum, ing) => {
            return sum + (ing.amountGrams / 1000) * ing.costPerKg;
        }, 0);
        const totalMaterialsCost = extractCost + ingredientsCost;
        const costPerUnit = totalMaterialsCost / numUnits;

        return {
            totalBatchGrams,
            extractNeededGrams,
            totalMg,
            ingredients,
            extractCost,
            ingredientsCost,
            totalMaterialsCost,
            costPerUnit,
        };
    }, [numUnits, moldSizeGrams, targetMgPerUnit, extractPotency, extractCostPerKg, selectedTemplate]);

    // Apply to Manufacturing tab
    const handleApply = () => {
        const activeIngredients = [{
            name: `${cannabinoidType} ${selectedTemplate.extractType === 'rosin' ? 'Rosin' : 'Distillate'}`,
            costPerKg: extractCostPerKg,
            amount: calculations.extractNeededGrams / numUnits, // per base unit
            purityPercent: extractPotency,
            cannabinoid: cannabinoidType,
        }];

        const inactiveIngredients = calculations.ingredients
            .filter(ing => !ing.optional)
            .map(ing => ({
                name: ing.name,
                costPerKg: ing.costPerKg,
                amount: ing.amountGrams / numUnits, // per base unit
                type: ing.type,
            }));

        onApplyToManufacturing({
            activeIngredients,
            inactiveIngredients,
            recipeConfig: {
                baseUnitSize: moldSizeGrams,
                baseUnitLabel: `${moldSizeGrams}g ${selectedTemplate.name.split(' ')[0].toLowerCase()}`,
                targetPotencyMg: targetMgPerUnit,
                density: 1.1, // Typical for gummies/chocolates
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <Cookie className="text-amber-600" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Edibles Calculator</h2>
                    <p className="text-sm text-slate-500">Potency-first formulation for edibles</p>
                </div>
            </div>

            {/* Template Selection */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <label className="block text-sm font-medium text-slate-600 mb-3">Product Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(EDIBLE_TEMPLATES).map(([id, template]) => {
                        const Icon = TEMPLATE_ICONS[id] || Beaker;
                        return (
                            <button
                                key={id}
                                onClick={() => handleTemplateChange(id)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTemplateId === id
                                    ? 'border-slate-800 bg-white shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                            >
                                <Icon size={20} className={selectedTemplateId === id ? 'text-slate-800' : 'text-slate-400'} />
                                <div className="font-medium text-sm mt-1 text-slate-800">{template.name}</div>
                                <div className="text-xs text-slate-500">{template.extractType}</div>
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-500 mt-2">{selectedTemplate.description}</p>
            </div>

            {/* Input Form */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Left Column - Production */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calculator size={18} />
                        Production Target
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Number of Units</label>
                        <input
                            type="number"
                            value={numUnits}
                            onChange={(e) => setNumUnits(Number(e.target.value) || 1)}
                            min={1}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-slate-600 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Unit Size (grams)</label>
                        <input
                            type="number"
                            value={moldSizeGrams}
                            onChange={(e) => setMoldSizeGrams(Number(e.target.value) || 1)}
                            min={0.1}
                            step={0.1}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-slate-600 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Typical mold size: 3-4g for gummies, 10g for chocolate</p>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Target Potency (mg/unit)</label>
                        <input
                            type="number"
                            value={targetMgPerUnit}
                            onChange={(e) => setTargetMgPerUnit(Number(e.target.value) || 1)}
                            min={1}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-slate-600 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Right Column - Extract */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Beaker size={18} />
                        Cannabis Extract
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Cannabinoid Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCannabinoidType('THC')}
                                className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all ${cannabinoidType === 'THC'
                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                THC
                            </button>
                            <button
                                onClick={() => setCannabinoidType('CBD')}
                                className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all ${cannabinoidType === 'CBD'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                CBD
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Extract Potency (%)</label>
                        <input
                            type="number"
                            value={extractPotency}
                            onChange={(e) => setExtractPotency(Number(e.target.value) || 1)}
                            min={1}
                            max={100}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-slate-600 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Rosin ~70%, Distillate ~85%, Isolate ~99%</p>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Extract Cost ($/kg)</label>
                        <input
                            type="number"
                            value={extractCostPerKg}
                            onChange={(e) => setExtractCostPerKg(Number(e.target.value) || 0)}
                            min={0}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 focus:border-slate-600 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">${(extractCostPerKg / 1000).toFixed(2)}/g</p>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="bg-slate-800 rounded-xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold">Calculated Recipe</div>
                    <div className="text-sm text-slate-400">
                        {numUnits} × {moldSizeGrams}g = {calculations.totalBatchGrams.toFixed(0)}g batch
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 uppercase font-medium">Extract Needed</div>
                        <div className="text-2xl font-black text-amber-400">{calculations.extractNeededGrams.toFixed(2)}g</div>
                        <div className="text-xs text-slate-400">{cannabinoidType} {selectedTemplate.extractType}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 uppercase font-medium">Total {cannabinoidType}</div>
                        <div className="text-2xl font-black text-white">{calculations.totalMg.toLocaleString()}mg</div>
                        <div className="text-xs text-slate-400">{targetMgPerUnit}mg × {numUnits} units</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-400 uppercase font-medium">Cost/Unit</div>
                        <div className="text-2xl font-black text-emerald-400">${calculations.costPerUnit.toFixed(2)}</div>
                        <div className="text-xs text-slate-400">materials only</div>
                    </div>
                </div>

                {/* Ingredient Breakdown */}
                <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                    <div className="text-sm font-medium mb-2 text-slate-300">Recipe Ingredients</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">{cannabinoidType} Extract:</span>
                            <span className="font-medium">{calculations.extractNeededGrams.toFixed(2)}g</span>
                        </div>
                        {calculations.ingredients.map((ing, idx) => (
                            <div key={idx} className={`flex justify-between ${ing.optional ? 'text-slate-500' : ''}`}>
                                <span className="text-slate-400 truncate">{ing.name}:</span>
                                <span className="font-medium">{ing.amountGrams.toFixed(1)}g</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="flex items-center justify-between text-sm border-t border-slate-600 pt-3">
                    <div>
                        <span className="text-slate-400">Extract: </span>
                        <span className="font-medium">${calculations.extractCost.toFixed(2)}</span>
                        <span className="text-slate-400 mx-2">+</span>
                        <span className="text-slate-400">Ingredients: </span>
                        <span className="font-medium">${calculations.ingredientsCost.toFixed(2)}</span>
                        <span className="text-slate-400 mx-2">=</span>
                        <span className="font-bold text-lg">${calculations.totalMaterialsCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Warning for high potency */}
            {targetMgPerUnit > 25 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
                    <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="font-medium">High Potency Warning</div>
                        <div className="text-amber-700">Potencies above 25mg may require recipe modifications for proper homogenization. Always test batches with a certified lab.</div>
                    </div>
                </div>
            )}

            {/* Apply Button */}
            <button
                onClick={handleApply}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
                Apply to Manufacturing
                <ArrowRight size={18} />
            </button>

            {/* Info Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <p>This calculator provides estimates based on standard formulations. Results may vary based on actual ingredients and process. Always verify potency through lab testing.</p>
            </div>
        </div>
    );
};
