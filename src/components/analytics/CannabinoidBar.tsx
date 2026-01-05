/**
 * CannabinoidBar - Horizontal bar chart comparing cannabinoid levels
 * Part of Tier 3/4 analytics
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';

interface CannabinoidData {
    name: string;
    mg: number;
}

interface Props {
    cannabinoids: CannabinoidData[];
    targetPotency: number;
}

const COLORS: Record<string, string> = {
    CBD: '#10b981',  // Green
    CBG: '#8b5cf6',  // Purple
    THC: '#f59e0b',  // Amber
    CBN: '#3b82f6',  // Blue
    CBC: '#06b6d4',  // Cyan
};

export const CannabinoidBar = ({ cannabinoids, targetPotency }: Props) => {
    const data = cannabinoids
        .filter(c => c.mg > 0)
        .sort((a, b) => b.mg - a.mg)
        .map(c => ({
            ...c,
            color: COLORS[c.name] || '#6b7280',
        }));

    const totalMg = data.reduce((sum, c) => sum + c.mg, 0);
    const maxMg = Math.max(...data.map(d => d.mg), targetPotency);

    if (data.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">
                    Cannabinoid Profile
                </h3>
                <div className="text-sm text-white/40 text-center py-8">
                    No cannabinoids detected
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2">
                Cannabinoid Profile
            </h3>
            <div className="text-xs text-white/40 mb-4">
                Total: <span className="text-green-400 font-mono">{totalMg.toFixed(0)}mg</span> per unit
                <span className="text-white/30 ml-2">
                    (Target: {targetPotency}mg)
                </span>
            </div>

            <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
                    >
                        <XAxis
                            type="number"
                            hide
                            domain={[0, maxMg * 1.2]}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value) => [`${(value as number).toFixed(1)}mg`, 'Per Unit']}
                        />
                        {targetPotency > 0 && (
                            <ReferenceLine
                                x={targetPotency}
                                stroke="rgba(255,255,255,0.3)"
                                strokeDasharray="3 3"
                                label={{
                                    value: 'Target',
                                    position: 'top',
                                    fill: 'rgba(255,255,255,0.3)',
                                    fontSize: 10,
                                }}
                            />
                        )}
                        <Bar dataKey="mg" radius={[0, 6, 6, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            <LabelList
                                dataKey="mg"
                                position="right"
                                formatter={(value) => `${(value as number).toFixed(0)}mg`}
                                style={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold' }}
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
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white/50 font-medium">{item.name}</span>
                        <span className="text-white/30">
                            ({((item.mg / totalMg) * 100).toFixed(0)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
