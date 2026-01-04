import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSpotlight } from '../../hooks/useSpotlight';

interface CardProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    className?: string;
    action?: React.ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    headerClassName?: string;
    titleClassName?: string;
    iconClassName?: string;
    /** Enable mouse-tracking spotlight effect */
    spotlight?: boolean;
}

export const Card = ({
    children,
    title,
    subtitle,
    icon: Icon,
    className = "",
    action,
    collapsible = false,
    defaultCollapsed = false,
    headerClassName = "",
    titleClassName = "text-white/90",
    iconClassName = "text-amber-300/80",
    spotlight = true
}: CardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const { containerProps, spotlightStyle, isHovering } = useSpotlight({
        size: 400,
        opacity: 0.06
    });

    return (
        // Outer glass layer - darkened for better contrast
        <div
            {...containerProps}
            className={`relative rounded-2xl print:shadow-none print:border-slate-300 print:bg-white transition-all duration-300 ${isHovering ? 'shadow-2xl shadow-black/40' : ''} ${className}`}
        >
            {/* Glass background layer - darker base for contrast */}
            <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xl rounded-2xl overflow-hidden" />

            {/* Spotlight layer - mouse tracking gradient */}
            {spotlight && (
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                    style={spotlightStyle}
                />
            )}

            {/* Glass border/edge highlight */}
            <div className={`absolute inset-0 rounded-2xl border shadow-xl shadow-black/30 transition-colors duration-300 ${isHovering ? 'border-white/25' : 'border-white/15'}`} />

            {/* Content wrapper */}
            <div className="relative z-20">
                {/* Header - thicker glass layer */}
                <div
                    className={`px-6 py-4 flex items-center justify-between print:bg-white print:border-b-2 print:border-black relative ${headerClassName} ${collapsible ? 'cursor-pointer hover:bg-white/5 transition-all' : ''}`}
                    onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
                >
                    {/* Header glass effect - darker */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-b border-white/10" />

                    <div className="relative flex items-center gap-2 z-10">
                        {Icon && <Icon size={18} className={`${iconClassName} print:text-black`} />}
                        <h3 className={`font-bold text-sm uppercase tracking-wide print:text-black ${titleClassName}`}>{title}</h3>
                        {subtitle && <span className="text-xs text-white/60 font-normal normal-case ml-2">— {subtitle}</span>}
                        {collapsible && (
                            <span className="text-white/60 ml-1 print:hidden">
                                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                            </span>
                        )}
                    </div>
                    {action && <div className="relative z-30 print:hidden" onClick={(e) => e.stopPropagation()}>{action}</div>}
                </div>

                {/* Content area - slightly lighter glass layer for subtle depth */}
                {!isCollapsed && (
                    <div className="relative p-4 md:p-6">
                        <div className="absolute inset-0 bg-white/8 backdrop-blur-sm" />
                        <div className="relative z-10">
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
