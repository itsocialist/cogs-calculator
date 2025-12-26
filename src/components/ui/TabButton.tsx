
import type { LucideIcon } from 'lucide-react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    highlight?: boolean;
}

export const TabButton = ({ active, onClick, icon: Icon, label, highlight }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-yellow-500 text-black shadow-md'
            : highlight
                ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
    >
        <Icon size={16} />
        <span className="hidden md:inline">{label}</span>
    </button>
);
