import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Sliders, RefreshCw } from 'lucide-react';

interface ScenarioSlidersProps {
    data: any;
}

export const ScenarioSliders: React.FC<ScenarioSlidersProps> = ({ data }) => {
    const [priceVar, setPriceVar] = useState(0);
    const [materialVar, setMaterialVar] = useState(0);
    const [laborVar, setLaborVar] = useState(0);

    // Initial Base Values
    const baseRevenue = useMemo(() => {
        return data.skuCalculations.reduce((sum: number, sku: any) => sum + (sku.wholesalePrice * sku.quantity), 0);
    }, [data]);

    const baseMaterialCost = useMemo(() => {
        const packaging = data.skuCalculations.reduce((sum: number, sku: any) => sum + (sku.packagingCostPerUnit * sku.quantity), 0);
        return data.totalFormulaCost + packaging;
    }, [data]);

    const baseLaborCost = data.totalLaborCost;

    const baseLogisticsFixed = data.logistics.labTestingFee + data.logistics.shippingToDistro + (data.batchConfig.fulfillmentCost * data.totalUnitsAcrossSkus);

    // Distro fees are % of revenue, so we calculate the effective rate
    const baseDistroFees = data.skuCalculations.reduce((sum: number, sku: any) => sum + (sku.totalDistroFeesPerUnit * sku.quantity), 0);
    const distroFeeRate = baseRevenue > 0 ? baseDistroFees / baseRevenue : 0;

    const baseTotalCost = baseMaterialCost + baseLaborCost + baseLogisticsFixed + baseDistroFees;
    const baseProfit = baseRevenue - baseTotalCost;
    const baseMarginPercent = baseRevenue > 0 ? (baseProfit / baseRevenue) * 100 : 0;

    // Simulated Values
    const simRevenue = baseRevenue * (1 + (priceVar / 100));
    const simMaterialCost = baseMaterialCost * (1 + (materialVar / 100));
    const simLaborCost = baseLaborCost * (1 + (laborVar / 100));
    const simDistroFees = simRevenue * distroFeeRate; // Fees scale with revenue
    const simTotalCost = simMaterialCost + simLaborCost + baseLogisticsFixed + simDistroFees;

    const simProfit = simRevenue - simTotalCost;
    const simMarginPercent = simRevenue > 0 ? (simProfit / simRevenue) * 100 : 0;

    const profitDiff = simProfit - baseProfit;

    const reset = () => {
        setPriceVar(0);
        setMaterialVar(0);
        setLaborVar(0);
    };

    const SliderControl = ({ label, value, onChange, colorClass = "accent-amber-500" }: any) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
                <span className="text-white/70">{label}</span>
                <span className={`font-mono font-bold ${value > 0 ? 'text-amber-400' : value < 0 ? 'text-emerald-400' : 'text-white/50'}`}>
                    {value > 0 ? '+' : ''}{value}%
                </span>
            </div>
            <input
                type="range"
                min="-50"
                max="50"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer ${colorClass}`}
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>-50%</span>
                <span>0%</span>
                <span>+50%</span>
            </div>
        </div>
    );

    return (
        <Card
            title="What-If Scenarios"
            icon={Sliders}
            className="h-full"
            action={
                <button onClick={reset} className="p-1 hover:bg-white/10 rounded-full transition-colors" title="Reset">
                    <RefreshCw size={14} className="text-white/50" />
                </button>
            }
        >
            <div className="space-y-6 mt-4">
                {/* Sliders */}
                <div className="bg-stone-900/50 rounded-xl p-4 border border-white/5">
                    <SliderControl
                        label="Wholesale Price"
                        value={priceVar}
                        onChange={setPriceVar}
                        colorClass="accent-emerald-500" // Green for price
                    />
                    <SliderControl
                        label="Material Costs"
                        value={materialVar}
                        onChange={setMaterialVar}
                        colorClass="accent-red-500" // Red for cost
                    />
                    <SliderControl
                        label="Labor Rates"
                        value={laborVar}
                        onChange={setLaborVar}
                        colorClass="accent-red-500"
                    />
                </div>

                {/* Results Comparison */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl border border-white/5 bg-white/5">
                        <div className="text-xs text-white/50 mb-1">Current Profit</div>
                        <div className="text-lg font-mono font-bold text-white">
                            ${baseProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-green-500/80 font-mono">
                            {baseMarginPercent.toFixed(1)}% Margin
                        </div>
                    </div>

                    <div className={`text-center p-3 rounded-xl border ${profitDiff >= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                        <div className="text-xs text-white/50 mb-1">Simulated Profit</div>
                        <div className={`text-lg font-mono font-bold ${profitDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${simProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-xs font-mono flex items-center justify-center gap-1 ${profitDiff >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                            <span>{simMarginPercent.toFixed(1)}%</span>
                            <span className="opacity-60">
                                ({profitDiff >= 0 ? '+' : ''}{profitDiff.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
