/**
 * CostBreakdownPie - Donut chart showing per-unit cost breakdown
 * Part of Tier 2 analytics
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
    material: number;
    labor: number;
    packaging: number;
    fulfillment: number;
    logistics: number;
    total: number;
}

const COLORS = {
    Material: '#3b82f6',
    Labor: '#8b5cf6',
    Packaging: '#f59e0b',
    Fulfillment: '#f97316',
    Logistics: '#ef4444',
};

export const CostBreakdownPie = ({
    material,
    labor,
    packaging,
    fulfillment,
    logistics,
    total
}: Props) => {
    const data = [
        { name: 'Material', value: material, color: COLORS.Material },
        { name: 'Labor', value: labor, color: COLORS.Labor },
        { name: 'Packaging', value: packaging, color: COLORS.Packaging },
        { name: 'Fulfillment', value: fulfillment, color: COLORS.Fulfillment },
        { name: 'Logistics', value: logistics, color: COLORS.Logistics },
    ].filter(d => d.value > 0);

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">
                Cost Breakdown
            </h3>
            <div className="text-xs text-white/40 mb-2">
                Per unit: <span className="text-green-400 font-mono">${total.toFixed(4)}</span>
            </div>

            <div className="h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value) => [
                                `$${(value as number).toFixed(4)} (${(((value as number) / total) * 100).toFixed(1)}%)`,
                                'Cost'
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-black text-white/90">
                            ${total.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/40 uppercase">
                            Total
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {data.map(item => (
                    <div key={item.name} className="flex items-center gap-1 text-[10px]">
                        <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white/50">
                            {item.name} ({((item.value / total) * 100).toFixed(0)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
