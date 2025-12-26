import { useState } from 'react';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { InactiveIngredient } from '../../lib/types';

interface Props {
    ingredients: InactiveIngredient[];
    onAdd: (item: Omit<InactiveIngredient, 'id'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (ingredients: InactiveIngredient[]) => void;
}

export const InactiveIngredientsList = ({ ingredients, onAdd, onRemove, onUpdate }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ name: "", costPerKg: 0, gramsInBatch: 0, type: 'base' as const });

    const handleAdd = () => {
        if (!newItem.name) return;
        onAdd(newItem);
        setNewItem({ name: "", costPerKg: 0, gramsInBatch: 0, type: 'base' });
        setIsAdding(false);
    };

    const updateItem = (id: number, field: keyof InactiveIngredient, value: string | number) => {
        onUpdate(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    return (
        <Card
            title="Base & Inactive Ingredients"
            icon={FlaskConical}
            action={
                <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1">
                    <Plus size={14} /> Add Inactive
                </button>
            }
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-400 text-xs border-b border-neutral-100">
                            <th className="pb-2 font-medium">Ingredient Name</th>
                            <th className="pb-2 font-medium w-24">Type</th>
                            <th className="pb-2 font-medium w-32">Cost / Kg</th>
                            <th className="pb-2 font-medium w-32">Grams</th>
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
                                    <select
                                        value={item.type}
                                        onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                        className="bg-transparent text-xs uppercase font-bold text-neutral-500 focus:outline-none print:appearance-none"
                                    >
                                        <option value="base">Base</option>
                                        <option value="carrier">Carrier</option>
                                        <option value="terpene">Terpene</option>
                                    </select>
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput value={item.costPerKg} onChange={(v) => updateItem(item.id, 'costPerKg', v)} prefix="$" />
                                </td>
                                <td className="py-3 px-2">
                                    <NumberInput value={item.gramsInBatch} onChange={(v) => updateItem(item.id, 'gramsInBatch', v)} suffix="g" />
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
                                <td className="py-3 px-2">
                                    <select
                                        value={newItem.type}
                                        onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                                        className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                                    >
                                        <option value="base">Base</option>
                                        <option value="carrier">Carrier</option>
                                        <option value="terpene">Terpene</option>
                                    </select>
                                </td>
                                <td className="py-3 px-2"><NumberInput value={newItem.costPerKg} onChange={(v) => setNewItem({ ...newItem, costPerKg: v })} prefix="$" /></td>
                                <td className="py-3 px-2"><NumberInput value={newItem.gramsInBatch} onChange={(v) => setNewItem({ ...newItem, gramsInBatch: v })} suffix="g" /></td>
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
