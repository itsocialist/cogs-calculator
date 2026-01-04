import { useState, useEffect, useCallback } from 'react';
import type { StickyNoteData } from '../components/ui/StickyNote';
import type { NoteEntry } from '../components/ui/NotesPanel';

const NOTES_STORAGE_KEY = 'rolos-notes';
const STICKIES_STORAGE_KEY = 'rolos-stickies';

export function useNotes() {
    const [notes, setNotes] = useState<NoteEntry[]>(() => {
        const saved = localStorage.getItem(NOTES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [stickies, setStickies] = useState<StickyNoteData[]>(() => {
        const saved = localStorage.getItem(STICKIES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    // Persist notes
    useEffect(() => {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    }, [notes]);

    // Persist stickies
    useEffect(() => {
        localStorage.setItem(STICKIES_STORAGE_KEY, JSON.stringify(stickies));
    }, [stickies]);

    const saveNote = useCallback((note: NoteEntry) => {
        setNotes(prev => {
            const existing = prev.findIndex(n => n.id === note.id);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = note;
                return updated;
            }
            return [...prev, note];
        });
    }, []);

    const deleteNote = useCallback((id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    }, []);

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
        setStickies(prev => [...prev, newSticky]);
        return newSticky;
    }, []);

    const updateSticky = useCallback((updatedSticky: StickyNoteData) => {
        setStickies(prev => prev.map(s => s.id === updatedSticky.id ? updatedSticky : s));
    }, []);

    const deleteSticky = useCallback((id: string) => {
        setStickies(prev => prev.filter(s => s.id !== id));
    }, []);

    return {
        notes,
        stickies,
        saveNote,
        deleteNote,
        createSticky,
        updateSticky,
        deleteSticky,
    };
}
