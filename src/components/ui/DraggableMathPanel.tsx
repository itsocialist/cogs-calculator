import { useState, useEffect, useRef } from 'react';
import { Calculator, GripHorizontal, X, Equal } from 'lucide-react';
import { useConfig } from '../../context/configContext';
import { useCalculator } from '../../hooks/useCalculator';

type CalculatorResult = ReturnType<typeof useCalculator>;

interface Props {
    data: CalculatorResult;
    onClose: () => void;
}

export const DraggableMathPanel = ({ data, onClose }: Props) => {
    const { config, convertFromGrams } = useConfig();
    const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 100 });
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

    // Combine Manifest for "Formula Costs"
    const fullManifest = [
        ...data.activeIngredients.map(i => ({
            name: i.name,
            cost: (i.gramsInBatch / 1000) * i.costPerKg
        })),
        ...data.inactiveIngredients.map(i => ({
            name: i.name,
            cost: (i.gramsInBatch / 1000) * i.costPerKg
        }))
    ];

    const totalFormulaCost = data.totalFormulaCost;
    const materialCostPerUnit = totalUnits > 0 ? totalFormulaCost / totalUnits : 0;
    const mfgLaborCostPerUnit = data.laborCostPerUnit;
    const fulfillmentCostPerUnit = data.batchConfig.fulfillmentCost;
    const fullyLoadedPerUnit = data.fullyLoadedCost;

    // Format helpers
    const fmtW = (g: number) => `${convertFromGrams(g, wScale).toLocaleString([], { maximumFractionDigits: 2 })}${wScale}`;
    const fmtMoney = (n: number) => `$${n.toFixed(4)}`;

    return (
        <div
            className="fixed z-[100] w-80 bg-white shadow-2xl rounded-lg border border-neutral-300 flex flex-col overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                maxHeight: '80vh',
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
                        <span>→ Convert to g</span>
                        <span>{data.totalBatchWeightGrams.toLocaleString()} g</span>
                    </div>
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
                            {data.totalBatchWeightGrams.toLocaleString()} / {data.recipeConfig.baseUnitSize}
                            <Equal size={10} />
                        </span>
                    </div>
                    <div className="flex justify-between py-0.5 bg-yellow-100 px-1 -mx-1 rounded">
                        <span className="font-bold">Total Units</span>
                        <span className="font-bold">{totalUnits.toLocaleString()}</span>
                    </div>
                </div>

                {/* Section: INGREDIENTS */}
                <div className="mb-4">
                    <div className="border-b border-dashed border-neutral-300 mb-2 pb-1 font-bold text-neutral-500">FORMULA COSTS (Per Unit)</div>

                    {fullManifest.map((item, i) => (
                        <div key={i} className="flex justify-between py-0.5 group hover:bg-neutral-50">
                            <span className="truncate pr-2 w-2/3">{item.name}</span>
                            <span>{fmtMoney(totalUnits > 0 ? item.cost / totalUnits : 0)}</span>
                        </div>
                    ))}

                    <div className="border-t border-neutral-800 mt-2 pt-1 flex justify-between font-bold">
                        <span>Formula Total</span>
                        <span>{fmtMoney(materialCostPerUnit)}</span>
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
                        <span>Pack/Fulfillment</span>
                        <span>+ {fmtMoney(fulfillmentCostPerUnit)}</span>
                    </div>
                    <div className="border-t border-neutral-800 mt-2 pt-1 flex justify-between font-bold bg-neutral-100 px-1 -mx-1">
                        <span>Fully Loaded</span>
                        <span>{fmtMoney(fullyLoadedPerUnit)}</span>
                    </div>
                </div>

                <div className="text-center text-neutral-400 mt-6 text-[10px]">
                    *** END OF CALCULATION ***
                </div>

            </div>
        </div>
    );
};
