import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Leaf } from 'lucide-react';

interface KPIGridProps {
    actualPotencyMg: number;
    targetPotencyMg: number;
    isPotencySafe: boolean;
    fullyLoadedCost: number;
    manufCostPerUnit: number;
    totalLogisticsPerUnit: number;
    wholesaleMargin: number;
    retailMargin: number;
    wholesalePrice: number;
    msrp: number;
    totalUnits: number;
    totalRevenue: number;
    totalCOGS: number;
    cannabinoidTotals: Record<string, number>;
}

export const KPIGrid = ({
    actualPotencyMg,
    targetPotencyMg,
    isPotencySafe,
    fullyLoadedCost,
    manufCostPerUnit,
    totalLogisticsPerUnit,
    wholesaleMargin,
    retailMargin,
    wholesalePrice,
    msrp,
    totalUnits,
    totalRevenue,
    totalCOGS,
    cannabinoidTotals
}: KPIGridProps) => {
    const batchProfit = totalRevenue - totalCOGS;
    const grossMarginPercent = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;
    const wsMarginPercent = wholesalePrice > 0 ? (wholesaleMargin / wholesalePrice) * 100 : 0;
    const retailMarginPercent = msrp > 0 ? (retailMargin / msrp) * 100 : 0;

    // Potency severity - how far off are we?
    const potencyRatio = actualPotencyMg / targetPotencyMg;
    const isPotencyCritical = potencyRatio > 2 || potencyRatio < 0.5;

    // Cannabinoid data
    const cbdMg = cannabinoidTotals['CBD'] || 0;
    const thcMg = cannabinoidTotals['THC'] || 0;
    const cbgMg = cannabinoidTotals['CBG'] || 0;
    const hasCBD = cbdMg > 0;
    const hasTHC = thcMg > 0;
    const hasCBG = cbgMg > 0;

    // Per-unit potency
    const cbdPerUnit = totalUnits > 0 ? cbdMg / totalUnits : 0;
    const thcPerUnit = totalUnits > 0 ? thcMg / totalUnits : 0;
    const cbgPerUnit = totalUnits > 0 ? cbgMg / totalUnits : 0;

    // Ratio display (if both CBD and THC present)
    const cbdThcRatio = hasCBD && hasTHC && thcMg > 0
        ? `${Math.round(cbdMg / thcMg)}:1`
        : null;

    return (
        <div className="space-y-3">
            {/* PRIMARY ROW - Hero KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Unit Cost - HERO */}
                <div className={`p-5 rounded-xl shadow-md border-2 text-center ${fullyLoadedCost > 12 ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'} print:bg-white print:border-neutral-300`}>
                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1 print:text-black">Unit Cost</div>
                    <div className="text-3xl font-black text-neutral-900 print:text-black">${fullyLoadedCost.toFixed(2)}</div>
                    <div className="text-base text-neutral-600 mt-1 print:text-black">
                        Mfg ${manufCostPerUnit.toFixed(2)} + Dist ${totalLogisticsPerUnit.toFixed(2)}
                    </div>
                </div>

                {/* Batch Profit - HERO */}
                <div className={`p-5 rounded-xl shadow-md border-2 text-center ${batchProfit >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'} print:bg-white print:border-neutral-300`}>
                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <DollarSign size={14} /> Batch Profit
                    </div>
                    <div className={`text-3xl font-black ${batchProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                        ${batchProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-base text-neutral-600 mt-1 print:text-black">
                        ${totalUnits > 0 ? (batchProfit / totalUnits).toFixed(2) : '0.00'}/unit · {totalUnits.toLocaleString()} units
                    </div>
                </div>

                {/* Gross Margin - HERO */}
                <div className={`p-5 rounded-xl shadow-md border-2 text-center col-span-2 lg:col-span-1 ${grossMarginPercent >= 30 ? 'bg-blue-50 border-blue-300' : 'bg-orange-50 border-orange-300'} print:bg-white print:border-neutral-300`}>
                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <TrendingUp size={14} /> Gross Margin
                    </div>
                    <div className={`text-3xl font-black ${grossMarginPercent >= 30 ? 'text-blue-600' : 'text-orange-600'} print:text-black`}>
                        {grossMarginPercent.toFixed(0)}%
                    </div>
                    <div className="text-base text-neutral-600 mt-1 print:text-black">
                        ${batchProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} rev
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW - Cannabinoid + Margin KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {/* CBD Card - Blue theme (only if present) */}
                {hasCBD && (
                    <div className="bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-200 text-center print:bg-white print:border-neutral-300">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <Leaf size={12} /> CBD
                        </div>
                        <div className="text-lg font-bold text-blue-700 print:text-black">
                            {Math.round(cbdPerUnit)}mg
                        </div>
                        <div className="text-sm text-blue-500 mt-0.5 print:text-black">
                            {cbdThcRatio ? `${cbdThcRatio} CBD:THC` : `${(cbdMg / 1000).toFixed(1)}g total`}
                        </div>
                    </div>
                )}

                {/* THC Card - Amber theme (only if present) */}
                {hasTHC && (
                    <div className="bg-amber-50 p-3 rounded-lg shadow-sm border border-amber-200 text-center print:bg-white print:border-neutral-300">
                        <div className="text-xs font-bold text-amber-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <Leaf size={12} /> THC
                        </div>
                        <div className="text-lg font-bold text-amber-700 print:text-black">
                            {Math.round(thcPerUnit)}mg
                        </div>
                        <div className="text-sm text-amber-500 mt-0.5 print:text-black">
                            {(thcMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* CBG Card - Purple theme (only if present) */}
                {hasCBG && (
                    <div className="bg-purple-50 p-3 rounded-lg shadow-sm border border-purple-200 text-center print:bg-white print:border-neutral-300">
                        <div className="text-xs font-bold text-purple-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <Leaf size={12} /> CBG
                        </div>
                        <div className="text-lg font-bold text-purple-700 print:text-black">
                            {Math.round(cbgPerUnit)}mg
                        </div>
                        <div className="text-sm text-purple-500 mt-0.5 print:text-black">
                            {(cbgMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* Fallback: Original Potency card if no cannabinoids specified */}
                {!hasCBD && !hasTHC && !hasCBG && (
                    <div className={`p-3 rounded-lg shadow-sm border text-center transition-all ${isPotencyCritical
                        ? 'bg-red-100 border-red-400 animate-pulse'
                        : isPotencySafe
                            ? 'bg-white border-neutral-200'
                            : 'bg-yellow-50 border-yellow-300'
                        } print:bg-white print:border-neutral-300`}>
                        <div className="text-xs font-bold text-neutral-400 uppercase mb-0.5 print:text-black">Potency</div>
                        <div className={`text-lg font-bold flex items-center justify-center gap-1 ${isPotencyCritical ? 'text-red-600' : isPotencySafe ? 'text-green-600' : 'text-yellow-600'
                            } print:text-black`}>
                            {Math.round(actualPotencyMg)}mg
                            {isPotencyCritical ? <AlertTriangle size={14} className="animate-bounce" /> :
                                isPotencySafe ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div className={`text-sm mt-0.5 ${isPotencyCritical ? 'text-red-600 font-bold' : 'text-neutral-500'} print:text-black`}>
                            {isPotencyCritical ? `${potencyRatio.toFixed(1)}x target!` : `Target: ${targetPotencyMg}mg`}
                        </div>
                    </div>
                )}

                {/* Wholesale Margin - with $ context */}
                <div className="bg-neutral-800 p-3 rounded-lg shadow-sm border border-neutral-700 text-white text-center print:bg-white print:text-black print:border-neutral-300">
                    <div className="text-xs font-bold text-neutral-400 uppercase mb-0.5 print:text-black">Wholesale</div>
                    <div className="text-lg font-bold text-yellow-500 print:text-black">{Math.round(wsMarginPercent)}%</div>
                    <div className="text-sm text-neutral-400 mt-0.5 print:text-black">
                        ${wholesalePrice.toFixed(0)} → ${wholesaleMargin.toFixed(2)}
                    </div>
                </div>

                {/* Retail Margin - with $ context */}
                <div className="bg-neutral-900 p-3 rounded-lg shadow-sm border border-neutral-800 text-white text-center print:bg-white print:text-black print:border-neutral-300">
                    <div className="text-xs font-bold text-neutral-400 uppercase mb-0.5 print:text-black">Retail</div>
                    <div className="text-lg font-bold text-green-400 print:text-black">{Math.round(retailMarginPercent)}%</div>
                    <div className="text-sm text-neutral-400 mt-0.5 print:text-black">
                        ${msrp.toFixed(0)} → ${retailMargin.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};
