import React from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ReferenceDot
} from 'recharts';
import { Card } from '../ui/Card';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface BreakEvenChartProps {
    data: any; // Type strictly if possible, but 'any' allows quick iteration with the complex hook return
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ data }) => {
    // 1. Identify "Fixed" vs "Variable" costs for this visualization
    // Fixed (Batch-level sunk costs):
    // - Formula Cost
    // - Labor Cost
    // - Lab Testing
    // - Shipping to Distro
    const fixedCost =
        data.totalFormulaCost +
        data.totalLaborCost +
        data.logistics.labTestingFee +
        data.logistics.shippingToDistro;

    // Variable (Per-unit costs):
    // - Packaging (avg)
    // - Fulfillment
    // - Distro Fees (avg)
    const totalUnits = data.totalUnitsAcrossSkus || 0;

    // Calculate averages if multiple SKUs exist
    const avgPackagingCost = totalUnits > 0
        ? data.skuCalculations.reduce((sum: number, sku: any) => sum + ((sku.packagingCostPerUnit || 0) * (sku.quantity || 0)), 0) / totalUnits
        : 0;

    const avgDistroFees = totalUnits > 0
        ? data.skuCalculations.reduce((sum: number, sku: any) => sum + ((sku.totalDistroFeesPerUnit || 0) * (sku.quantity || 0)), 0) / totalUnits
        : 0;

    const variableCostPerUnit = (avgPackagingCost || 0) + (data.batchConfig.fulfillmentCost || 0) + (avgDistroFees || 0);

    // Average Revenue per unit
    const avgRevenuePerUnit = totalUnits > 0
        ? data.skuCalculations.reduce((sum: number, sku: any) => sum + ((sku.wholesalePrice || 0) * (sku.quantity || 0)), 0) / totalUnits
        : 0;

    // Contribution Margin = Revenue - Variable Cost
    const contributionMargin = (avgRevenuePerUnit || 0) - (variableCostPerUnit || 0);

    // Break Even Point (Units) = Fixed Costs / Contribution Margin
    // Prevent division by zero or negative infinity issues
    const breakEvenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
    const breakEvenPercent = totalUnits > 0 ? (breakEvenUnits / totalUnits) * 100 : 0;

    // Generate Chart Data (0% to 120% of batch)
    const chartData = [];
    const steps = 10;
    const maxUnits = totalUnits > 0 ? Math.ceil(totalUnits * 1.1) : 100; // Go slightly past 100% or default to 100

    for (let i = 0; i <= steps; i++) {
        const units = (i / steps) * maxUnits;
        const revenue = units * (avgRevenuePerUnit || 0);
        const totalCost = (fixedCost || 0) + (units * (variableCostPerUnit || 0));
        const profit = revenue - totalCost;

        chartData.push({
            units: Math.round(units),
            revenue,
            totalCost,
            profit,
            fixedCost: fixedCost || 0
        });
    }

    // Find the closest data point to break-even for the reference dot
    const breakEvenDataPoint = {
        units: Math.round(breakEvenUnits),
        revenue: breakEvenUnits * (avgRevenuePerUnit || 0),
        totalCost: (fixedCost || 0) + (breakEvenUnits * (variableCostPerUnit || 0))
    };

    const isProfitable = totalUnits >= breakEvenUnits && contributionMargin > 0;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-stone-900/95 border border-white/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-white font-bold mb-2">{label} Units Sold</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-white/70">{entry.name}:</span>
                            <span className="text-white font-mono font-bold ml-auto">
                                ${entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-white/10 flex justify-between gap-4">
                        <span className="text-white/60 text-xs">Net Profit:</span>
                        <span className={`font-mono text-sm font-bold ${payload[0].payload.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${payload[0].payload.profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card
            title="Batch Break-Even Analysis"
            icon={TrendingUp}
            className="h-full"
            summary={isProfitable
                ? `Break-even at ${Math.ceil(breakEvenUnits)} units (${breakEvenPercent.toFixed(1)}%)`
                : "Batch not profitable at current volume"
            }
        >
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lossArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="units"
                            stroke="#ffffff40"
                            tick={{ fill: '#ffffff40', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#ffffff40"
                            tick={{ fill: '#ffffff40', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        <Area
                            type="monotone"
                            dataKey="profit"
                            fill={isProfitable ? "url(#profitArea)" : "url(#lossArea)"}
                            stroke="none"
                            fillOpacity={1}
                        />

                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="totalCost"
                            name="Total Cost"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={false}
                        />

                        {/* Fixed Cost Line (Dashed) */}
                        <Line
                            type="monotone"
                            dataKey="fixedCost"
                            name="Fixed Cost"
                            stroke="#ffffff40"
                            strokeDasharray="5 5"
                            strokeWidth={1}
                            dot={false}
                        />

                        {isProfitable && breakEvenUnits <= maxUnits && (
                            <ReferenceDot
                                x={breakEvenDataPoint.units}
                                y={breakEvenDataPoint.revenue}
                                r={6}
                                fill="#fbbf24"
                                stroke="#fff"
                                strokeWidth={2}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-white/50 mb-1">Fixed "Sunk" Costs</div>
                    <div className="text-lg font-mono font-bold text-white">
                        ${fixedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-xs text-white/50 mb-1">Contribution Margin</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">
                        ${contributionMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-xs text-white/40 font-normal">/unit</span>
                    </div>
                </div>
            </div>

            {!isProfitable && (
                <div className="mt-4 flex items-center gap-3 text-amber-400 text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    <AlertCircle size={18} />
                    <span>Price is too low to cover variable costs per unit.</span>
                </div>
            )}
        </Card>
    );
};
