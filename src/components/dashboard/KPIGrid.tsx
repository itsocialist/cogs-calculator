import { useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Scale } from 'lucide-react';

// Wrapper for hover-expand effect after 2 seconds
const HoverExpandCard = ({ children, className }: { children: React.ReactNode; className: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = useCallback(() => {
        timerRef.current = setTimeout(() => {
            setIsExpanded(true);
        }, 2000);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsExpanded(false);
    }, []);

    return (
        <div
            className={`${className} transition-transform duration-300 ${isExpanded ? 'scale-125 z-50 shadow-2xl' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
};

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
                <HoverExpandCard className={`p-5 rounded-lg bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/20 text-center ${fullyLoadedCost > 12 ? 'border-l-4 border-l-red-400/60' : ''} print:bg-white print:border-slate-300`}>
                    <div className="text-sm font-bold text-white/50 uppercase mb-1 print:text-black">Unit Cost</div>
                    <div className={`text-3xl font-black ${fullyLoadedCost > 12 ? 'text-red-400' : 'text-white/90'} print:text-black`}>${fullyLoadedCost.toFixed(2)}</div>
                    <div className="text-sm text-white/40 mt-1 print:text-black">
                        Mfg ${manufCostPerUnit.toFixed(2)} + Dist ${totalLogisticsPerUnit.toFixed(2)}
                    </div>
                </HoverExpandCard>

                {/* Batch Profit */}
                <HoverExpandCard className={`p-5 rounded-lg bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/20 text-center ${batchProfit >= 0 ? 'border-l-4 border-l-emerald-400/60' : 'border-l-4 border-l-red-400/60'} print:bg-white print:border-slate-300`}>
                    <div className="text-sm font-bold text-white/50 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <DollarSign size={14} /> Batch Profit
                    </div>
                    <div className={`text-3xl font-black ${batchProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} print:text-black`}>
                        ${batchProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-white/40 mt-1 print:text-black">
                        ${totalUnits > 0 ? (batchProfit / totalUnits).toFixed(2) : '0.00'}/unit · {totalUnits.toLocaleString()} units
                    </div>
                </HoverExpandCard>

                {/* Gross Margin */}
                <HoverExpandCard className={`p-5 rounded-lg bg-white/15 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/20 text-center col-span-2 lg:col-span-1 ${grossMarginPercent >= 30 ? 'border-l-4 border-l-blue-400/60' : 'border-l-4 border-l-amber-400/60'} print:bg-white print:border-slate-300`}>
                    <div className="text-sm font-bold text-white/50 uppercase mb-1 flex items-center justify-center gap-1 print:text-black">
                        <TrendingUp size={14} /> Gross Margin
                    </div>
                    <div className={`text-3xl font-black ${grossMarginPercent >= 30 ? 'text-blue-400' : 'text-amber-400'} print:text-black`}>
                        {grossMarginPercent.toFixed(0)}%
                    </div>
                    <div className="text-sm text-white/40 mt-1 print:text-black">
                        ${batchProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} on ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} rev
                    </div>
                </HoverExpandCard>
            </div>

            {/* SECONDARY ROW - Dynamic grid */}
            <div className={`grid ${gridClass} gap-2`}>
                {/* CBD Card */}
                {hasCBD && (
                    <div className="bg-white/15 backdrop-blur-xl p-3 rounded-lg border border-white/20 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                        <div className="text-sm font-bold text-white/50 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-blue-500/30 text-blue-300 rounded text-xs">CBD</span>
                            / {baseUnitLabel}
                        </div>
                        <div className="text-xl font-black text-white/90 print:text-black">
                            {Math.round(cbdPerUnit)}mg
                        </div>
                        <div className="text-sm text-white/40 mt-0.5 print:text-black">
                            {cbdThcRatio ? `${cbdThcRatio} CBD:THC` : `Target: ${targetPotencyMg}mg`}
                        </div>
                    </div>
                )}

                {/* THC Card */}
                {hasTHC && (
                    <div className="bg-white/15 backdrop-blur-xl p-3 rounded-lg border border-white/20 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                        <div className="text-sm font-bold text-white/50 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-amber-500/30 text-amber-300 rounded text-xs">THC</span>
                        </div>
                        <div className="text-xl font-black text-white/90 print:text-black">
                            {Math.round(thcPerUnit)}mg
                        </div>
                        <div className="text-sm text-white/40 mt-0.5 print:text-black">
                            {(thcMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* CBG Card */}
                {hasCBG && (
                    <div className="bg-white/15 backdrop-blur-xl p-3 rounded-lg border border-white/20 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                        <div className="text-sm font-bold text-white/50 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                            <span className="inline-block px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded text-xs">CBG</span>
                        </div>
                        <div className="text-xl font-black text-white/90 print:text-black">
                            {Math.round(cbgPerUnit)}mg
                        </div>
                        <div className="text-sm text-white/40 mt-0.5 print:text-black">
                            {(cbgMg / 1000).toFixed(1)}g total
                        </div>
                    </div>
                )}

                {/* Fallback: General Potency if no cannabinoids */}
                {!hasCBD && !hasTHC && !hasCBG && (
                    <div className={`bg-white/15 backdrop-blur-xl p-3 rounded-lg border border-white/20 text-center shadow-md shadow-black/15 ${isPotencyCritical ? 'border-l-4 border-l-red-400/60' : ''} print:bg-white print:border-slate-300`}>
                        <div className="text-sm font-bold text-white/50 uppercase mb-0.5 print:text-black">Potency</div>
                        <div className={`text-xl font-black flex items-center justify-center gap-1 ${isPotencyCritical ? 'text-red-400' : isPotencySafe ? 'text-emerald-400' : 'text-amber-400'} print:text-black`}>
                            {Math.round(actualPotencyMg)}mg
                            {isPotencyCritical ? <AlertTriangle size={14} /> :
                                isPotencySafe ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div className="text-sm text-white/40 mt-0.5 print:text-black">
                            Target: {targetPotencyMg}mg
                        </div>
                    </div>
                )}

                {/* Cost per Gram - Always show */}
                <div className="bg-white/15 backdrop-blur-xl p-3 rounded-lg border border-white/20 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                    <div className="text-sm font-bold text-white/50 uppercase mb-0.5 flex items-center justify-center gap-1 print:text-black">
                        <Scale size={12} /> Cost/Gram
                    </div>
                    <div className="text-xl font-black text-white/90 print:text-black">
                        ${costPerGram.toFixed(3)}
                    </div>
                    <div className="text-sm text-white/40 mt-0.5 print:text-black">
                        {(totalBatchWeight / 1000).toFixed(1)}kg batch
                    </div>
                </div>

                {/* Wholesale Margin */}
                <div className="bg-white/20 backdrop-blur-xl p-3 rounded-lg border border-white/25 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                    <div className="text-sm font-bold text-white/50 uppercase mb-0.5 print:text-black">Wholesale</div>
                    <div className="text-xl font-black text-white/90 print:text-black">{Math.round(wsMarginPercent)}%</div>
                    <div className="text-sm text-white/40 mt-0.5 print:text-black">
                        ${wholesalePrice.toFixed(0)} → ${wholesaleMargin.toFixed(2)}
                    </div>
                </div>

                {/* Retail Margin */}
                <div className="bg-white/20 backdrop-blur-xl p-3 rounded-lg border border-white/25 text-center shadow-md shadow-black/15 print:bg-white print:border-slate-300">
                    <div className="text-sm font-bold text-white/50 uppercase mb-0.5 print:text-black">Retail</div>
                    <div className="text-xl font-black text-white/90 print:text-black">{Math.round(retailMarginPercent)}%</div>
                    <div className="text-sm text-white/40 mt-0.5 print:text-black">
                        ${msrp.toFixed(0)} → ${retailMargin.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};
