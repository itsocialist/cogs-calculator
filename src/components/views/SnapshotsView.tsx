import { History, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Snapshot } from '../../lib/types';

interface Props {
    snapshots: Snapshot[];
    onLoad: (snap: Snapshot) => void;
    onDelete: (id: number) => void;
}

export const SnapshotsView = ({ snapshots, onLoad, onDelete }: Props) => {
    return (
        <div className="animate-in fade-in print:hidden">
            <Card title="Saved Versions" icon={History}>
                {snapshots.length === 0 ? (
                    <div className="text-center py-10 text-neutral-400">
                        <p>No snapshots saved yet.</p>
                        <p className="text-xs">Configure your batch and click the save icon in the Actions menu.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {snapshots.map((snap) => (
                            <div key={snap.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <div>
                                    <div className="font-bold text-neutral-800">{snap.name}</div>
                                    <div className="text-xs text-neutral-500">Cost: ${snap.cost.toFixed(2)} | Target: {snap.config.recipeConfig?.targetPotencyMg || 500}mg</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onLoad(snap)} className="text-xs bg-white border border-neutral-300 px-3 py-1.5 rounded hover:bg-neutral-100 font-medium">Load</button>
                                    <button onClick={() => onDelete(snap.id)} className="text-neutral-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
