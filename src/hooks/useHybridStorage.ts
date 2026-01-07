/**
 * useHybridStorage Hook
 * 
 * Provides offline-first data persistence with Supabase cloud sync.
 * - Reads always from localStorage first (instant)
 * - Writes to both localStorage and Supabase (async)
 * - Syncs from cloud on mount if available
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';

type TableName = 'cogs_recipes' | 'cogs_snapshots' | 'cogs_config' | 'cogs_notes';

interface UseHybridStorageOptions<T> {
    /** Supabase table to sync with */
    table: TableName;
    /** Unique session key for this data */
    sessionKey: string;
    /** Default value if nothing stored */
    defaultValue: T;
    /** Legacy localStorage key for migration */
    legacyKey?: string;
}

interface UseHybridStorageReturn<T> {
    /** Current data */
    data: T;
    /** Update data (persists to both local and cloud) */
    setData: (newData: T | ((prev: T) => T)) => void;
    /** Whether initial load is complete */
    isLoaded: boolean;
    /** Whether cloud sync is in progress */
    isSyncing: boolean;
    /** Last sync error, if any */
    syncError: Error | null;
    /** Manually trigger cloud sync */
    syncToCloud: () => Promise<void>;
}

// Generate a persistent device ID for session tracking
function getDeviceId(): string {
    let deviceId = localStorage.getItem('rolos-device-id');
    if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('rolos-device-id', deviceId);
    }
    return deviceId;
}

export function useHybridStorage<T>({
    table,
    sessionKey,
    defaultValue,
    legacyKey,
}: UseHybridStorageOptions<T>): UseHybridStorageReturn<T> {
    const [data, setDataState] = useState<T>(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<Error | null>(null);

    const hasLoadedRef = useRef(false);
    const saveTimeoutRef = useRef<number | null>(null);
    const deviceId = useRef(getDeviceId());

    // Composite key for localStorage
    const localStorageKey = `rolos-${table}-${sessionKey}`;

    // Load data on mount
    useEffect(() => {
        async function loadData() {
            if (hasLoadedRef.current) return;
            hasLoadedRef.current = true;

            try {
                // 1. First try localStorage (instant)
                let stored: T | null = null;
                const localData = localStorage.getItem(localStorageKey);
                if (localData) {
                    try {
                        stored = JSON.parse(localData);
                    } catch {
                        // Invalid JSON, ignore
                    }
                }

                // 2. Check legacy key for migration
                if (stored === null && legacyKey) {
                    const legacy = localStorage.getItem(legacyKey);
                    if (legacy) {
                        try {
                            stored = JSON.parse(legacy);
                            // Migrate to new key
                            localStorage.setItem(localStorageKey, legacy);
                        } catch {
                            // Invalid JSON, ignore
                        }
                    }
                }

                // 3. Set initial data from local
                if (stored !== null) {
                    setDataState(stored);
                }

                // 4. If Supabase available, check for newer cloud data
                if (isSupabaseAvailable() && supabase) {
                    const { data: cloudData, error } = await supabase
                        .from(table)
                        .select('data, updated_at')
                        .eq('session_id', `${deviceId.current}-${sessionKey}`)
                        .single();

                    if (!error && cloudData?.data) {
                        // Cloud data exists - use it if we don't have local data
                        // In a more sophisticated setup, we'd compare timestamps
                        if (stored === null) {
                            setDataState(cloudData.data as T);
                            localStorage.setItem(localStorageKey, JSON.stringify(cloudData.data));
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load hybrid storage:', err);
                setSyncError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setIsLoaded(true);
            }
        }

        loadData();
    }, [table, sessionKey, localStorageKey, legacyKey]);

    // Sync to cloud function
    const syncToCloud = useCallback(async () => {
        if (!isSupabaseAvailable() || !supabase) return;

        setIsSyncing(true);
        setSyncError(null);

        try {
            const currentData = JSON.parse(localStorage.getItem(localStorageKey) || 'null');
            if (currentData === null) return;

            const { error } = await supabase
                .from(table)
                .upsert({
                    session_id: `${deviceId.current}-${sessionKey}`,
                    data: currentData,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'session_id',
                });

            if (error) throw error;
        } catch (err) {
            console.error('Failed to sync to cloud:', err);
            setSyncError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setIsSyncing(false);
        }
    }, [table, sessionKey, localStorageKey]);

    // Debounced save function
    const saveData = useCallback((newData: T) => {
        // Always save to localStorage immediately
        localStorage.setItem(localStorageKey, JSON.stringify(newData));

        // Also update legacy key if provided (backwards compatibility)
        if (legacyKey) {
            localStorage.setItem(legacyKey, JSON.stringify(newData));
        }

        // Debounced cloud sync
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = window.setTimeout(() => {
            syncToCloud();
        }, 2000); // 2 second debounce for cloud sync
    }, [localStorageKey, legacyKey, syncToCloud]);

    // Update function
    const setData = useCallback((newData: T | ((prev: T) => T)) => {
        setDataState(prevData => {
            const nextData = typeof newData === 'function'
                ? (newData as (prev: T) => T)(prevData)
                : newData;

            saveData(nextData);
            return nextData;
        });
    }, [saveData]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        data,
        setData,
        isLoaded,
        isSyncing,
        syncError,
        syncToCloud,
    };
}

// Export table names for type safety
export const TABLES = {
    RECIPES: 'cogs_recipes' as const,
    SNAPSHOTS: 'cogs_snapshots' as const,
    CONFIG: 'cogs_config' as const,
    NOTES: 'cogs_notes' as const,
};
