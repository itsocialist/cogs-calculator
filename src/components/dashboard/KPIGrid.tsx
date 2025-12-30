import { CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

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
    totalCOGS
}: KPIGridProps) => {
    const batchProfit = totalRevenue - totalCOGS;
    const grossMarginPercent = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 print:grid-cols-6 print:gap-4">
            {/* Potency */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 print:shadow-none print:border print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-1 print:text-black">Potency</div>
                <div className={`text-xl font-bold flex items-center gap-1 ${isPotencySafe ? 'text-green-600 print:text-black' : 'text-red-500'}`}>
                    {Math.round(actualPotencyMg)}mg
                    {isPotencySafe ? <CheckCircle2 size={16} className="print:hidden" /> : <AlertTriangle size={16} className="print:hidden" />}
                </div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">Target: {targetPotencyMg}mg</div>
            </div>

            {/* Unit Cost */}
            <div className={`p-4 rounded-xl shadow-sm border ${fullyLoadedCost > 12 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} print:bg-white print:border-neutral-300`}>
                <div className="text-xs font-bold text-neutral-500 uppercase mb-1 print:text-black">Unit Cost</div>
                <div className="text-xl font-bold text-neutral-900 print:text-black">${fullyLoadedCost.toFixed(2)}</div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">Mfg: ${manufCostPerUnit.toFixed(2)} | Dist: ${totalLogisticsPerUnit.toFixed(2)}</div>
            </div>

            {/* Wholesale Margin */}
            <div className="bg-neutral-800 p-4 rounded-xl shadow-sm border border-neutral-700 text-white print:bg-white print:text-black print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-1 print:text-black">WS Margin</div>
                <div className="text-xl font-bold text-yellow-500 print:text-black">{wholesalePrice > 0 ? Math.round((wholesaleMargin / wholesalePrice) * 100) : 0}%</div>
                <div className="text-xs text-neutral-400 mt-1 print:text-black">${wholesaleMargin.toFixed(2)} / unit</div>
            </div>

            {/* Retail Margin */}
            <div className="bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-800 text-white print:bg-white print:text-black print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-1 print:text-black">Retail Margin</div>
                <div className="text-xl font-bold text-green-400 print:text-black">{msrp > 0 ? Math.round((retailMargin / msrp) * 100) : 0}%</div>
                <div className="text-xs text-neutral-400 mt-1 print:text-black">${retailMargin.toFixed(2)} / unit</div>
            </div>

            {/* Batch Profit - NEW */}
            <div className={`p-4 rounded-xl shadow-sm border ${batchProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} print:bg-white print:border-neutral-300`}>
                <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1 print:text-black">
                    <DollarSign size={12} /> Batch Profit
                </div>
                <div className={`text-xl font-bold ${batchProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} print:text-black`}>
                    ${batchProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">{totalUnits.toLocaleString()} units</div>
            </div>

            {/* Gross Margin % - NEW */}
            <div className={`p-4 rounded-xl shadow-sm border ${grossMarginPercent >= 30 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} print:bg-white print:border-neutral-300`}>
                <div className="text-xs font-bold text-neutral-500 uppercase mb-1 flex items-center gap-1 print:text-black">
                    <TrendingUp size={12} /> Gross Margin
                </div>
                <div className={`text-xl font-bold ${grossMarginPercent >= 30 ? 'text-blue-600' : 'text-orange-600'} print:text-black`}>
                    {grossMarginPercent.toFixed(0)}%
                </div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">Rev: ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </div>
        </div>
    );
};
