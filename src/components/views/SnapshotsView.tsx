import { useState, useRef } from 'react';
import { History, Trash2, Save, Upload, Clock } from 'lucide-react';
import type { Snapshot } from '../../lib/types';

interface Props {
    snapshots: Snapshot[];
    onLoad: (snap: Snapshot) => void;
    onDelete: (id: number) => void;
    onSave?: () => void;
    onImport?: (json: string) => void;
}

export const SnapshotsView = ({ snapshots, onLoad, onDelete, onSave, onImport }: Props) => {
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sort snapshots by most recent first
    const sortedSnapshots = [...snapshots].sort((a, b) => b.id - a.id);

    const handleDelete = (id: number) => {
        if (confirmDelete === id) {
            onDelete(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImport) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            try {
                onImport(content);
            } catch {
                setImportError('Invalid snapshot file format');
                setTimeout(() => setImportError(null), 3000);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const formatDate = (id: number) => {
        // Using ID as timestamp proxy for older snapshots
        const date = new Date(id);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in print:hidden">
            {/* Header Actions - Matches RecipesView */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="text-white/60" size={24} />
                    <h2 className="text-xl font-bold text-white/90">Snapshot Library</h2>
                    <span className="text-sm text-white/50">({snapshots.length} saved)</span>
                </div>

                <div className="flex gap-2">
                    {onSave && (
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Save size={16} />
                            Save Current
                        </button>
                    )}

                    {onImport && (
                        <button
                            onClick={handleImportClick}
                            className="flex items-center gap-2 bg-white/10 text-white/70 px-4 py-2 rounded-lg hover:bg-white/15 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Upload size={16} />
                            Import
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Import Error */}
            {importError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm">
                    {importError}
                </div>
            )}

            {/* Snapshot List */}
            {sortedSnapshots.length === 0 ? (
                <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center">
                    <History size={48} className="mx-auto text-white/20 mb-4" />
                    <h3 className="text-lg font-medium text-white/70 mb-2">No Saved Snapshots</h3>
                    <p className="text-sm text-white/50 mb-4">
                        Save your current batch configuration to quickly restore it later.
                    </p>
                    {onSave && (
                        <button
                            onClick={onSave}
                            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Save size={16} />
                            Save Current Snapshot
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedSnapshots.map((snap) => (
                        <div
                            key={snap.id}
                            className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white/90 truncate">{snap.name}</h3>

                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(snap.id)}
                                        </span>
                                        <span>
                                            Cost: ${snap.cost.toFixed(2)}
                                        </span>
                                        <span>
                                            Target: {snap.config.recipeConfig?.targetPotencyMg || 500}mg
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onLoad(snap)}
                                        className="px-3 py-1.5 bg-white/15 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium border border-white/10"
                                    >
                                        Load
                                    </button>

                                    <button
                                        onClick={() => handleDelete(snap.id)}
                                        className={`p-1.5 rounded transition-colors ${confirmDelete === snap.id
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                                            }`}
                                        title={confirmDelete === snap.id ? 'Click again to confirm' : 'Delete'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
