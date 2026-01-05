/**
 * CostBreakdownPie - Donut chart showing per-unit cost breakdown
 * Part of Tier 2 analytics
 */

import { useState } from 'react';
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

// Custom label for callouts
const renderLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
    value?: number;
}) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0, name = '', value = 0 } = props;

    if (percent < 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="rgba(255,255,255,0.8)"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={10}
        >
            {name}
            <tspan x={x} dy={12} fill="rgba(255,255,255,0.5)" fontSize={9}>
                ${value.toFixed(2)} ({(percent * 100).toFixed(0)}%)
            </tspan>
        </text>
    );
};

export const CostBreakdownPie = ({
    material,
    labor,
    packaging,
    fulfillment,
    logistics,
    total
}: Props) => {
    const [hovered, setHovered] = useState<number | null>(null);

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

            <div className="h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            label={renderLabel}
                            labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                            onMouseEnter={(_, index) => setHovered(index)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="none"
                                    opacity={hovered === null || hovered === index ? 0.75 : 0.35}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: '#fff',
                            }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [
                                `$${(value as number).toFixed(4)} (${(((value as number) / total) * 100).toFixed(1)}%)`,
                                'Cost'
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
                {data.map((item, idx) => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-1 text-[10px] cursor-pointer transition-opacity ${hovered !== null && hovered !== idx ? 'opacity-40' : ''}`}
                        onMouseEnter={() => setHovered(idx)}
                        onMouseLeave={() => setHovered(null)}
                    >
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
