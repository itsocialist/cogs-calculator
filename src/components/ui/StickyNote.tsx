import { useState, useEffect, useRef } from 'react';
import { GripHorizontal, Trash2, Pin } from 'lucide-react';

export interface StickyNoteData {
    id: string;
    text: string;
    color: 'amber' | 'emerald' | 'blue' | 'purple' | 'neutral';
    position: { x: number; y: number };
    isPinned: boolean;
    createdAt: number;
}

interface Props {
    note: StickyNoteData;
    onUpdate: (note: StickyNoteData) => void;
    onDelete: (id: string) => void;
}

// Translucent glass colors with accent tints
const COLORS = {
    amber: 'bg-stone-900/80 border-amber-500/40',
    emerald: 'bg-stone-900/80 border-emerald-500/40',
    blue: 'bg-stone-900/80 border-blue-500/40',
    purple: 'bg-stone-900/80 border-purple-500/40',
    neutral: 'bg-stone-900/80 border-white/20',
    // Fallback mappings for old color names
    yellow: 'bg-stone-900/80 border-amber-500/40',
    slate: 'bg-stone-900/80 border-white/20',
    teal: 'bg-stone-900/80 border-emerald-500/40',
};

const HEADER_COLORS = {
    amber: 'bg-amber-500/20 border-b border-amber-500/30',
    emerald: 'bg-emerald-500/20 border-b border-emerald-500/30',
    blue: 'bg-blue-500/20 border-b border-blue-500/30',
    purple: 'bg-purple-500/20 border-b border-purple-500/30',
    neutral: 'bg-white/10 border-b border-white/15',
    // Fallback mappings for old color names
    yellow: 'bg-amber-500/20 border-b border-amber-500/30',
    slate: 'bg-white/10 border-b border-white/15',
    teal: 'bg-emerald-500/20 border-b border-emerald-500/30',
};

const ACCENT_COLORS = {
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    neutral: 'text-white/70',
    yellow: 'text-amber-400',
    slate: 'text-white/70',
    teal: 'text-emerald-400',
};

export const StickyNote = ({ note, onUpdate, onDelete }: Props) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(note.position);
    const [useHandwriting, setUseHandwriting] = useState(true);
    const dragStart = useRef({ x: 0, y: 0 });

    // Safe color getter - fallback to amber for old/invalid colors
    const safeColor = (note.color in COLORS) ? note.color : 'amber';
    const colorClass = COLORS[safeColor as keyof typeof COLORS];
    const headerColorClass = HEADER_COLORS[safeColor as keyof typeof HEADER_COLORS];
    const accentColor = ACCENT_COLORS[safeColor as keyof typeof ACCENT_COLORS];

    // Sync position with prop when note changes (e.g., from localStorage refresh)
    useEffect(() => {
        if (!isDragging) {
            setPosition(note.position);
        }
    }, [note.position, isDragging]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newPos = {
                x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragStart.current.x)),
                y: Math.max(0, Math.min(window.innerHeight - 150, e.clientY - dragStart.current.y))
            };
            setPosition(newPos);
        };
        const handleMouseUp = () => {
            if (isDragging) {
                onUpdate({ ...note, position });
            }
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position, note, onUpdate]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...note, text: e.target.value });
    };

    const cycleColor = () => {
        const colors: StickyNoteData['color'][] = ['amber', 'emerald', 'blue', 'purple', 'neutral'];
        const colorMapping: Record<string, StickyNoteData['color']> = {
            yellow: 'amber', slate: 'neutral', teal: 'emerald',
            amber: 'amber', emerald: 'emerald', blue: 'blue', purple: 'purple', neutral: 'neutral'
        };
        const mappedColor = colorMapping[note.color] || 'amber';
        const currentIndex = colors.indexOf(mappedColor);
        const nextColor = colors[(currentIndex + 1) % colors.length];
        onUpdate({ ...note, color: nextColor });
    };

    return (
        <div
            className={`fixed w-52 rounded-xl border-2 shadow-xl backdrop-blur-xl flex flex-col overflow-hidden ${colorClass} ${isDragging ? 'shadow-2xl scale-105' : ''} transition-all ${note.isPinned ? 'ring-2 ring-amber-400/50 ring-offset-2 ring-offset-stone-900' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                zIndex: note.isPinned ? 95 : 90,
            }}
        >
            {/* Header */}
            <div
                className={`${headerColorClass} p-2 flex items-center justify-between cursor-move select-none`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-1.5">
                    <GripHorizontal size={14} className="text-white/50" />
                    <button
                        onClick={cycleColor}
                        className="p-1 hover:bg-white/10 rounded text-xs transition-colors"
                        title="Change color"
                    >
                        <div className={`w-3 h-3 rounded-full ${accentColor} bg-current`} />
                    </button>
                    <button
                        onClick={() => setUseHandwriting(!useHandwriting)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${useHandwriting ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'}`}
                        title={useHandwriting ? 'Switch to typed' : 'Switch to handwritten'}
                        style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : 'inherit' }}
                    >
                        Aa
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onUpdate({ ...note, isPinned: !note.isPinned })}
                        className={`p-1 rounded transition-colors ${note.isPinned ? 'bg-amber-500/30' : 'hover:bg-white/10'}`}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                        <Pin size={12} className={note.isPinned ? 'text-amber-400' : 'text-white/50'} />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={12} className="text-white/50 hover:text-red-400" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <textarea
                value={note.text}
                onChange={handleTextChange}
                placeholder="Type your note..."
                className={`flex-1 p-3 bg-transparent resize-none focus:outline-none min-h-[100px] text-white/90 placeholder-white/30 ${useHandwriting ? 'text-xl' : 'text-sm'}`}
                style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : '"Fira Code", monospace' }}
            />

            {/* Footer */}
            <div className="text-[9px] text-white/30 px-3 py-1.5 text-right border-t border-white/10">
                {new Date(note.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
};
