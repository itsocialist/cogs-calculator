/**
 * IngredientCostPie - Pie chart showing cost or weight by ingredient
 * Part of Tier 2/3 analytics
 */

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

// Gradient colors from dark to light
const COLORS = [
    '#10b981', // Green - most expensive
    '#22c55e',
    '#4ade80',
    '#86efac',
    '#bbf7d0',
    '#d1fae5', // Light green - least
];

export const IngredientCostPie = ({ ingredients, title, dataKey }: Props) => {
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

            <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            paddingAngle={1}
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
                                `${formatValue(value as number)} (${(((value as number) / total) * 100).toFixed(1)}%)`,
                                dataKey === 'cost' ? 'Cost' : 'Weight'
                            ]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - show top 3 + count of others */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {data.slice(0, 3).map(item => (
                    <div key={item.name} className="flex items-center gap-1 text-[10px]">
                        <div
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white/50 truncate max-w-[80px]" title={item.name}>
                            {item.name}
                        </span>
                    </div>
                ))}
                {data.length > 3 && (
                    <span className="text-[10px] text-white/30">
                        +{data.length - 3} more
                    </span>
                )}
            </div>
        </div>
    );
};
