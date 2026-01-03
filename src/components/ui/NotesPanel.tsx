import { useState, useEffect, useRef } from 'react';
import { FileText, GripHorizontal, X, Plus, StickyNote, Save, Trash2 } from 'lucide-react';

export interface NoteEntry {
    id: string;
    title: string;
    content: string;
    type: 'note' | 'sticky';
    createdAt: number;
    updatedAt: number;
    scenarioId?: string;
}

interface Props {
    onClose: () => void;
    onCreateSticky: () => void;
    notes: NoteEntry[];
    onSaveNote: (note: NoteEntry) => void;
    onDeleteNote: (id: string) => void;
}

export const NotesPanel = ({ onClose, onCreateSticky, notes, onSaveNote, onDeleteNote }: Props) => {
    const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 80 });
    const [size, setSize] = useState({ width: 320, height: 500 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [useHandwriting, setUseHandwriting] = useState(true);
    const dragStart = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    // Drag Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y
                });
            }
            if (isResizing) {
                const newWidth = Math.max(280, resizeStart.current.width + (e.clientX - resizeStart.current.x));
                const newHeight = Math.max(300, resizeStart.current.height + (e.clientY - resizeStart.current.y));
                setSize({ width: newWidth, height: newHeight });
            }
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        resizeStart.current = { width: size.width, height: size.height, x: e.clientX, y: e.clientY };
    };

    const handleNewNote = () => {
        const newNote: NoteEntry = {
            id: `note-${Date.now()}`,
            title: 'New Note',
            content: '',
            type: 'note',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        onSaveNote(newNote);
        setActiveNoteId(newNote.id);
        setEditTitle(newNote.title);
        setEditContent(newNote.content);
    };

    const handleSelectNote = (note: NoteEntry) => {
        // Save current note first
        if (activeNoteId) {
            const currentNote = notes.find(n => n.id === activeNoteId);
            if (currentNote && (currentNote.title !== editTitle || currentNote.content !== editContent)) {
                onSaveNote({ ...currentNote, title: editTitle, content: editContent, updatedAt: Date.now() });
            }
        }
        setActiveNoteId(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
    };

    const handleSave = () => {
        if (!activeNoteId) return;
        const note = notes.find(n => n.id === activeNoteId);
        if (note) {
            onSaveNote({ ...note, title: editTitle, content: editContent, updatedAt: Date.now() });
        }
    };

    const handleDelete = () => {
        if (!activeNoteId) return;
        onDeleteNote(activeNoteId);
        setActiveNoteId(null);
        setEditTitle('');
        setEditContent('');
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    return (
        <div
            className="fixed z-[100] bg-white shadow-2xl rounded-lg border border-neutral-300 flex flex-col overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: size.height,
                fontFamily: '"Fira Code", monospace'
            }}
        >
            {/* Header - Matches Math Tape */}
            <div
                className={`bg-neutral-800 text-white p-2 flex items-center justify-between cursor-move select-none ${isDragging ? 'cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <FileText size={14} className="text-yellow-400" />
                    Notepad
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setUseHandwriting(!useHandwriting)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${useHandwriting ? 'bg-yellow-500 text-neutral-800' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'}`}
                        title={useHandwriting ? 'Switch to typed' : 'Switch to handwritten'}
                        style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : 'inherit' }}
                    >
                        Aa
                    </button>
                    <GripHorizontal size={16} className="text-neutral-500" />
                    <button onClick={onClose} className="hover:text-red-400">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-yellow-50/30 border-b border-neutral-200 p-2 flex items-center gap-2 flex-wrap">
                <button
                    onClick={handleNewNote}
                    className="flex items-center gap-1 px-2 py-1 bg-neutral-800 text-white rounded text-xs hover:bg-neutral-700"
                >
                    <Plus size={12} /> Note
                </button>
                <button
                    onClick={onCreateSticky}
                    className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                >
                    <StickyNote size={12} /> Sticky
                </button>
                {activeNoteId && (
                    <>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 ml-auto"
                        >
                            <Save size={12} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                            <Trash2 size={12} />
                        </button>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-yellow-50/20">
                {/* Notes List */}
                <div className="border-b border-neutral-200 bg-neutral-50 overflow-x-auto flex gap-1 p-1">
                    {notes.filter(n => n.type === 'note').map(note => (
                        <button
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className={`px-2 py-1 text-xs rounded whitespace-nowrap ${activeNoteId === note.id ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200 hover:bg-neutral-100'}`}
                        >
                            {note.title.substring(0, 15)}{note.title.length > 15 ? '...' : ''}
                        </button>
                    ))}
                    {notes.filter(n => n.type === 'note').length === 0 && (
                        <span className="text-xs text-neutral-400 px-2 py-1">No notes yet</span>
                    )}
                </div>

                {/* Note Editor */}
                <div className="flex-1 flex flex-col p-3 overflow-hidden">
                    {activeNote ? (
                        <>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Note title..."
                                className="text-sm font-bold border-b border-neutral-200 pb-2 mb-2 focus:outline-none focus:border-yellow-400 bg-transparent"
                            />
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Write your notes here..."
                                className={`flex-1 resize-none focus:outline-none leading-relaxed bg-transparent ${useHandwriting ? 'text-xl' : 'text-sm'}`}
                                style={{ fontFamily: useHandwriting ? '"Caveat", cursive' : '"Fira Code", monospace' }}
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs">
                            Select or create a note
                        </div>
                    )}
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={handleResizeStart}
            >
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-neutral-400" />
            </div>
        </div>
    );
};
