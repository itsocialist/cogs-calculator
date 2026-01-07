import { useCallback, useEffect, useRef } from 'react';
import type { StickyNoteData } from '../components/ui/StickyNote';
import type { NoteEntry } from '../components/ui/NotesPanel';
import { useHybridStorage, TABLES } from './useHybridStorage';

interface NotesData {
    notes: NoteEntry[];
    stickies: StickyNoteData[];
}

export function useNotes() {
    // Use hybrid storage for notes (localStorage + Supabase sync)
    const {
        data,
        setData,
        isLoaded,
        isSyncing,
    } = useHybridStorage<NotesData>({
        table: TABLES.NOTES,
        sessionKey: 'all',
        defaultValue: { notes: [], stickies: [] },
        // No legacy key - we'll handle migration manually for the two separate keys
    });

    // Handle legacy migration on first load
    const hasMigrated = useRef(false);
    useEffect(() => {
        if (!isLoaded || hasMigrated.current) return;
        hasMigrated.current = true;

        // Check for legacy keys
        const legacyNotes = localStorage.getItem('rolos-notes');
        const legacyStickies = localStorage.getItem('rolos-stickies');

        if ((legacyNotes || legacyStickies) && data.notes.length === 0 && data.stickies.length === 0) {
            try {
                const notes = legacyNotes ? JSON.parse(legacyNotes) : [];
                const stickies = legacyStickies ? JSON.parse(legacyStickies) : [];
                setData({ notes, stickies });
            } catch {
                // Invalid JSON, ignore
            }
        }
    }, [isLoaded, data, setData]);

    // Ref for stable access in callbacks
    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const saveNote = useCallback((note: NoteEntry) => {
        setData(prev => {
            const existing = prev.notes.findIndex(n => n.id === note.id);
            if (existing >= 0) {
                const updated = [...prev.notes];
                updated[existing] = note;
                return { ...prev, notes: updated };
            }
            return { ...prev, notes: [...prev.notes, note] };
        });
    }, [setData]);

    const deleteNote = useCallback((id: string) => {
        setData(prev => ({
            ...prev,
            notes: prev.notes.filter(n => n.id !== id)
        }));
    }, [setData]);

    const createSticky = useCallback(() => {
        const newSticky: StickyNoteData = {
            id: `sticky-${Date.now()}`,
            text: '',
            color: 'amber',
            position: {
                x: Math.random() * (window.innerWidth - 250) + 50,
                y: Math.random() * (window.innerHeight - 200) + 100
            },
            isPinned: false,
            createdAt: Date.now(),
        };
        setData(prev => ({
            ...prev,
            stickies: [...prev.stickies, newSticky]
        }));
        return newSticky;
    }, [setData]);

    const updateSticky = useCallback((updatedSticky: StickyNoteData) => {
        setData(prev => ({
            ...prev,
            stickies: prev.stickies.map(s => s.id === updatedSticky.id ? updatedSticky : s)
        }));
    }, [setData]);

    const deleteSticky = useCallback((id: string) => {
        setData(prev => ({
            ...prev,
            stickies: prev.stickies.filter(s => s.id !== id)
        }));
    }, [setData]);

    return {
        notes: data.notes,
        stickies: data.stickies,
        isLoaded,
        isSyncing,
        saveNote,
        deleteNote,
        createSticky,
        updateSticky,
        deleteSticky,
    };
}
