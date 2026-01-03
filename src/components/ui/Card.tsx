import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
    headerClassName = "backdrop-blur-md bg-white/60 border-b border-amber-200/30",
    titleClassName = "text-stone-700",
    iconClassName = "text-amber-600/70"
}: CardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 shadow-sm shadow-amber-900/5 overflow-hidden print:shadow-none print:border-slate-300 ${className}`}>
            <div
                className={`px-6 py-4 flex items-center justify-between print:bg-white print:border-b-2 print:border-black shadow-sm relative z-10 ${headerClassName} ${collapsible ? 'cursor-pointer hover:bg-white/80 transition-all' : ''}`}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className={`${iconClassName} print:text-black`} />}
                    <h3 className={`font-bold text-sm uppercase tracking-wide print:text-black ${titleClassName}`}>{title}</h3>
                    {subtitle && <span className="text-xs text-stone-400 font-normal normal-case ml-2">— {subtitle}</span>}
                    {collapsible && (
                        <span className="text-stone-400 ml-1 print:hidden">
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </span>
                    )}
                </div>
                {action && <div className="print:hidden" onClick={(e) => e.stopPropagation()}>{action}</div>}
            </div>
            {!isCollapsed && (
                <div className="p-4 md:p-6 bg-white/95">
                    {children}
                </div>
            )}
        </div>
    );
};
