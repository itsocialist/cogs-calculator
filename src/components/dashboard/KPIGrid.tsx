import { CheckCircle2, AlertTriangle } from 'lucide-react';

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
    msrp
}: KPIGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-neutral-200 print:shadow-none print:border print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-2 print:text-black">Target vs Actual</div>
                <div className={`text-2xl font-bold flex items-center gap-2 ${isPotencySafe ? 'text-green-600 print:text-black' : 'text-red-500'}`}>
                    {Math.round(actualPotencyMg)}mg
                    {isPotencySafe ? <CheckCircle2 size={20} className="print:hidden" /> : <AlertTriangle size={20} className="print:hidden" />}
                </div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">Target: {targetPotencyMg}mg / unit</div>
            </div>

            <div className={`p-5 rounded-xl shadow-sm border ${fullyLoadedCost > 12 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} print:bg-white print:border-neutral-300`}>
                <div className="text-xs font-bold text-neutral-500 uppercase mb-2 print:text-black">Fully Loaded Unit Cost</div>
                <div className="text-2xl font-bold text-neutral-900 print:text-black">${fullyLoadedCost.toFixed(2)}</div>
                <div className="text-xs text-neutral-500 mt-1 print:text-black">Mfg: ${manufCostPerUnit.toFixed(2)} | Dist: ${totalLogisticsPerUnit.toFixed(2)}</div>
            </div>

            <div className="bg-neutral-800 p-5 rounded-xl shadow-sm border border-neutral-700 text-white print:bg-white print:text-black print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-2 print:text-black">Wholesale Margin</div>
                <div className="text-2xl font-bold text-yellow-500 print:text-black">{Math.round((wholesaleMargin / wholesalePrice) * 100)}%</div>
                <div className="text-xs text-neutral-400 mt-1 print:text-black">${wholesaleMargin.toFixed(2)} profit / unit</div>
            </div>

            <div className="bg-neutral-900 p-5 rounded-xl shadow-sm border border-neutral-800 text-white relative overflow-hidden print:bg-white print:text-black print:border-neutral-300">
                <div className="text-xs font-bold text-neutral-400 uppercase mb-2 print:text-black">Retail / DTC Margin</div>
                <div className="text-2xl font-bold text-green-400 print:text-black">{Math.round((retailMargin / msrp) * 100)}%</div>
                <div className="text-xs text-neutral-400 mt-1 print:text-black">${retailMargin.toFixed(2)} profit / unit</div>
            </div>
        </div>
    );
};
