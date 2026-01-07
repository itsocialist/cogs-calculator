import { Card } from '../ui/Card';
import { Gauge } from 'lucide-react';

interface Props {
    wholesaleMargin: number;
    retailMargin: number;
    wholesalePrice: number;
    msrp: number;
    fullyLoadedCost: number;
}

export const MarginGauge = ({
    wholesaleMargin,
    retailMargin,
    wholesalePrice,
    msrp,
    fullyLoadedCost
}: Props) => {
    // Determine zone colors
    const getZoneColor = (margin: number) => {
        if (margin >= 40) return 'text-green-400';
        if (margin >= 20) return 'text-amber-400';
        return 'text-red-400';
    };

    const getZoneBg = (margin: number) => {
        if (margin >= 40) return 'bg-green-500/20';
        if (margin >= 20) return 'bg-amber-500/20';
        return 'bg-red-500/20';
    };

    const wholesaleDollars = wholesalePrice - fullyLoadedCost;
    const retailDollars = msrp - fullyLoadedCost;

    return (
        <Card
            title="Business Viability"
            icon={Gauge}
            summary={`MSRP: $${msrp.toFixed(2)}`}
            className="h-full"
        >
            <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Wholesale Margin */}
                <div className={`rounded-xl p-4 ${getZoneBg(wholesaleMargin)}`}>
                    <div className="text-xs text-white/50 uppercase mb-1">Wholesale</div>
                    <div className={`text-3xl font-black ${getZoneColor(wholesaleMargin)}`}>
                        {wholesaleMargin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                        ${wholesaleDollars.toFixed(2)} / unit
                    </div>
                    <div className="mt-2 text-xs text-white/30">
                        ${wholesalePrice.toFixed(2)} - ${fullyLoadedCost.toFixed(2)}
                    </div>
                </div>

                {/* Retail Margin */}
                <div className={`rounded-xl p-4 ${getZoneBg(retailMargin)}`}>
                    <div className="text-xs text-white/50 uppercase mb-1">Retail (MSRP)</div>
                    <div className={`text-3xl font-black ${getZoneColor(retailMargin)}`}>
                        {retailMargin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                        ${retailDollars.toFixed(2)} / unit
                    </div>
                    <div className="mt-2 text-xs text-white/30">
                        ${msrp.toFixed(2)} - ${fullyLoadedCost.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-white/40">40%+</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-white/40">20-40%</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-white/40">&lt;20%</span>
                </div>
            </div>
        </Card>
    );
};
