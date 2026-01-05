/**
 * IngredientCostPie - Pie chart showing cost or weight by ingredient
 * Part of Tier 2/3 analytics
 */

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface IngredientData {
    name: string;
    cost: number;
    weight: number;
    type: 'active' | 'inactive';
}

interface Props {
    ingredients: IngredientData[];
    title: string;
    dataKey: 'cost' | 'weight';
}

// More varied color palette
const COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
];

// Custom label for callouts
const renderLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
    value?: number;
}, dataKey: string) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0, name = '', value = 0 } = props;

    if (percent < 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const formattedValue = dataKey === 'cost' ? `$${value.toFixed(2)}` : `${value.toFixed(1)}g`;

    return (
        <text
            x={x}
            y={y}
            fill="rgba(255,255,255,0.8)"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={9}
        >
            {name.length > 10 ? name.slice(0, 8) + '..' : name}
            <tspan x={x} dy={11} fill="rgba(255,255,255,0.5)" fontSize={8}>
                {formattedValue} ({(percent * 100).toFixed(0)}%)
            </tspan>
        </text>
    );
};

export const IngredientCostPie = ({ ingredients, title, dataKey }: Props) => {
    const [hovered, setHovered] = useState<number | null>(null);

    // Take top 5 and group rest as "Other"
    const topN = 5;
    const sorted = [...ingredients].sort((a, b) => b[dataKey] - a[dataKey]);
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);

    const otherValue = rest.reduce((sum, i) => sum + i[dataKey], 0);
    const total = ingredients.reduce((sum, i) => sum + i[dataKey], 0);

    const data = [
        ...top.map((ing, idx) => ({
            name: ing.name,
            value: ing[dataKey],
            color: COLORS[idx % COLORS.length],
        })),
        ...(otherValue > 0 ? [{
            name: 'Other',
            value: otherValue,
            color: '#6b7280',
        }] : []),
    ];

    const formatValue = (value: number) => {
        if (dataKey === 'cost') return `$${value.toFixed(4)}`;
        return `${value.toFixed(2)}g`;
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">
                {title}
            </h3>
            <div className="text-xs text-white/40 mb-2">
                Total: <span className="text-white/60 font-mono">
                    {dataKey === 'cost' ? `$${total.toFixed(4)}` : `${total.toFixed(2)}g`}
                </span>
            </div>

            <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                            label={(props) => renderLabel(props, dataKey)}
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
                                `${formatValue(value as number)} (${(((value as number) / total) * 100).toFixed(1)}%)`,
                                dataKey === 'cost' ? 'Cost' : 'Weight'
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {data.slice(0, 4).map((item, idx) => (
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
                        <span className="text-white/50 truncate max-w-[70px]" title={item.name}>
                            {item.name}
                        </span>
                    </div>
                ))}
                {data.length > 4 && (
                    <span className="text-[10px] text-white/30">
                        +{data.length - 4} more
                    </span>
                )}
            </div>
        </div>
    );
};
