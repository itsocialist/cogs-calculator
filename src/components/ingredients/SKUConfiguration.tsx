import { useState } from 'react';
import { Package, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import { useConfig } from '../../context/configContext';
import type { SKUUnit } from '../../context/configContext';
import type { SKU, PackagingItem } from '../../lib/types';
import type { SKUCalculation } from '../../hooks/useCalculator';

interface Props {
    skus: SKU[];
    skuCalculations: SKUCalculation[];
    totalBatchWeightGrams: number;
    totalWeightAllocated: number;
    isOverAllocated: boolean;
    defaultPackaging: PackagingItem[];
    onAdd: (sku: Omit<SKU, 'id'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (id: number, updates: Partial<SKU>) => void;
    onUpdatePackaging: (skuId: number, packaging: PackagingItem[]) => void;
    onAddPackagingItem: (skuId: number, item: Omit<PackagingItem, 'id'>) => void;
    onRemovePackagingItem: (skuId: number, itemId: number) => void;
}

export const SKUConfiguration = ({
    skus,
    skuCalculations,
    totalBatchWeightGrams,
    totalWeightAllocated,
    isOverAllocated,
    defaultPackaging,
    onAdd,
    onRemove,
    onUpdate,
    onUpdatePackaging,
    onAddPackagingItem,
    onRemovePackagingItem
}: Props) => {
    const { config, convertFromGrams, convertFromMl } = useConfig();
    const [expandedSku, setExpandedSku] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newSku, setNewSku] = useState({
        name: "",
        unitSizeValue: 60,
        unitSizeUnit: (config.sku?.defaultUnit || 'ml') as SKUUnit,
        quantity: 100,
        wholesalePrice: 24.99,
        msrp: 49.99
    });

    const handleAdd = () => {
        if (!newSku.name) return;
        onAdd({
            name: newSku.name,
            unitSizeValue: newSku.unitSizeValue,
            unitSizeUnit: newSku.unitSizeUnit,
            quantity: newSku.quantity,
            wholesalePrice: newSku.wholesalePrice,
            msrp: newSku.msrp,
            packaging: defaultPackaging.map(p => ({ ...p, id: Date.now() + Math.random() }))
        });
        setNewSku({
            name: "",
            unitSizeValue: 60,
            unitSizeUnit: (config.sku?.defaultUnit || 'ml') as 'g' | 'ml' | 'oz',
            quantity: 100,
            wholesalePrice: 24.99,
            msrp: 49.99
        });
        setIsAdding(false);
    };

    const getSkuCalc = (skuId: number) => skuCalculations.find(c => c.skuId === skuId);

    return (
        <Card
            title="SKU Configuration"
            icon={Package}
            collapsible
            action={
                <button
                    onClick={() => !isOverAllocated && setIsAdding(!isAdding)}
                    disabled={isOverAllocated}
                    title={isOverAllocated ? "Cannot add SKU: Batch is over-allocated" : "Add new SKU"}
                    className={`text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${isOverAllocated
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
                        : 'bg-black text-white hover:bg-neutral-800'
                        }`}
                >
                    <Plus size={14} /> Add SKU
                </button>
            }
        >
            {/* Weight Allocation Bar */}
            <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Batch Allocation</span>
                    <span className={isOverAllocated ? 'text-red-500 font-bold' : ''}>
                        {convertFromGrams(totalWeightAllocated, config.manifest.weightScale).toLocaleString()}{config.manifest.weightScale} /
                        {convertFromGrams(totalBatchWeightGrams, config.manifest.weightScale).toLocaleString()}{config.manifest.weightScale}
                    </span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${isOverAllocated ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(100, (totalWeightAllocated / totalBatchWeightGrams) * 100)}%` }}
                    />
                </div>
                {isOverAllocated && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Over-allocated by
                        {convertFromGrams(totalWeightAllocated - totalBatchWeightGrams, config.manifest.weightScale).toLocaleString()}{config.manifest.weightScale}
                        ({convertFromMl((totalWeightAllocated - totalBatchWeightGrams) / 0.95, config.manifest.volumeScale).toLocaleString()}{config.manifest.volumeScale})
                    </p>
                )}
            </div>

            {/* SKU List */}
            <div className="space-y-3">
                {skus.map((sku) => {
                    const calc = getSkuCalc(sku.id);
                    const isExpanded = expandedSku === sku.id;

                    return (
                        <div key={sku.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                            {/* SKU Header */}
                            <div className="p-3 bg-white">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setExpandedSku(isExpanded ? null : sku.id)}
                                        className="text-neutral-400 hover:text-neutral-600"
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-3">
                                        <input
                                            type="text"
                                            value={sku.name}
                                            onChange={(e) => onUpdate(sku.id, { name: e.target.value })}
                                            className="bg-transparent font-medium text-neutral-900 focus:outline-none focus:border-b focus:border-yellow-500"
                                            placeholder="SKU Name"
                                        />
                                        <div className="flex gap-1 items-end">
                                            <NumberInput
                                                label="Size"
                                                value={sku.unitSizeValue}
                                                onChange={(v) => onUpdate(sku.id, { unitSizeValue: v })}
                                            />
                                            <select
                                                value={sku.unitSizeUnit}
                                                onChange={(e) => onUpdate(sku.id, { unitSizeUnit: e.target.value as 'g' | 'ml' | 'oz' })}
                                                className="bg-black/25 backdrop-blur-sm border-0 rounded px-2 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white/40 hover:bg-black/30 transition-all"
                                            >
                                                <option value="g">g</option>
                                                <option value="ml">ml</option>
                                                <option value="oz">oz</option>
                                            </select>
                                        </div>
                                        <NumberInput
                                            label="Qty"
                                            value={sku.quantity}
                                            onChange={(v) => onUpdate(sku.id, { quantity: v })}
                                        />
                                        <NumberInput
                                            label="Wholesale"
                                            value={sku.wholesalePrice}
                                            onChange={(v) => onUpdate(sku.id, { wholesalePrice: v })}
                                            prefix="$"
                                        />
                                        <NumberInput
                                            label="MSRP"
                                            value={sku.msrp}
                                            onChange={(v) => onUpdate(sku.id, { msrp: v })}
                                            prefix="$"
                                        />
                                        <div className="text-right">
                                            <div className="text-xs text-neutral-400">WS Margin</div>
                                            <div className={`font-mono font-bold text-sm ${calc && calc.wholesaleMargin < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                ${calc?.wholesaleMargin.toFixed(2) ?? '—'} ({calc?.wholesaleMarginPercent.toFixed(0) ?? 0}%)
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onRemove(sku.id)}
                                        className="text-neutral-300 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                {calc && (
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                                        <div className="bg-neutral-50 rounded px-2 py-1">
                                            <div className="text-neutral-400">Potency</div>
                                            <div className={calc.isPotencySafe ? 'font-bold text-green-600' : 'font-bold text-red-500'}>{calc.potencyMg.toFixed(0)}mg</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded px-2 py-1">
                                            <div className="text-neutral-400">Formula</div>
                                            <div className="font-mono">${calc.formulaCostPerUnit.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded px-2 py-1">
                                            <div className="text-neutral-400">Packaging</div>
                                            <div className="font-mono">${calc.packagingCostPerUnit.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded px-2 py-1">
                                            <div className="text-neutral-400">Labor+Fill</div>
                                            <div className="font-mono">${(calc.laborCostPerUnit + calc.fulfillmentCostPerUnit).toFixed(2)}</div>
                                        </div>
                                        <div className="bg-neutral-50 rounded px-2 py-1">
                                            <div className="text-neutral-400">COGS</div>
                                            <div className="font-mono font-bold">${calc.fullyLoadedCost.toFixed(2)}</div>
                                        </div>
                                        <div className={`rounded px-2 py-1 ${calc.wholesaleMargin >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <div className="text-neutral-400">Margin</div>
                                            <div className={`font-mono font-bold ${calc.wholesaleMargin >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                ${calc.wholesaleMargin.toFixed(2)} ({calc.wholesaleMarginPercent.toFixed(0)}%)
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Expanded Packaging Section */}
                            {isExpanded && (
                                <div className="border-t border-neutral-100 bg-neutral-50 p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase">Packaging for {sku.name}</h4>
                                        <button
                                            onClick={() => onAddPackagingItem(sku.id, { name: "New Item", costPerUnit: 0 })}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {sku.packaging.map((pkg) => (
                                            <div key={pkg.id} className="flex items-center gap-2 bg-white p-2 rounded border border-neutral-200">
                                                <input
                                                    type="text"
                                                    value={pkg.name}
                                                    onChange={(e) => {
                                                        const newPkg = sku.packaging.map(p =>
                                                            p.id === pkg.id ? { ...p, name: e.target.value } : p
                                                        );
                                                        onUpdatePackaging(sku.id, newPkg);
                                                    }}
                                                    className="flex-1 text-sm px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:border-blue-400"
                                                    placeholder="Item name"
                                                />
                                                <div className="w-24 shrink-0">
                                                    <NumberInput
                                                        value={pkg.costPerUnit}
                                                        onChange={(v) => {
                                                            const newPkg = sku.packaging.map(p =>
                                                                p.id === pkg.id ? { ...p, costPerUnit: v } : p
                                                            );
                                                            onUpdatePackaging(sku.id, newPkg);
                                                        }}
                                                        prefix="$"
                                                        step={0.01}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => onRemovePackagingItem(sku.id, pkg.id)}
                                                    className="text-neutral-300 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-xs text-neutral-500 text-right">
                                        Packaging Total: ${sku.packaging.reduce((s, p) => s + p.costPerUnit, 0).toFixed(2)}/unit
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add New SKU Form */}
                {isAdding && (
                    <div className="border border-yellow-300 bg-yellow-50/50 rounded-lg p-3 animate-in fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                            <input
                                autoFocus
                                placeholder="SKU Name (e.g., 2oz Tin)"
                                className="bg-white border border-neutral-300 rounded px-2 py-1 text-sm"
                                value={newSku.name}
                                onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                            />
                            <div className="flex gap-1 items-end">
                                <NumberInput
                                    label="Size"
                                    value={newSku.unitSizeValue}
                                    onChange={(v) => setNewSku({ ...newSku, unitSizeValue: v })}
                                />
                                <select
                                    value={newSku.unitSizeUnit}
                                    onChange={(e) => setNewSku({ ...newSku, unitSizeUnit: e.target.value as 'g' | 'ml' | 'oz' })}
                                    className="bg-neutral-50 border border-neutral-300 rounded px-1 py-1.5 text-xs font-bold"
                                >
                                    <option value="g">g</option>
                                    <option value="ml">ml</option>
                                    <option value="oz">oz</option>
                                </select>
                            </div>
                            <NumberInput
                                label="Qty"
                                value={newSku.quantity}
                                onChange={(v) => setNewSku({ ...newSku, quantity: v })}
                            />
                            <NumberInput
                                label="Wholesale"
                                value={newSku.wholesalePrice}
                                onChange={(v) => setNewSku({ ...newSku, wholesalePrice: v })}
                                prefix="$"
                            />
                            <NumberInput
                                label="MSRP"
                                value={newSku.msrp}
                                onChange={(v) => setNewSku({ ...newSku, msrp: v })}
                                prefix="$"
                            />
                            <button
                                onClick={handleAdd}
                                className="bg-black text-white rounded px-4 py-2 text-sm font-medium hover:bg-neutral-800"
                            >
                                Add SKU
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">Default packaging will be copied. Expand to customize.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
