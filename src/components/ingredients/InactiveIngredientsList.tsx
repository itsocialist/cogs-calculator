import { useState } from 'react';
import { Plus, Trash2, FlaskConical } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { InactiveIngredient, VolumeUnit } from '../../lib/types';
import { convertToGrams, getDensityForIngredient, getDefaultUnit } from '../../lib/types';

const UNIT_OPTIONS: { value: VolumeUnit; label: string }[] = [
    { value: 'g', label: 'g' },
    { value: 'cup', label: 'cup' },
    { value: 'tbsp', label: 'tbsp' },
    { value: 'tsp', label: 'tsp' },
    { value: 'ml', label: 'ml' },
    { value: 'floz', label: 'fl oz' },
];

interface Props {
    ingredients: InactiveIngredient[];
    onAdd: (item: Omit<InactiveIngredient, 'id'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (ingredients: InactiveIngredient[]) => void;
}

export const InactiveIngredientsList = ({ ingredients, onAdd, onRemove, onUpdate }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<Omit<InactiveIngredient, 'id'>>({
        name: "",
        costPerKg: 0,
        unit: 'cup',
        amountInUnit: 0,
        densityGPerMl: 1.0,
        gramsInBatch: 0,
        type: 'base'
    });

    const handleAdd = () => {
        if (!newItem.name) return;
        const grams = convertToGrams(newItem.amountInUnit, newItem.unit, newItem.densityGPerMl);
        onAdd({ ...newItem, gramsInBatch: grams });
        setNewItem({ name: "", costPerKg: 0, unit: 'cup', amountInUnit: 0, densityGPerMl: 1.0, gramsInBatch: 0, type: 'base' });
        setIsAdding(false);
    };

    const updateItem = (id: number, updates: Partial<InactiveIngredient>) => {
        onUpdate(ingredients.map(i => {
            if (i.id !== id) return i;
            const updated = { ...i, ...updates };
            // Recalculate gramsInBatch when amount or unit changes
            if ('amountInUnit' in updates || 'unit' in updates || 'densityGPerMl' in updates) {
                updated.gramsInBatch = convertToGrams(updated.amountInUnit, updated.unit, updated.densityGPerMl);
            }
            // Update default unit when type changes
            if ('type' in updates && updates.type) {
                updated.unit = getDefaultUnit(updates.type);
            }
            return updated;
        }));
    };

    const handleNameChange = (id: number, name: string) => {
        const density = getDensityForIngredient(name);
        updateItem(id, { name, densityGPerMl: density });
    };

    const handleTypeChange = (type: InactiveIngredient['type']) => {
        const defaultUnit = getDefaultUnit(type);
        setNewItem({ ...newItem, type, unit: defaultUnit });
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
                    <div className="col-span-3">Ingredient</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">$/Kg</div>
                    <div className="col-span-3">Amount</div>
                    <div className="col-span-2">= Grams</div>
                </div>

                {/* Ingredient Rows */}
                {ingredients.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleNameChange(item.id, e.target.value)}
                                className="w-full bg-transparent font-medium text-neutral-900 text-sm focus:outline-none focus:bg-yellow-50 rounded px-1"
                            />
                        </div>
                        <div className="col-span-2">
                            <select
                                value={item.type}
                                onChange={(e) => updateItem(item.id, { type: e.target.value as any })}
                                className="w-full bg-neutral-50 border border-neutral-300 rounded-lg py-1.5 text-xs uppercase font-bold text-neutral-600 focus:outline-none"
                            >
                                <option value="base">Base</option>
                                <option value="carrier">Carrier</option>
                                <option value="terpene">Terpene</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <NumberInput value={item.costPerKg} onChange={(v) => updateItem(item.id, { costPerKg: v })} prefix="$" />
                        </div>
                        <div className="col-span-3 flex gap-1">
                            <div className="flex-1">
                                <NumberInput
                                    value={item.amountInUnit}
                                    onChange={(v) => updateItem(item.id, { amountInUnit: v })}
                                    step={0.125}
                                />
                            </div>
                            <select
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, { unit: e.target.value as VolumeUnit })}
                                className="bg-neutral-50 border border-neutral-300 rounded-lg px-1 py-1 text-xs font-bold text-neutral-600"
                            >
                                {UNIT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                            <span className="text-xs text-neutral-400 font-mono">{item.gramsInBatch.toFixed(1)}g</span>
                            <button onClick={() => onRemove(item.id)} className="text-neutral-300 hover:text-red-500 print:hidden ml-auto">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Row */}
                {isAdding && (
                    <div className="grid grid-cols-12 gap-2 items-center bg-yellow-50 p-2 rounded-lg animate-in fade-in">
                        <div className="col-span-3">
                            <input
                                autoFocus
                                placeholder="Ingredient name"
                                className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-sm"
                                value={newItem.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const density = getDensityForIngredient(name);
                                    setNewItem({ ...newItem, name, densityGPerMl: density });
                                }}
                            />
                        </div>
                        <div className="col-span-2">
                            <select
                                value={newItem.type}
                                onChange={(e) => handleTypeChange(e.target.value as any)}
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
                        <div className="col-span-3 flex gap-1">
                            <div className="flex-1">
                                <NumberInput value={newItem.amountInUnit} onChange={(v) => setNewItem({ ...newItem, amountInUnit: v })} step={0.125} />
                            </div>
                            <select
                                value={newItem.unit}
                                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as VolumeUnit })}
                                className="bg-white border border-neutral-300 rounded px-1 py-1 text-xs"
                            >
                                {UNIT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                            <span className="text-xs text-neutral-400 font-mono">
                                {convertToGrams(newItem.amountInUnit, newItem.unit, newItem.densityGPerMl).toFixed(1)}g
                            </span>
                            <button onClick={handleAdd} className="text-xs bg-black text-white px-2 py-1 rounded ml-auto">Save</button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
