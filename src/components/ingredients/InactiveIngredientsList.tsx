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
            <div className="space-y-3">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-400 uppercase border-b border-neutral-100 pb-2">
                    <div className="col-span-4">Ingredient Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Cost/Kg</div>
                    <div className="col-span-3">Grams</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Ingredient Rows */}
                {ingredients.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                className="w-full bg-transparent font-medium text-neutral-900 text-sm focus:outline-none focus:bg-yellow-50 rounded px-1"
                            />
                        </div>
                        <div className="col-span-2">
                            <select
                                value={item.type}
                                onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg py-1.5 text-xs uppercase font-bold text-neutral-600 focus:outline-none"
                            >
                                <option value="base">Base</option>
                                <option value="carrier">Carrier</option>
                                <option value="terpene">Terpene</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <NumberInput value={item.costPerKg} onChange={(v) => updateItem(item.id, 'costPerKg', v)} prefix="$" />
                        </div>
                        <div className="col-span-3">
                            <NumberInput value={item.gramsInBatch} onChange={(v) => updateItem(item.id, 'gramsInBatch', v)} suffix="g" />
                        </div>
                        <div className="col-span-1 text-right">
                            <button onClick={() => onRemove(item.id)} className="text-neutral-300 hover:text-red-500 print:hidden">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Row */}
                {isAdding && (
                    <div className="grid grid-cols-12 gap-2 items-center bg-yellow-50 p-2 rounded-lg animate-in fade-in">
                        <div className="col-span-4">
                            <input
                                autoFocus
                                placeholder="Ingredient name"
                                className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-sm"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <select
                                value={newItem.type}
                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                                className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-xs"
                            >
                                <option value="base">Base</option>
                                <option value="carrier">Carrier</option>
                                <option value="terpene">Terpene</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <NumberInput value={newItem.costPerKg} onChange={(v) => setNewItem({ ...newItem, costPerKg: v })} prefix="$" />
                        </div>
                        <div className="col-span-3">
                            <NumberInput value={newItem.gramsInBatch} onChange={(v) => setNewItem({ ...newItem, gramsInBatch: v })} suffix="g" />
                        </div>
                        <div className="col-span-1 text-right">
                            <button onClick={handleAdd} className="text-xs bg-black text-white px-2 py-1.5 rounded">Save</button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
