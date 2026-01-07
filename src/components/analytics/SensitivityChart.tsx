import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Card } from '../ui/Card';
import { Activity } from 'lucide-react';

interface SensitivityChartProps {
    data: any;
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
    // 1. Calculate Total Costs by Category
    const activeCost = data.activeCost || 0;
    const inactiveCost = data.inactiveCost || 0;
    const laborCost = data.totalLaborCost || 0;

    // Packaging
    const packagingCost = (data.skuCalculations || []).reduce((sum: number, sku: any) =>
        sum + ((sku.packagingCostPerUnit || 0) * (sku.quantity || 0)), 0);

    // Logistics Split
    // Fixed Ops: Lab + Shipping
    // Variable Sales: Distro Fees
    const logistics = data.logistics || { labTestingFee: 0, shippingToDistro: 0, distroFees: [] };
    const fixedLogisticsCost = (logistics.labTestingFee || 0) + (logistics.shippingToDistro || 0);

    const distroFeesCost = (data.skuCalculations || []).reduce((sum: number, sku: any) =>
        sum + ((sku.totalDistroFeesPerUnit || 0) * (sku.quantity || 0)), 0);

    // 2. Prepare Data for +/- 10% Variance
    // Impact = Cost * 0.10
    const variancePercent = 0.10;

    // We split Logistics into "Logistics (Ops)" and "Distro Fees" for clarity
    const categories = [
        { name: 'Active Ingredients', cost: activeCost },
        { name: 'Inactive Ingredients', cost: inactiveCost },
        { name: 'Packaging', cost: packagingCost },
        { name: 'Labor', cost: laborCost },
        { name: 'Logistics (Ops)', cost: fixedLogisticsCost },
        { name: 'Distro/Sales Fees', cost: distroFeesCost },
    ];

    const chartData = categories
        .map(cat => ({
            name: cat.name,
            // If cost decreases by 10%, margin INCREASES by (cost * 0.10)
            positiveImpact: cat.cost * variancePercent,
            // If cost increases by 10%, margin DECREASES by (cost * 0.10)
            negativeImpact: -(cat.cost * variancePercent),
            totalCost: cat.cost // for tooltip
        }))
        .sort((a, b) => b.positiveImpact - a.positiveImpact); // Sort by highest impact

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-stone-900/95 border border-white/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-white font-bold mb-2">{label}</p>
                    <div className="text-xs text-white/60 mb-2">Total Category Cost: ${data.totalCost.toLocaleString()}</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white/70">Cost -10%:</span>
                            <span className="text-emerald-400 font-mono font-bold ml-auto">
                                +${data.positiveImpact.toFixed(0)} Margin
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-white/70">Cost +10%:</span>
                            <span className="text-red-400 font-mono font-bold ml-auto">
                                ${data.negativeImpact.toFixed(0)} Margin
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card
            title="Cost Sensitivity (±10%)"
            icon={Activity}
            className="h-full"
            summary="Impact on Total Margin"
        >
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        stackOffset="sign"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#ffffff40"
                            tick={{ fill: '#ffffff40', fontSize: 12 }}
                            tickFormatter={(val) => `$${Math.abs(val)}`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#ffffff80"
                            tick={{ fill: '#ffffff80', fontSize: 11 }}
                            width={100}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <ReferenceLine x={0} stroke="#ffffff40" />

                        <Bar dataKey="positiveImpact" name="Margin Gain" stackId="stack" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="negativeImpact" name="Margin Loss" stackId="stack" fill="#ef4444" radius={[4, 0, 0, 4]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-white/40 text-center">
                Reflects the $ impact on total profit margin from a 10% fluctuation in input costs.
            </div>
        </Card>
    );
};
