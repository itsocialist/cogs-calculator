import React from 'react';
import { useSpotlight } from '../../hooks/useSpotlight';

interface SpotlightCardProps {
    children: React.ReactNode;
    className?: string;
    /** Spotlight gradient size */
    size?: number;
    /** Spotlight opacity (0-1) */
    opacity?: number;
}

/**
 * A simple card wrapper with mouse-tracking spotlight effect.
 * Use for summary boxes, KPI cards, and small interactive containers.
 */
export const SpotlightCard = ({
    children,
    className = "",
    size = 200,
    opacity = 0.12
}: SpotlightCardProps) => {
    const { containerProps, spotlightStyle, isHovering } = useSpotlight({
        size,
        opacity
    });

    return (
        <div
            {...containerProps}
            className={`relative overflow-hidden transition-all duration-300 ${isHovering ? 'scale-[1.02] shadow-lg shadow-black/30' : ''} ${className}`}
        >
            {/* Spotlight layer */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-10"
                style={spotlightStyle}
            />

            {/* Border highlight on hover */}
            <div
                className={`absolute inset-0 rounded-lg border transition-colors duration-300 pointer-events-none ${isHovering ? 'border-white/30' : 'border-transparent'}`}
            />

            {/* Content */}
            <div className="relative z-20">
                {children}
            </div>
        </div>
    );
};
