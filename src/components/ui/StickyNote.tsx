import { useState, useEffect, useRef } from 'react';
import { GripHorizontal, Trash2, Pin } from 'lucide-react';

export interface StickyNoteData {
    id: string;
    text: string;
    color: 'yellow' | 'slate' | 'teal' | 'blue' | 'neutral';
    position: { x: number; y: number };
    isPinned: boolean;
    createdAt: number;
}

interface Props {
    note: StickyNoteData;
    onUpdate: (note: StickyNoteData) => void;
    onDelete: (id: string) => void;
}

const COLORS = {
    yellow: 'bg-yellow-50 border-yellow-300',
    slate: 'bg-slate-100 border-slate-300',
    teal: 'bg-teal-50 border-teal-300',
    blue: 'bg-blue-50 border-blue-300',
    neutral: 'bg-neutral-100 border-neutral-300',
};

const HEADER_COLORS = {
    yellow: 'bg-yellow-100',
    slate: 'bg-slate-200',
    teal: 'bg-teal-100',
    blue: 'bg-blue-100',
    neutral: 'bg-neutral-200',
};

export const StickyNote = ({ note, onUpdate, onDelete }: Props) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(note.position);
    const [useHandwriting, setUseHandwriting] = useState(true);
    const dragStart = useRef({ x: 0, y: 0 });

    // Safe color getter - fallback to yellow for old/invalid colors
    const safeColor = (note.color in COLORS) ? note.color : 'yellow';
    const colorClass = COLORS[safeColor];
    const headerColorClass = HEADER_COLORS[safeColor];

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
        const colors: StickyNoteData['color'][] = ['yellow', 'slate', 'teal', 'blue', 'neutral'];
        const currentIndex = colors.indexOf(safeColor as StickyNoteData['color']);
        const nextColor = colors[(currentIndex + 1) % colors.length];
        onUpdate({ ...note, color: nextColor });
    };

    return (
        <div
            className={`fixed w-48 rounded-lg border-2 shadow-lg flex flex-col overflow-hidden ${colorClass} ${isDragging ? 'shadow-2xl scale-105' : ''} transition-shadow ${note.isPinned ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
            style={{
                left: position.x,
                top: position.y,
                zIndex: note.isPinned ? 95 : 90,
            }}
        >
            {/* Header */}
            <div
                className={`${headerColorClass} p-1.5 flex items-center justify-between cursor-move select-none`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-1">
                    <GripHorizontal size={12} className="text-neutral-500" />
                    <button
                        onClick={cycleColor}
                        className="p-0.5 hover:bg-white/50 rounded text-xs"
                        title="Change color"
                    >
                        🎨
                    </button>
                    <button
                        onClick={() => setUseHandwriting(!useHandwriting)}
                        className={`p-0.5 rounded text-[10px] font-medium ${useHandwriting ? 'bg-white/70' : 'hover:bg-white/50'}`}
                        title={useHandwriting ? 'Switch to typed' : 'Switch to handwritten'}
                        style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : 'inherit' }}
                    >
                        Aa
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onUpdate({ ...note, isPinned: !note.isPinned })}
                        className={`p-0.5 rounded ${note.isPinned ? 'bg-white/70' : 'hover:bg-white/50'}`}
                        title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                        <Pin size={12} className={note.isPinned ? 'text-red-600' : 'text-neutral-500'} />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="p-0.5 hover:bg-red-200 rounded"
                        title="Delete"
                    >
                        <Trash2 size={12} className="text-neutral-600" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <textarea
                value={note.text}
                onChange={handleTextChange}
                placeholder="Type your note..."
                className={`flex-1 p-2 bg-transparent resize-none focus:outline-none min-h-[80px] ${colorClass.split(' ')[0]} ${useHandwriting ? 'text-xl' : 'text-sm'}`}
                style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : '"Fira Code", monospace' }}
            />

            {/* Footer */}
            <div className="text-[9px] text-neutral-400 px-2 py-1 text-right">
                {new Date(note.createdAt).toLocaleDateString()}
            </div>
        </div>
    );
};
