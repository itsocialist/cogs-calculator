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
    headerClassName = "bg-stone-800/60 border-b border-amber-900/20",
    titleClassName = "text-amber-100/90",
    iconClassName = "text-amber-400/70"
}: CardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`bg-stone-900/50 backdrop-blur-sm rounded-xl border border-stone-700/50 shadow-lg shadow-black/20 overflow-hidden print:shadow-none print:border-slate-300 print:bg-white ${className}`}>
            <div
                className={`px-6 py-4 flex items-center justify-between print:bg-white print:border-b-2 print:border-black shadow-sm relative z-10 ${headerClassName} ${collapsible ? 'cursor-pointer hover:bg-stone-800/80 transition-all' : ''}`}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className={`${iconClassName} print:text-black`} />}
                    <h3 className={`font-medium text-sm uppercase tracking-wider print:text-black ${titleClassName}`}>{title}</h3>
                    {subtitle && <span className="text-xs text-amber-200/40 font-normal normal-case ml-2">— {subtitle}</span>}
                    {collapsible && (
                        <span className="text-amber-300/40 ml-1 print:hidden">
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </span>
                    )}
                </div>
                {action && <div className="print:hidden" onClick={(e) => e.stopPropagation()}>{action}</div>}
            </div>
            {!isCollapsed && (
                <div className="p-4 md:p-6 bg-stone-900/30">
                    {children}
                </div>
            )}
        </div>
    );
};
