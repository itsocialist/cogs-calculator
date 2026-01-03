
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
            ? 'bg-white/85 text-stone-800 shadow-md'
            : 'text-stone-300 hover:text-white hover:bg-stone-600/50'
            }`}
    >
        <Icon size={16} />
        <span className="hidden md:inline">{label}</span>
    </button>
);
