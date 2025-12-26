import { Truck, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { LogisticsConfig, PricingConfig } from '../../lib/types';

interface Props {
    logistics: LogisticsConfig;
    setLogistics: (config: LogisticsConfig) => void;
    pricing: PricingConfig;
    setPricing: (config: PricingConfig) => void;
    fullyLoadedCost: number;
    manufCostPerUnit: number;
    distroFeePerUnit: number;
    commissionsPerUnit: number;
    labTestPerUnit: number;
    shippingPerUnit: number;
}

export const LogisticsView = ({
    logistics, setLogistics,
    pricing, setPricing,
    fullyLoadedCost, manufCostPerUnit, distroFeePerUnit, commissionsPerUnit, labTestPerUnit, shippingPerUnit
}: Props) => {
    const updateLogistics = (field: keyof LogisticsConfig, value: number) => {
        setLogistics({ ...logistics, [field]: value });
    };
    const updatePricing = (field: keyof PricingConfig, value: number) => {
        setPricing({ ...pricing, [field]: value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            {/* Logistics Costs */}
            <div className="space-y-6">
                <Card title="Logistics & Distribution" icon={Truck}>
                    <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Lab Testing (Per Batch)" value={logistics.labTestingFee} onChange={(v) => updateLogistics('labTestingFee', v)} prefix="$" />
                        <NumberInput label="Shipping to Distro" value={logistics.shippingToDistro} onChange={(v) => updateLogistics('shippingToDistro', v)} prefix="$" />
                        <NumberInput label="Distributor Fee (%)" value={logistics.distributorFeePercent} onChange={(v) => updateLogistics('distributorFeePercent', v)} suffix="%" />
                        <NumberInput label="Sales Commission (%)" value={logistics.salesCommissionPercent} onChange={(v) => updateLogistics('salesCommissionPercent', v)} suffix="%" />
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

                        {/* Distro */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span>Distributor Fees</span>
                            </div>
                            <span className="font-mono">${distroFeePerUnit.toFixed(2)}</span>
                        </div>

                        {/* Commission */}
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span>Sales Commissions</span>
                            </div>
                            <span className="font-mono">${commissionsPerUnit.toFixed(2)}</span>
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
                            <div className="bg-orange-500" style={{ width: `${(distroFeePerUnit / fullyLoadedCost) * 100}%` }}></div>
                            <div className="bg-yellow-500" style={{ width: `${(commissionsPerUnit / fullyLoadedCost) * 100}%` }}></div>
                            <div className="bg-neutral-400" style={{ width: `${((labTestPerUnit + shippingPerUnit) / fullyLoadedCost) * 100}%` }}></div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
