
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
            ? 'bg-white/30 backdrop-blur-md text-white border border-white/40 shadow-md shadow-black/20'
            : 'bg-white/10 backdrop-blur-sm text-white/70 border border-white/20 hover:text-white hover:bg-white/20'
            }`}
    >
        <Icon size={16} />
        <span className="hidden md:inline">{label}</span>
    </button>
);
