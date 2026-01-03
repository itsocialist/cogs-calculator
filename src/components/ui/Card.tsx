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
    headerClassName = "bg-slate-100 border-b border-slate-200",
    titleClassName = "text-slate-800",
    iconClassName = "text-slate-600"
}: CardProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
        <div className={`bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-slate-300 ${className}`}>
            <div
                className={`px-6 py-4 flex items-center justify-between print:bg-white print:border-b-2 print:border-black shadow-sm relative z-10 ${headerClassName} ${collapsible ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} className={`${iconClassName} print:text-black`} />}
                    <h3 className={`font-bold text-sm uppercase tracking-wide print:text-black ${titleClassName}`}>{title}</h3>
                    {subtitle && <span className="text-xs text-slate-500 font-normal normal-case ml-2">— {subtitle}</span>}
                    {collapsible && (
                        <span className="text-slate-400 ml-1 print:hidden">
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </span>
                    )}
                </div>
                {action && <div className="print:hidden" onClick={(e) => e.stopPropagation()}>{action}</div>}
            </div>
            {!isCollapsed && (
                <div className="p-4 md:p-6">
                    {children}
                </div>
            )}
        </div>
    );
};
