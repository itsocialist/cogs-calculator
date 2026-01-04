import { useState, useEffect, useRef } from 'react';
import { Calculator, GripHorizontal, X, Equal, AlertTriangle, CheckCircle } from 'lucide-react';
import { useConfig } from '../../context/configContext';
import { useCalculator } from '../../hooks/useCalculator';

type CalculatorResult = ReturnType<typeof useCalculator>;

interface Props {
    data: CalculatorResult;
    onClose: () => void;
}

export const DraggableMathPanel = ({ data, onClose }: Props) => {
    const { config, convertFromGrams } = useConfig();
    const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    // Calculation Helpers
    const wScale = config.manifest.weightScale;

    // Derived Data for Display
    const batchSizeKg = data.batchConfig.batchSizeKg;
    const totalUnits = data.unitsProduced;
    const firstSku = data.skuCalculations[0];

    // Separate manifests for Active and Inactive with subtotals
    const activeManifest = data.activeIngredients.map(i => ({
        name: i.name,
        cost: (i.gramsInBatch / 1000) * i.costPerKg,
        weight: i.gramsInBatch
    }));
    const inactiveManifest = data.inactiveIngredients.map(i => ({
        name: i.name,
        cost: (i.gramsInBatch / 1000) * i.costPerKg,
        weight: i.gramsInBatch
    }));
    const activeSubtotal = activeManifest.reduce((sum, i) => sum + i.cost, 0);
    const inactiveSubtotal = inactiveManifest.reduce((sum, i) => sum + i.cost, 0);

    const totalFormulaCost = data.totalFormulaCost;
    const materialCostPerUnit = totalUnits > 0 ? totalFormulaCost / totalUnits : 0;
    const mfgLaborCostPerUnit = data.laborCostPerUnit;
    const fulfillmentCostPerUnit = data.batchConfig.fulfillmentCost;
    const packagingCostPerUnit = firstSku?.packagingCostPerUnit || 0;
    const logisticsCostPerUnit = firstSku?.logisticsCostPerUnit || 0;
    const fullyLoadedPerUnit = data.fullyLoadedCost;

    // Potency
    const totalActiveMg = data.totalActiveMg;
    const potencyPerUnit = firstSku?.potencyMg || 0;
    const isPotencySafe = firstSku?.isPotencySafe ?? true;

    // Allocation
    const weightUtilization = data.weightUtilization * 100;
    const isOverAllocated = data.isOverAllocated;

    // Format helpers
    const fmtW = (g: number) => `${convertFromGrams(g, wScale).toLocaleString([], { maximumFractionDigits: 2 })}${wScale}`;
    const fmtMoney = (n: number) => `$${n.toFixed(4)}`;
    const fmtPct = (n: number) => `${n.toFixed(1)}%`;

    return (
        <div
            className="fixed z-[100] w-96 bg-white shadow-2xl rounded-lg border border-neutral-300 flex flex-col overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                maxHeight: '85vh',
                fontFamily: '"Fira Code", monospace'
            }}
        >
            {/* Header / Drag Handle */}
            <div
                className={`bg-neutral-800 text-white p-2 flex items-center justify-between cursor-move select-none ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <Calculator size={14} className="text-yellow-400" />
                    Accounting Tape
                </div>
                <div className="flex items-center gap-2">
                    <GripHorizontal size={16} className="text-neutral-500" />
                    <button onClick={onClose} className="hover:text-red-400">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Tape Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono bg-yellow-50/20">

                {/* Section: BATCH */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">BATCH METRICS</div>
                    <div className="flex justify-between py-0.5">
                        <span>Input Weight</span>
                        <span>{batchSizeKg} kg</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-neutral-500">
                        <span>→ Formula Weight</span>
                        <span>{data.totalBatchWeightGrams.toLocaleString()} g</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Total Active mg</span>
                        <span>{totalActiveMg.toLocaleString(undefined, { maximumFractionDigits: 0 })} mg</span>
                    </div>
                    {/* Recipe Coverage */}
                    {(() => {
                        const ingredientWeightPerUnit = data.activeIngredients.reduce((s, i) => s + i.gramsPerRecipeUnit, 0)
                            + data.inactiveIngredients.reduce((s, i) => s + i.gramsPerRecipeUnit, 0);
                        const coverage = data.recipeConfig.baseUnitSize > 0
                            ? (ingredientWeightPerUnit / data.recipeConfig.baseUnitSize) * 100 : 0;
                        const isWarning = coverage < 90 || coverage > 110;
                        return (
                            <div className={`flex justify-between py-0.5 px-1 -mx-1 rounded ${isWarning ? 'bg-amber-100' : ''}`}>
                                <span>Recipe Coverage</span>
                                <span className={isWarning ? 'text-amber-700 font-bold' : 'text-green-700 font-bold'}>
                                    {coverage.toFixed(1)}%
                                </span>
                            </div>
                        );
                    })()}
                </div>

                {/* Section: UNIT ECONOMICS */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">UNIT DEFINITION</div>
                    <div className="flex justify-between py-0.5">
                        <span>Base Unit Size</span>
                        <span className="font-bold">{fmtW(data.recipeConfig.baseUnitSize)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Batch / Unit</span>
                        <span className="flex items-center gap-1">
                            {data.totalBatchWeightGrams.toLocaleString()} / {data.recipeConfig.baseUnitSize.toFixed(2)}
                            <Equal size={10} />
                        </span>
                    </div>
                    <div className="flex justify-between py-0.5 bg-yellow-100 px-1 -mx-1 rounded">
                        <span className="font-bold">Total Units</span>
                        <span className="font-bold">{totalUnits.toLocaleString()}</span>
                    </div>
                </div>

                {/* Section: POTENCY */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">POTENCY</div>
                    <div className="flex justify-between py-0.5">
                        <span>Target per Unit</span>
                        <span>{data.recipeConfig.targetPotencyMg} mg</span>
                    </div>
                    <div className={`flex justify-between py-0.5 px-1 -mx-1 rounded ${isPotencySafe ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span className="flex items-center gap-1">
                            {isPotencySafe ? <CheckCircle size={10} className="text-green-600" /> : <AlertTriangle size={10} className="text-red-600" />}
                            Actual per Unit
                        </span>
                        <span className={isPotencySafe ? 'text-green-700' : 'text-red-700'}>{potencyPerUnit.toFixed(0)} mg</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-neutral-500">
                        <span>Variance</span>
                        <span>{(potencyPerUnit - data.recipeConfig.targetPotencyMg).toFixed(0)} mg</span>
                    </div>
                </div>

                {/* Section: SKU ALLOCATION */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">SKU ALLOCATION</div>
                    <div className="flex justify-between py-0.5">
                        <span>Batch Weight</span>
                        <span>{data.totalBatchWeightGrams.toLocaleString()} g</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Weight Allocated</span>
                        <span>{data.totalWeightAllocated.toLocaleString(undefined, { maximumFractionDigits: 0 })} g</span>
                    </div>
                    <div className={`flex justify-between py-0.5 px-1 -mx-1 rounded ${isOverAllocated ? 'bg-red-100' : 'bg-blue-50'}`}>
                        <span className="flex items-center gap-1">
                            {isOverAllocated && <AlertTriangle size={10} className="text-red-600" />}
                            Utilization
                        </span>
                        <span className={isOverAllocated ? 'text-red-700 font-bold' : 'font-bold'}>{fmtPct(weightUtilization)}</span>
                    </div>
                </div>

                {/* Section: ACTIVE INGREDIENTS */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">ACTIVE INGREDIENTS (Per Unit)</div>

                    {activeManifest.map((item, i) => (
                        <div key={i} className="flex justify-between py-0.5 group hover:bg-neutral-50 text-blue-700">
                            <span className="truncate pr-2 w-2/3">{item.name}</span>
                            <span>{fmtMoney(totalUnits > 0 ? item.cost / totalUnits : 0)}</span>
                        </div>
                    ))}

                    <div className="border-t border-neutral-300 mt-1 pt-1 flex justify-between font-medium text-blue-800">
                        <span>Active Subtotal</span>
                        <span>{fmtMoney(totalUnits > 0 ? activeSubtotal / totalUnits : 0)}</span>
                    </div>
                </div>

                {/* Section: INACTIVE INGREDIENTS */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">INACTIVE INGREDIENTS (Per Unit)</div>

                    {inactiveManifest.map((item, i) => (
                        <div key={i} className="flex justify-between py-0.5 group hover:bg-neutral-50">
                            <span className="truncate pr-2 w-2/3">{item.name}</span>
                            <span>{fmtMoney(totalUnits > 0 ? item.cost / totalUnits : 0)}</span>
                        </div>
                    ))}

                    <div className="border-t border-neutral-300 mt-1 pt-1 flex justify-between font-medium">
                        <span>Inactive Subtotal</span>
                        <span>{fmtMoney(totalUnits > 0 ? inactiveSubtotal / totalUnits : 0)}</span>
                    </div>
                </div>

                {/* Section: FORMULA TOTAL */}
                <div className="mb-4">
                    <div className="border-t border-neutral-800 pt-1 flex justify-between font-bold bg-yellow-100 px-1 -mx-1 rounded">
                        <span>Formula Total</span>
                        <span>{fmtMoney(materialCostPerUnit)}</span>
                    </div>
                </div>

                {/* Section: PACKAGING */}
                {firstSku && (
                    <div className="mb-4">
                        <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">PACKAGING ({firstSku.name})</div>
                        {data.skus[0]?.packaging.map((p, i) => (
                            <div key={i} className="flex justify-between py-0.5">
                                <span className="truncate pr-2 w-2/3">{p.name}</span>
                                <span>{fmtMoney(p.costPerUnit)}</span>
                            </div>
                        ))}
                        <div className="border-t border-neutral-300 mt-1 pt-1 flex justify-between font-bold">
                            <span>Packaging Total</span>
                            <span>{fmtMoney(packagingCostPerUnit)}</span>
                        </div>
                    </div>
                )}

                {/* Section: LOGISTICS */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">LOGISTICS (Per Unit)</div>
                    <div className="flex justify-between py-0.5">
                        <span>Lab Testing</span>
                        <span>{fmtMoney(data.labTestPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Shipping to Distro</span>
                        <span>{fmtMoney(data.shippingPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Distro Fees</span>
                        <span>{fmtMoney(data.totalDistroFeesPerUnit)}</span>
                    </div>
                    <div className="border-t border-neutral-300 mt-1 pt-1 flex justify-between font-bold">
                        <span>Logistics Total</span>
                        <span>{fmtMoney(logisticsCostPerUnit)}</span>
                    </div>
                </div>

                {/* Section: LANDED */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">LANDED COST</div>
                    <div className="flex justify-between py-0.5">
                        <span>Material Cost</span>
                        <span>{fmtMoney(materialCostPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Mfg Labor</span>
                        <span>+ {fmtMoney(mfgLaborCostPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Packaging</span>
                        <span>+ {fmtMoney(packagingCostPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Fulfillment</span>
                        <span>+ {fmtMoney(fulfillmentCostPerUnit)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                        <span>Logistics</span>
                        <span>+ {fmtMoney(logisticsCostPerUnit)}</span>
                    </div>
                    <div className="border-t border-neutral-800 mt-2 pt-1 flex justify-between font-bold bg-neutral-100 px-1 -mx-1">
                        <span>Fully Loaded</span>
                        <span>{fmtMoney(fullyLoadedPerUnit)}</span>
                    </div>
                </div>

                {/* Section: MARGINS */}
                {firstSku && (
                    <div className="mb-4">
                        <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">MARGINS</div>
                        <div className="flex justify-between py-0.5">
                            <span>Wholesale Price</span>
                            <span>${firstSku.wholesalePrice.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between py-0.5 ${firstSku.wholesaleMargin >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            <span>Wholesale Margin</span>
                            <span>${firstSku.wholesaleMargin.toFixed(2)} ({fmtPct(firstSku.wholesaleMarginPercent)})</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                            <span>MSRP</span>
                            <span>${firstSku.msrp.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between py-0.5 ${firstSku.retailMargin >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            <span>Retail Margin</span>
                            <span>${firstSku.retailMargin.toFixed(2)} ({fmtPct(firstSku.retailMarginPercent)})</span>
                        </div>
                    </div>
                )}

                <div className="text-center text-neutral-400 mt-6 text-[10px]">
                    *** END OF CALCULATION ***
                </div>

            </div>
        </div>
    );
};
