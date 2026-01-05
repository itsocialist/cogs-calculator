/**
 * AnalyticsTab - Main analytics dashboard component
 * Issue #20: Card-based analytics with Recharts visualizations
 */

import { useCalculator } from '../../hooks/useCalculator';
import { MarginGauge } from './MarginGauge';
import { CostWaterfall } from './CostWaterfall';
import { CostBreakdownPie } from './CostBreakdownPie';
import { CannabinoidBar } from './CannabinoidBar';
import { IngredientCostPie } from './IngredientCostPie';

type CalculatorResult = ReturnType<typeof useCalculator>;

interface Props {
    data: CalculatorResult;
}

export const AnalyticsTab = ({ data }: Props) => {
    const firstSku = data.skuCalculations[0];

    // Use top-level margins to match KPI cards (not SKU-specific)
    const marginData = {
        wholesaleMargin: data.wholesaleMargin > 0
            ? ((data.pricing.wholesale - data.fullyLoadedCost) / data.pricing.wholesale) * 100
            : 0,
        retailMargin: data.retailMargin > 0
            ? ((data.pricing.msrp - data.fullyLoadedCost) / data.pricing.msrp) * 100
            : 0,
        wholesalePrice: data.pricing.wholesale,
        msrp: data.pricing.msrp,
        fullyLoadedCost: data.fullyLoadedCost,
    };

    const costBreakdown = {
        material: firstSku?.formulaCostPerUnit || 0,
        labor: firstSku?.laborCostPerUnit || 0,
        packaging: firstSku?.packagingCostPerUnit || 0,
        fulfillment: firstSku?.fulfillmentCostPerUnit || 0,
        logistics: firstSku?.logisticsCostPerUnit || 0,
        total: firstSku?.fullyLoadedCost || 0,
    };

    // Ingredient data for cost breakdown
    const ingredientCosts = [
        ...data.activeIngredients.map(ing => ({
            name: ing.name,
            cost: (ing.gramsPerRecipeUnit / 1000) * ing.costPerKg,
            weight: ing.gramsPerRecipeUnit,
            type: 'active' as const,
        })),
        ...data.inactiveIngredients.map(ing => ({
            name: ing.name,
            cost: (ing.gramsPerRecipeUnit / 1000) * ing.costPerKg,
            weight: ing.gramsPerRecipeUnit,
            type: 'inactive' as const,
        })),
    ].sort((a, b) => b.cost - a.cost);

    // Cannabinoid data
    const cannabinoidData = Object.entries(data.cannabinoidTotals || {}).map(([name, totalMg]) => ({
        name,
        mg: data.batchScale.calculatedBaseUnits > 0
            ? (totalMg as number) / data.batchScale.calculatedBaseUnits
            : 0,
    }));

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="mb-2">
                <h2 className="text-2xl font-black text-amber-400/80 tracking-wide">
                    {data.batchConfig.productName}
                </h2>
            </div>

            {/* TIER 1: Hero - Business Viability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MarginGauge
                    wholesaleMargin={marginData.wholesaleMargin}
                    retailMargin={marginData.retailMargin}
                    wholesalePrice={marginData.wholesalePrice}
                    msrp={marginData.msrp}
                    fullyLoadedCost={marginData.fullyLoadedCost}
                />
                <CostWaterfall
                    material={costBreakdown.material}
                    labor={costBreakdown.labor}
                    packaging={costBreakdown.packaging}
                    fulfillment={costBreakdown.fulfillment}
                    logistics={costBreakdown.logistics}
                />
            </div>

            {/* TIER 2: Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CostBreakdownPie
                    material={costBreakdown.material}
                    labor={costBreakdown.labor}
                    packaging={costBreakdown.packaging}
                    fulfillment={costBreakdown.fulfillment}
                    logistics={costBreakdown.logistics}
                    total={costBreakdown.total}
                />
                <IngredientCostPie
                    ingredients={ingredientCosts}
                    title="Cost by Ingredient"
                    dataKey="cost"
                />
                <IngredientCostPie
                    ingredients={ingredientCosts}
                    title="Weight by Ingredient"
                    dataKey="weight"
                />
            </div>

            {/* TIER 3: Potency Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CannabinoidBar
                    cannabinoids={cannabinoidData}
                    targetPotency={data.recipeConfig.targetPotencyMg}
                />
                {/* Top Ingredients Table */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-3">
                        Top Ingredients by Cost
                    </h3>
                    <div className="space-y-2">
                        {ingredientCosts.slice(0, 5).map((ing, idx) => (
                            <div
                                key={ing.name}
                                className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-white/40">
                                        #{idx + 1}
                                    </span>
                                    <span className={`text-sm font-medium ${ing.type === 'active' ? 'text-blue-400' : 'text-white/70'
                                        }`}>
                                        {ing.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-white/50">
                                        {ing.weight.toFixed(2)}g
                                    </span>
                                    <span className="text-sm font-mono text-amber-400">
                                        ${ing.cost.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-white/30 text-xs pt-4">
                Analytics based on {data.batchScale.calculatedBaseUnits.toFixed(0)} base units × {data.recipeConfig.baseUnitLabel}
            </div>
        </div>
    );
};
