import { useState, useEffect, useRef } from 'react';
import { GripHorizontal, X } from 'lucide-react';

interface Props {
    title: string;
    icon?: React.ElementType;
    onClose: () => void;
    children: React.ReactNode;
    initialPosition?: { x: number; y: number };
    className?: string;
    width?: number | string;
    isOpen?: boolean; // Add optional isOpen for compatibility but logic is usually external
}

export const DraggableToolPanel = ({
    title,
    icon: Icon,
    onClose,
    children,
    initialPosition = { x: window.innerWidth / 2 - 150, y: 100 },
    className = '',
    width = 'w-80',
    isOpen = true
}: Props) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    if (!isOpen) return null;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    return (
        <div
            className={`fixed z-[100] bg-stone-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${width} ${className}`}
            style={{
                left: position.x,
                top: position.y,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header / Drag Handle */}
            <div
                className={`p-3 border-b border-white/10 flex items-center justify-between cursor-move select-none ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-white/80 uppercase tracking-wide">
                    {Icon && <Icon size={16} className="text-amber-400" />}
                    {title}
                </div>
                <div className="flex items-center gap-2 text-white/40">
                    <GripHorizontal size={16} />
                    <button onClick={onClose} className="hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
