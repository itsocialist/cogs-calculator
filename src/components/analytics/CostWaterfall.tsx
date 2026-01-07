/**
 * CostWaterfall - Horizontal bar chart showing cost buildup
 * Part of Tier 1 (Hero) analytics
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card } from '../ui/Card';
import { Layers } from 'lucide-react';

interface Props {
    material: number;
    labor: number;
    packaging: number;
    fulfillment: number;
    logistics: number;
}

const COLORS = {
    Material: '#3b82f6',      // Blue
    Labor: '#8b5cf6',         // Purple
    Packaging: '#f59e0b',     // Amber
    Fulfillment: '#f97316',   // Orange
    Logistics: '#ef4444',     // Red
};

export const CostWaterfall = ({ material, labor, packaging, fulfillment, logistics }: Props) => {
    const total = material + labor + packaging + fulfillment + logistics;

    const data = [
        { name: 'Material', value: material, color: COLORS.Material },
        { name: 'Labor', value: labor, color: COLORS.Labor },
        { name: 'Packaging', value: packaging, color: COLORS.Packaging },
        { name: 'Fulfillment', value: fulfillment, color: COLORS.Fulfillment },
        { name: 'Logistics', value: logistics, color: COLORS.Logistics },
    ];

    return (
        <Card
            title="Cost Buildup"
            icon={Layers}
            summary={`$${total.toFixed(2)} / unit`}
            className="h-full"
        >
            <div className="h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 0, right: 60, left: 5, bottom: 0 }}
                    >
                        <XAxis
                            type="number"
                            hide
                            domain={[0, Math.max(...data.map(d => d.value)) * 1.3]}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                            width={80}
                        />
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
                            formatter={(value) => [`$${(value as number).toFixed(4)}`, 'Cost']}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="right"
                                formatter={(value) => `$${(value as number).toFixed(2)}`}
                                style={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {data.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white/50">{item.name}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};
