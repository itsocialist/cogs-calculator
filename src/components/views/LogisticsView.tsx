import { useState } from 'react';
import { Truck, DollarSign, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { LogisticsConfig, PricingConfig, DistroFee } from '../../lib/types';

interface Props {
    logistics: LogisticsConfig;
    setLogistics: (config: LogisticsConfig) => void;
    pricing: PricingConfig;
    setPricing: (config: PricingConfig) => void;
    fullyLoadedCost: number;
    manufCostPerUnit: number;
    totalDistroFeesPerUnit: number;
    labTestPerUnit: number;
    shippingPerUnit: number;
    addDistroFee: (fee: Omit<DistroFee, 'id'>) => void;
    removeDistroFee: (id: number) => void;
    updateDistroFee: (id: number, updates: Partial<DistroFee>) => void;
}

export const LogisticsView = ({
    logistics, setLogistics,
    pricing, setPricing,
    fullyLoadedCost, manufCostPerUnit, totalDistroFeesPerUnit, labTestPerUnit, shippingPerUnit,
    addDistroFee, removeDistroFee, updateDistroFee
}: Props) => {
    const [isAddingFee, setIsAddingFee] = useState(false);
    const [newFee, setNewFee] = useState({ name: '', percent: 0 });

    const updateLogistics = (field: 'labTestingFee' | 'shippingToDistro', value: number) => {
        setLogistics({ ...logistics, [field]: value });
    };
    const updatePricing = (field: keyof PricingConfig, value: number) => {
        setPricing({ ...pricing, [field]: value });
    };

    const handleAddFee = () => {
        if (!newFee.name) return;
        addDistroFee(newFee);
        setNewFee({ name: '', percent: 0 });
        setIsAddingFee(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            {/* Logistics Costs */}
            <div className="space-y-6">
                <Card title="Logistics & Distribution" icon={Truck}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <NumberInput label="Lab Testing (Per Batch)" value={logistics.labTestingFee} onChange={(v) => updateLogistics('labTestingFee', v)} prefix="$" />
                            <NumberInput label="Shipping to Distro" value={logistics.shippingToDistro} onChange={(v) => updateLogistics('shippingToDistro', v)} prefix="$" />
                        </div>

                        {/* Distribution Fees */}
                        <div className="pt-4 border-t border-neutral-100">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-neutral-400 uppercase">Distribution Fees</label>
                                <button
                                    onClick={() => setIsAddingFee(!isAddingFee)}
                                    className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded hover:bg-neutral-200 flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Fee
                                </button>
                            </div>

                            <div className="space-y-2">
                                {logistics.distroFees.map((fee) => (
                                    <div key={fee.id} className="flex items-center gap-2 bg-neutral-50 p-2 rounded">
                                        <input
                                            type="text"
                                            value={fee.name}
                                            onChange={(e) => updateDistroFee(fee.id, { name: e.target.value })}
                                            className="flex-1 text-sm bg-transparent focus:outline-none font-medium"
                                        />
                                        <NumberInput
                                            value={fee.percent}
                                            onChange={(v) => updateDistroFee(fee.id, { percent: v })}
                                            suffix="%"
                                            step={0.5}
                                        />
                                        <button
                                            onClick={() => removeDistroFee(fee.id)}
                                            className="text-neutral-300 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {isAddingFee && (
                                    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 p-2 rounded animate-in fade-in">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Fee name"
                                            value={newFee.name}
                                            onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                                            className="flex-1 text-sm bg-white border border-neutral-300 rounded px-2 py-1"
                                        />
                                        <NumberInput
                                            value={newFee.percent}
                                            onChange={(v) => setNewFee({ ...newFee, percent: v })}
                                            suffix="%"
                                        />
                                        <button
                                            onClick={handleAddFee}
                                            className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 text-xs text-neutral-400 text-right">
                                Total: {logistics.distroFees.reduce((sum, f) => sum + f.percent, 0).toFixed(1)}% of wholesale
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Pricing Strategy" icon={DollarSign}>
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Wholesale Price" value={pricing.wholesale} onChange={(v) => updatePricing('wholesale', v)} prefix="$" />
                        <NumberInput label="MSRP" value={pricing.msrp} onChange={(v) => updatePricing('msrp', v)} prefix="$" />
                    </div>
                </Card>
            </div>

            {/* Cost Stack Visualization */}
            <div className="space-y-6">
                <Card title="Unit Cost Breakdown">
                    <div className="space-y-4">
                        {/* Mfg */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Manufacturing (COGS)</span>
                            </div>
                            <span className="font-mono">${manufCostPerUnit.toFixed(2)}</span>
                        </div>

                        {/* Distro Fees */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span>Distribution Fees ({logistics.distroFees.length})</span>
                            </div>
                            <span className="font-mono">${totalDistroFeesPerUnit.toFixed(2)}</span>
                        </div>

                        {/* Logistics */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
                                <span>Testing & Shipping</span>
                            </div>
                            <span className="font-mono">${(labTestPerUnit + shippingPerUnit).toFixed(2)}</span>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center font-bold">
                            <span>LANDED COST</span>
                            <span>${fullyLoadedCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 print:hidden">
                        <div className="flex h-4 w-full rounded-full overflow-hidden">
                            <div className="bg-blue-500" style={{ width: `${(manufCostPerUnit / fullyLoadedCost) * 100}%` }}></div>
                            <div className="bg-orange-500" style={{ width: `${(totalDistroFeesPerUnit / fullyLoadedCost) * 100}%` }}></div>
                            <div className="bg-neutral-400" style={{ width: `${((labTestPerUnit + shippingPerUnit) / fullyLoadedCost) * 100}%` }}></div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
