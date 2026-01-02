import { ClipboardList, Download, Lock, Unlock, Scale } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { RecipeConfig, ActiveIngredient, InactiveIngredient } from '../../lib/types';

interface ManifestItem {
    id: number;
    name: string;
    type: 'active' | 'base' | 'carrier' | 'terpene';
    amountPerUnit: number;
    scaledAmount: number;
    unit: string;
    costPerKg: number;
    totalCost: number;
}

interface Props {
    recipeConfig: RecipeConfig;
    activeIngredients: ActiveIngredient[];
    inactiveIngredients: InactiveIngredient[];
    batchSizeKg: number;
    onScaleChange?: (newBatchSizeKg: number) => void;
}

export const IngredientsManifest = ({
    recipeConfig,
    activeIngredients,
    inactiveIngredients,
    batchSizeKg,
    onScaleChange
}: Props) => {
    const [isLocked, setIsLocked] = useState(true);
    const [scaleToValue, setScaleToValue] = useState<number>(batchSizeKg);

    // Calculate how many base units in the batch
    const batchWeightGrams = batchSizeKg * 1000;
    const baseUnits = recipeConfig.baseUnitSize > 0
        ? batchWeightGrams / recipeConfig.baseUnitSize
        : 0;

    // Calculate recipe weight per base unit
    const recipeWeightPerUnit = [...activeIngredients, ...inactiveIngredients]
        .reduce((sum, i) => sum + i.gramsInBatch, 0);

    // Generate manifest items
    const manifestItems: ManifestItem[] = [
        ...activeIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            type: ing.type as 'active',
            amountPerUnit: recipeWeightPerUnit > 0 ? ing.gramsInBatch / baseUnits : 0,
            scaledAmount: ing.gramsInBatch,
            unit: 'g',
            costPerKg: ing.costPerKg,
            totalCost: (ing.gramsInBatch / 1000) * ing.costPerKg
        })),
        ...inactiveIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            type: ing.type,
            amountPerUnit: recipeWeightPerUnit > 0 ? ing.gramsInBatch / baseUnits : 0,
            scaledAmount: ing.gramsInBatch,
            unit: 'g',
            costPerKg: ing.costPerKg,
            totalCost: (ing.gramsInBatch / 1000) * ing.costPerKg
        }))
    ];

    // Totals
    const totalWeight = manifestItems.reduce((sum, item) => sum + item.scaledAmount, 0);
    const totalCost = manifestItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalVolumeMl = totalWeight / recipeConfig.density;

    // Handle scale to
    const handleScaleTo = () => {
        if (onScaleChange && scaleToValue > 0) {
            onScaleChange(scaleToValue);
        }
    };

    // Export as text (simple implementation)
    const handleExport = () => {
        const lines = [
            `INGREDIENTS MANIFEST`,
            `Product: ${recipeConfig.baseUnitLabel}`,
            `Batch: ${batchSizeKg}kg (${baseUnits.toFixed(0)} units)`,
            `Date: ${new Date().toLocaleDateString()}`,
            ``,
            `INGREDIENT | PER UNIT | TOTAL | COST`,
            `---------------------------------------`,
            ...manifestItems.map(item =>
                `${item.name} | ${item.amountPerUnit.toFixed(2)}g | ${item.scaledAmount.toFixed(1)}g | $${item.totalCost.toFixed(2)}`
            ),
            ``,
            `TOTAL: ${totalWeight.toFixed(1)}g (${totalVolumeMl.toFixed(0)}ml) | $${totalCost.toFixed(2)}`
        ];

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Type color mapping
    const typeColors: Record<string, string> = {
        active: 'bg-blue-100 text-blue-700',
        base: 'bg-amber-100 text-amber-700',
        carrier: 'bg-green-100 text-green-700',
        terpene: 'bg-purple-100 text-purple-700'
    };

    return (
        <Card
            title="Ingredients Manifest"
            icon={ClipboardList}
            subtitle={`${baseUnits.toFixed(0)} units × ${recipeConfig.baseUnitLabel}`}
            collapsible
            action={
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={`p-1.5 rounded ${isLocked ? 'bg-neutral-100 text-neutral-600' : 'bg-yellow-100 text-yellow-700'}`}
                        title={isLocked ? 'Unlock to edit' : 'Lock ratios'}
                    >
                        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-1.5 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        title="Export manifest"
                    >
                        <Download size={14} />
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Scale To Quick Action */}
                <div className="flex items-end gap-3 p-3 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Scale size={16} />
                        <span>Scale batch to:</span>
                    </div>
                    <NumberInput
                        label=""
                        value={scaleToValue}
                        onChange={setScaleToValue}
                        suffix="kg"
                    />
                    <button
                        onClick={handleScaleTo}
                        className="px-3 py-1.5 bg-yellow-500 text-black text-sm font-bold rounded hover:bg-yellow-400 transition-colors"
                    >
                        Apply
                    </button>
                </div>

                {/* Manifest Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 text-xs uppercase">
                                <th className="text-left py-2 font-bold">Ingredient</th>
                                <th className="text-left py-2 font-bold">Type</th>
                                <th className="text-right py-2 font-bold">Per Unit</th>
                                <th className="text-right py-2 font-bold">Total (g)</th>
                                <th className="text-right py-2 font-bold">Volume (ml)</th>
                                <th className="text-right py-2 font-bold">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manifestItems.map(item => (
                                <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                                    <td className="py-2 font-medium text-neutral-800">{item.name}</td>
                                    <td className="py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${typeColors[item.type] || 'bg-neutral-100 text-neutral-600'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="py-2 text-right font-mono text-neutral-600">
                                        {item.amountPerUnit.toFixed(2)}g
                                    </td>
                                    <td className="py-2 text-right font-mono font-bold text-neutral-800">
                                        {item.scaledAmount.toFixed(1)}g
                                    </td>
                                    <td className="py-2 text-right font-mono text-neutral-500">
                                        {(item.scaledAmount / recipeConfig.density).toFixed(1)}ml
                                    </td>
                                    <td className="py-2 text-right font-mono text-green-600">
                                        ${item.totalCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-bold">
                                <td className="py-3 text-neutral-800">TOTAL</td>
                                <td className="py-3"></td>
                                <td className="py-3"></td>
                                <td className="py-3 text-right font-mono text-neutral-800">{totalWeight.toFixed(1)}g</td>
                                <td className="py-3 text-right font-mono text-neutral-600">{totalVolumeMl.toFixed(0)}ml</td>
                                <td className="py-3 text-right font-mono text-green-700">${totalCost.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-blue-600 font-bold uppercase">Base Units</div>
                        <div className="text-xl font-black text-blue-800">{baseUnits.toFixed(0)}</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-amber-600 font-bold uppercase">Total Weight</div>
                        <div className="text-xl font-black text-amber-800">{(totalWeight / 1000).toFixed(2)}kg</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-green-600 font-bold uppercase">Total Volume</div>
                        <div className="text-xl font-black text-green-800">{(totalVolumeMl / 1000).toFixed(2)}L</div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg text-center">
                        <div className="text-xs text-emerald-600 font-bold uppercase">Materials Cost</div>
                        <div className="text-xl font-black text-emerald-800">${totalCost.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
