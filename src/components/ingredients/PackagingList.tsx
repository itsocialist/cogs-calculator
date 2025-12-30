import { useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { PackagingItem } from '../../lib/types';

interface Props {
    items: PackagingItem[];
    onAdd: (item: Omit<PackagingItem, 'id'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (items: PackagingItem[]) => void;
}

export const PackagingList = ({ items, onAdd, onRemove, onUpdate }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", costPerUnit: 0 });

    const handleAdd = () => {
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({ name: "", costPerUnit: 0 });
        setIsAdding(false);
    };

    const updateItem = (id: number, field: keyof PackagingItem, value: string | number) => {
        onUpdate(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    return (
        <Card
            title="Packaging Configuration"
            icon={Package}
            action={
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1"
                >
                    <Plus size={14} /> Add Item
                </button>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
                            <th className="pb-2 font-medium">Item Name</th>
                            <th className="pb-2 font-medium w-32">Cost / Unit</th>
                            <th className="pb-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {items.map((item) => (
                            <tr key={item.id} className="group">
                                <td className="py-3 pr-4">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        className="w-full bg-transparent font-medium text-neutral-900 focus:outline-none focus:border-b focus:border-yellow-500"
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput
                                        value={item.costPerUnit}
                                        onChange={(v) => updateItem(item.id, 'costPerUnit', v)}
                                        prefix="$"
                                        step={0.01}
                                    />
                                </td>
                                <td className="py-3 text-right">
                                    <button
                                        onClick={() => onRemove(item.id)}
                                        className="text-neutral-300 hover:text-red-500 print:hidden"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {isAdding && (
                            <tr className="bg-yellow-50/50 animate-in fade-in">
                                <td className="py-3 pr-4">
                                    <input
                                        autoFocus
                                        placeholder="New Item Name"
                                        className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-sm"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput
                                        value={newItem.costPerUnit}
                                        onChange={(v) => setNewItem({ ...newItem, costPerUnit: v })}
                                        prefix="$"
                                        step={0.01}
                                    />
                                </td>
                                <td className="py-3 text-right">
                                    <button onClick={handleAdd} className="text-xs bg-black text-white px-2 py-1 rounded">Save</button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
