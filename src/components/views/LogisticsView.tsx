import { useState } from 'react';
import { Truck, Plus, Trash2 } from 'lucide-react';
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
    fullyLoadedCost, manufCostPerUnit, totalDistroFeesPerUnit, labTestPerUnit, shippingPerUnit,
    addDistroFee, removeDistroFee, updateDistroFee
}: Props) => {
    const [isAddingFee, setIsAddingFee] = useState(false);
    const [newFee, setNewFee] = useState({ name: '', percent: 0 });

    const updateLogistics = (field: 'labTestingFee' | 'shippingToDistro', value: number) => {
        setLogistics({ ...logistics, [field]: value });
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
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-white/50 uppercase">Distribution Fees</label>
                                <button
                                    onClick={() => setIsAddingFee(!isAddingFee)}
                                    className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded hover:bg-white/20 flex items-center gap-1 transition-colors"
                                >
                                    <Plus size={12} /> Add Fee
                                </button>
                            </div>

                            <div className="space-y-2">
                                {logistics.distroFees.map((fee) => (
                                    <div key={fee.id} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                                        <input
                                            type="text"
                                            value={fee.name}
                                            onChange={(e) => updateDistroFee(fee.id, { name: e.target.value })}
                                            className="flex-1 text-sm bg-transparent focus:outline-none font-medium text-white/90"
                                        />
                                        <NumberInput
                                            value={fee.percent}
                                            onChange={(v) => updateDistroFee(fee.id, { percent: v })}
                                            suffix="%"
                                            step={0.5}
                                        />
                                        <button
                                            onClick={() => removeDistroFee(fee.id)}
                                            className="text-white/30 hover:text-red-400 p-1 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {isAddingFee && (
                                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-2 rounded animate-in fade-in">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Fee name"
                                            value={newFee.name}
                                            onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                                            className="flex-1 text-sm bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50"
                                        />
                                        <NumberInput
                                            value={newFee.percent}
                                            onChange={(v) => setNewFee({ ...newFee, percent: v })}
                                            suffix="%"
                                        />
                                        <button
                                            onClick={handleAddFee}
                                            className="text-xs bg-white/20 text-white px-3 py-1.5 rounded hover:bg-white/30 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 text-xs text-white/40 text-right">
                                Total: {logistics.distroFees.reduce((sum, f) => sum + f.percent, 0).toFixed(1)}% of wholesale
                            </div>
                        </div>
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
                                <span className="text-white/80">Manufacturing (COGS)</span>
                            </div>
                            <span className="font-mono text-white/90">${manufCostPerUnit.toFixed(2)}</span>
                        </div>

                        {/* Distro Fees */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-white/80">Distribution Fees ({logistics.distroFees.length})</span>
                            </div>
                            <span className="font-mono text-white/90">${totalDistroFeesPerUnit.toFixed(2)}</span>
                        </div>

                        {/* Logistics */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
                                <span className="text-white/80">Testing & Shipping</span>
                            </div>
                            <span className="font-mono text-white/90">${(labTestPerUnit + shippingPerUnit).toFixed(2)}</span>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center font-bold">
                            <span className="text-white/90">LANDED COST</span>
                            <span className="text-white">${fullyLoadedCost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6 print:hidden">
                        <div className="flex h-4 w-full rounded-full overflow-hidden bg-white/10">
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
