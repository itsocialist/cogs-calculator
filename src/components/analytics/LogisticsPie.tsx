import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card } from '../ui/Card';
import { Truck } from 'lucide-react';

interface LogisticsPieProps {
    data: any;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

export const LogisticsPie: React.FC<LogisticsPieProps> = ({ data }) => {
    // 1. Prepare Data
    // We want total annual/batch cost for each logistics component
    // Lab Fees (Fixed)
    const labFees = data.logistics.labTestingFee;

    // Shipping to Distro (Fixed)
    const shipping = data.logistics.shippingToDistro;

    // Distro Fees (Variable - based on total SKU Revenue)
    const distroFeesList = data.logistics.distroFees.map((fee: any) => {
        // Fee amount = Fee% * Total Revenue
        // Better: sum of sku revenue
        const exactRevenue = data.skuCalculations.reduce((sum: number, sku: any) => sum + (sku.wholesalePrice * sku.quantity), 0);

        return {
            name: fee.name,
            value: (fee.percent / 100) * exactRevenue
        };
    });

    const chartData = [
        { name: 'Lab Testing', value: labFees },
        { name: 'Shipping (Inbound)', value: shipping },
        ...distroFeesList
    ].filter(d => d.value > 0);

    const totalLogistics = chartData.reduce((sum, d) => sum + d.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percent = ((data.value / totalLogistics) * 100).toFixed(1);
            return (
                <div className="bg-stone-900/95 border border-white/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-white font-bold mb-1">{data.name}</p>
                    <div className="text-white font-mono font-bold">
                        ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                        {percent}% of Logistics
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card title="Logistics & Distro Breakdown" icon={Truck} className="h-full">
            <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-white/60 text-xs ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="text-center mt-2">
                <div className="text-xs text-white/40">Total Logistics Cost</div>
                <div className="text-xl font-mono font-bold text-white">
                    ${totalLogistics.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
            </div>
        </Card>
    );
};
