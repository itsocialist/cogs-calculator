
import type { LucideIcon } from 'lucide-react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    highlight?: boolean;
}

export const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-100 border border-amber-500/30 shadow-lg shadow-amber-900/20'
            : 'text-stone-400 hover:text-amber-200 hover:bg-stone-700/50'
            }`}
    >
        <Icon size={16} />
        <span className="hidden md:inline">{label}</span>
    </button>
);
