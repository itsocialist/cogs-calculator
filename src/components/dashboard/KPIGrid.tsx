import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Scale } from 'lucide-react';

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
    baseUnitLabel?: string;
    totalBatchWeight?: number; // grams
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
    cannabinoidTotals,
    baseUnitLabel = '1 oz',
    totalBatchWeight = 0
}: KPIGridProps) => {
    const batchProfit = totalRevenue - totalCOGS;
    const grossMarginPercent = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;
    const wsMarginPercent = wholesalePrice > 0 ? (wholesaleMargin / wholesalePrice) * 100 : 0;
    const retailMarginPercent = msrp > 0 ? (retailMargin / msrp) * 100 : 0;

    // Potency severity
    const potencyRatio = targetPotencyMg > 0 ? actualPotencyMg / targetPotencyMg : 1;
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

    // Cost per gram
    const costPerGram = totalBatchWeight > 0 ? totalCOGS / totalBatchWeight : 0;

    // Ratio display
    const cbdThcRatio = hasCBD && hasTHC && thcMg > 0
        ? `${Math.round(cbdMg / thcMg)}:1`
        : null;

    // Dynamic grid sizing for secondary row
    const cannabinoidCount = [hasCBD, hasTHC, hasCBG].filter(Boolean).length;
    const secondaryCardCount = cannabinoidCount + 3; // cannabinoids + cost/gram + 2 margins
    const gridClass = secondaryCardCount <= 4
        ? 'grid-cols-2 md:grid-cols-4'
        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';

    return (
        <div className="space-y-3">
            {/* PRIMARY ROW - Hero KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Unit Cost */}
                <div className={`p-5 rounded-lg bg-white border text-center shadow-lg ${fullyLoadedCost > 12 ? 'border-red-300' : 'border-slate-200'} print:border-slate-300`}>
                    <div className="text-sm font-bold text-slate-600 uppercase mb-1 print:text-black">Unit Cost</div>
                    <div className={`text-3xl font-black ${fullyLoadedCost > 12 ? 'text-red-600' : 'text-slate-900'} print:text-black`}>${fullyLoadedCost.toFixed(2)}</div>
                    <div className="text-sm text-slate-500 mt-1 print:text-black">
                        Mfg ${manufCostPerUnit.toFixed(2)} + Dist ${totalLogisticsPerUnit.toFixed(2)}
                    </div>
                </div>

                {/* Batch Profit */}
                <div className={`p-5 rounded-lg bg-white border text-center shadow-lg ${batchProfit >= 0 ? 'border-slate-200' : 'border-red-300'} print:border-slate-300`}>
                    <div className="text-sm font-bold text-slate-600 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <DollarSign size={14} /> Batch Profit
                    </div>
                    <div className={`text-3xl font-black ${batchProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                        ${batchProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-slate-500 mt-1 print:text-black">
                        ${totalUnits > 0 ? (batchProfit / totalUnits).toFixed(2) : '0.00'}/unit · {totalUnits.toLocaleString()} units
                    </div>
                </div>

                {/* Gross Margin */}
                <div className={`p-5 rounded-lg bg-white border text-center col-span-2 lg:col-span-1 shadow-lg ${grossMarginPercent >= 30 ? 'border-slate-200' : 'border-amber-300'} print:border-slate-300`}>
                    <div className="text-sm font-bold text-slate-600 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <TrendingUp size={14} /> Gross Margin
                    </div>
                    <div className={`text-3xl font-black ${grossMarginPercent >= 30 ? 'text-blue-600' : 'text-amber-600'} print:text-black`}>
                        {grossMarginPercent.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500 mt-1 print:text-black">
                        ${batchProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} rev
                    </div>
                </div>
            </div>

            {/* SECONDARY ROW - Dynamic grid */}
            <div className={`grid ${gridClass} gap-2`}>
                {/* CBD Card */}
                {hasCBD && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center shadow-lg print:border-slate-300">
                        <div className="text-sm font-bold text-slate-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">CBD</span>
                            / {baseUnitLabel}
                        </div>
                        <div className="text-xl font-black text-slate-800 print:text-black">
                            {Math.round(cbdPerUnit)}mg
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 print:text-black">
                            {cbdThcRatio ? `${cbdThcRatio} CBD:THC` : `Target: ${targetPotencyMg}mg`}
                        </div>
                    </div>
                )}

                {/* THC Card */}
                {hasTHC && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center shadow-lg print:border-slate-300">
                        <div className="text-sm font-bold text-slate-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">THC</span>
                        </div>
                        <div className="text-xl font-black text-slate-800 print:text-black">
                            {Math.round(thcPerUnit)}mg
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 print:text-black">
                            {(thcMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* CBG Card */}
                {hasCBG && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center shadow-lg print:border-slate-300">
                        <div className="text-sm font-bold text-slate-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">CBG</span>
                        </div>
                        <div className="text-xl font-black text-slate-800 print:text-black">
                            {Math.round(cbgPerUnit)}mg
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 print:text-black">
                            {(cbgMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* Fallback: General Potency if no cannabinoids */}
                {!hasCBD && !hasTHC && !hasCBG && (
                    <div className={`bg-slate-50 p-3 rounded-lg border text-center shadow-lg ${isPotencyCritical ? 'border-red-400' : 'border-slate-200'} print:border-slate-300`}>
                        <div className="text-sm font-bold text-slate-600 uppercase mb-0.5 print:text-black">Potency</div>
                        <div className={`text-xl font-black flex items-center justify-center gap-1 ${isPotencyCritical ? 'text-red-600' : isPotencySafe ? 'text-green-600' : 'text-amber-600'} print:text-black`}>
                            {Math.round(actualPotencyMg)}mg
                            {isPotencyCritical ? <AlertTriangle size={14} /> :
                                isPotencySafe ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5 print:text-black">
                            Target: {targetPotencyMg}mg
                        </div>
                    </div>
                )}

                {/* Cost per Gram - Always show */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center shadow-lg print:border-slate-300">
                    <div className="text-sm font-bold text-slate-600 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                        <Scale size={12} /> Cost/Gram
                    </div>
                    <div className="text-xl font-black text-slate-800 print:text-black">
                        ${costPerGram.toFixed(3)}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5 print:text-black">
                        {(totalBatchWeight / 1000).toFixed(1)}kg batch
                    </div>
                </div>

                {/* Wholesale Margin */}
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center shadow-lg print:bg-white print:text-black print:border-slate-300">
                    <div className="text-sm font-bold text-slate-300 uppercase mb-0.5 print:text-black">Wholesale</div>
                    <div className="text-xl font-black text-white print:text-black">{Math.round(wsMarginPercent)}%</div>
                    <div className="text-sm text-slate-400 mt-0.5 print:text-black">
                        ${wholesalePrice.toFixed(0)} → ${wholesaleMargin.toFixed(2)}
                    </div>
                </div>

                {/* Retail Margin */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center shadow-lg print:bg-white print:text-black print:border-slate-300">
                    <div className="text-sm font-bold text-slate-300 uppercase mb-0.5 print:text-black">Retail</div>
                    <div className="text-xl font-black text-white print:text-black">{Math.round(retailMarginPercent)}%</div>
                    <div className="text-sm text-slate-400 mt-0.5 print:text-black">
                        ${msrp.toFixed(0)} → ${retailMargin.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};
