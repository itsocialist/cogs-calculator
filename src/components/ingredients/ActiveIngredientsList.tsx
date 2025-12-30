import { useState } from 'react';
import { Plus, Trash2, Beaker } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { ActiveIngredient } from '../../lib/types';

interface Props {
    ingredients: ActiveIngredient[];
    onAdd: (item: Omit<ActiveIngredient, 'id' | 'type'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (ingredients: ActiveIngredient[]) => void;
}

export const ActiveIngredientsList = ({ ingredients, onAdd, onRemove, onUpdate }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", costPerKg: 0, gramsInBatch: 0, purityPercent: 90 });

    const handleAdd = () => {
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({ name: "", costPerKg: 0, gramsInBatch: 0, purityPercent: 90 });
        setIsAdding(false);
    };

    const updateItem = (id: number, field: keyof ActiveIngredient, value: string | number) => {
        onUpdate(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    return (
        <Card
            title="Active Ingredients"
            icon={Beaker}
            action={
                <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1">
                    <Plus size={14} /> Add Active
                </button>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
                            <th className="pb-2 font-medium min-w-[140px]">Ingredient Name</th>
                            <th className="pb-2 font-medium w-36">Cost / Kg</th>
                            <th className="pb-2 font-medium w-36">Grams</th>
                            <th className="pb-2 font-medium w-28">Purity %</th>
                            <th className="pb-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {ingredients.map((item) => (
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
                                    <NumberInput value={item.costPerKg} onChange={(v) => updateItem(item.id, 'costPerKg', v)} prefix="$" />
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput value={item.gramsInBatch} onChange={(v) => updateItem(item.id, 'gramsInBatch', v)} suffix="g" />
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput value={item.purityPercent} onChange={(v) => updateItem(item.id, 'purityPercent', v)} suffix="%" />
                                </td>
                                <td className="py-3 text-right">
                                    <button onClick={() => onRemove(item.id)} className="text-neutral-300 hover:text-red-500 print:hidden">
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
                                        placeholder="New Ingredient Name"
                                        className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-sm"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </td>
                                <td className="py-3 px-2"><NumberInput value={newItem.costPerKg} onChange={(v) => setNewItem({ ...newItem, costPerKg: v })} prefix="$" /></td>
                                <td className="py-3 px-2"><NumberInput value={newItem.gramsInBatch} onChange={(v) => setNewItem({ ...newItem, gramsInBatch: v })} suffix="g" /></td>
                                <td className="py-3 px-2"><NumberInput value={newItem.purityPercent} onChange={(v) => setNewItem({ ...newItem, purityPercent: v })} suffix="%" /></td>
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
