import { useState } from 'react';
import { Plus, Trash2, Beaker } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { ActiveIngredient, VolumeUnit, CannabinoidType } from '../../lib/types';
import { getDensityForIngredient } from '../../lib/types';

const UNIT_OPTIONS: { value: VolumeUnit; label: string }[] = [
    { value: 'g', label: 'g' },
    { value: 'cup', label: 'cup' },
    { value: 'tbsp', label: 'tbsp' },
    { value: 'tsp', label: 'tsp' },
    { value: 'ml', label: 'ml' },
    { value: 'floz', label: 'fl oz' },
];

const CANNABINOID_OPTIONS: { value: CannabinoidType; label: string }[] = [
    { value: 'CBD', label: 'CBD' },
    { value: 'THC', label: 'THC' },
    { value: 'CBG', label: 'CBG' },
    { value: 'CBN', label: 'CBN' },
    { value: 'other', label: 'Other' },
];

// Infer cannabinoid from name
function inferCannabinoid(name: string): CannabinoidType {
    const n = name.toLowerCase();
    if (n.includes('cbd')) return 'CBD';
    if (n.includes('thc')) return 'THC';
    if (n.includes('cbg')) return 'CBG';
    if (n.includes('cbn')) return 'CBN';
    return 'other';
}

interface Props {
    ingredients: ActiveIngredient[];
    onAdd: (item: Omit<ActiveIngredient, 'id' | 'type'>) => void;
    onRemove: (id: number) => void;
    onUpdate: (ingredients: ActiveIngredient[]) => void;
    baseUnitSize?: number; // For coverage calculation
}

export const ActiveIngredientsList = ({ ingredients, onAdd, onRemove, onUpdate, baseUnitSize = 0 }: Props) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        costPerKg: 0,
        unit: 'g' as VolumeUnit,
        amount: 0,
        densityGPerMl: 1.0,
        gramsPerRecipeUnit: 0, // Placeholder
        gramsInBatch: 0,       // Placeholder
        purityPercent: 90,
        cannabinoid: 'CBD' as CannabinoidType
    });

    const handleAdd = () => {
        if (!newItem.name) return;
        // relevant calculations are done in useCalculator derived state
        onAdd(newItem);
        setNewItem({ name: "", costPerKg: 0, unit: 'g', amount: 0, densityGPerMl: 1.0, gramsPerRecipeUnit: 0, gramsInBatch: 0, purityPercent: 90, cannabinoid: 'CBD' });
        setIsAdding(false);
    };

    const updateItem = (id: number, updates: Partial<ActiveIngredient>) => {
        onUpdate(ingredients.map(i => {
            if (i.id !== id) return i;
            return { ...i, ...updates };
        }));
    };

    const handleNameChange = (id: number, name: string) => {
        const density = getDensityForIngredient(name);
        const cannabinoid = inferCannabinoid(name);
        updateItem(id, { name, densityGPerMl: density, cannabinoid });
    };

    return (
        <Card
            title="Active Ingredients"
            icon={Beaker}
            collapsible
            tooltip="Add cannabinoids (CBD, THC, CBG, etc.) with purity percentages. The calculator automatically tracks total active mg per base unit and compares to your target potency."
            action={
                <button onClick={() => setIsAdding(!isAdding)} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1">
                    <Plus size={14} /> Add Active
                </button>
            }
        >
            <div className="space-y-3">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-1 text-xs font-bold text-white/50 uppercase border-b border-white/10 pb-2">
                    <div className="col-span-2">Name</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-2">$/Kg</div>
                    <div className="col-span-3">Amount per Unit</div>
                    <div className="col-span-4">Purity → Active</div>
                </div>

                {/* Ingredient Rows */}
                {ingredients.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1 items-center">
                        <div className="col-span-2">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleNameChange(item.id, e.target.value)}
                                className="w-full bg-transparent font-medium text-white/90 text-sm focus:outline-none focus:bg-white/10 focus:text-white rounded px-1 truncate"
                                title={item.name}
                            />
                        </div>
                        <div className="col-span-1">
                            <select
                                value={item.cannabinoid}
                                onChange={(e) => updateItem(item.id, { cannabinoid: e.target.value as CannabinoidType })}
                                className="w-full bg-white/15 backdrop-blur-sm border-0 rounded px-0.5 py-1 text-xs font-bold text-white/80 focus:outline-none focus:ring-1 focus:ring-white/30"
                            >
                                {CANNABINOID_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <NumberInput value={item.costPerKg} onChange={(v) => updateItem(item.id, { costPerKg: v })} prefix="$" />
                        </div>
                        <div className="col-span-3 flex gap-1">
                            <div className="flex-1">
                                <NumberInput
                                    value={item.amount}
                                    onChange={(v) => updateItem(item.id, { amount: v })}
                                    step={0.01}
                                />
                            </div>
                            <select
                                value={item.unit}
                                onChange={(e) => updateItem(item.id, { unit: e.target.value as VolumeUnit })}
                                className="bg-white/15 backdrop-blur-sm border-0 rounded px-1 py-1 text-xs font-bold text-white/80 w-14 focus:outline-none focus:ring-1 focus:ring-white/30"
                            >
                                {UNIT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-4 flex items-center gap-1">
                            <input
                                type="number"
                                value={item.purityPercent}
                                onChange={(e) => updateItem(item.id, { purityPercent: parseFloat(e.target.value) || 0 })}
                                className="w-10 bg-white/15 backdrop-blur-sm border-0 rounded px-1 py-1 text-xs text-right text-white/90 focus:outline-none focus:ring-1 focus:ring-white/30"
                                step={0.5}
                            />
                            <span className="text-[10px] text-white/40">%</span>
                            <span className="text-[10px] text-white/40 font-mono">({item.gramsPerRecipeUnit.toFixed(2)}g)</span>
                            <span className="badge-green ml-auto">
                                ~{(item.gramsPerRecipeUnit * item.purityPercent / 100 * 1000).toFixed(0)}mg
                            </span>
                            <button onClick={() => onRemove(item.id)} className="text-white/40 hover:text-red-500 print:hidden ml-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Row */}
                {isAdding && (
                    <div className="grid grid-cols-12 gap-1 items-center bg-white/10 border border-white/20 p-2 rounded-lg animate-in fade-in">
                        <div className="col-span-2">
                            <input
                                autoFocus
                                placeholder="Name"
                                className="w-full bg-white/15 border border-white/20 rounded px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
                                value={newItem.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    const density = getDensityForIngredient(name);
                                    const cannabinoid = inferCannabinoid(name);
                                    setNewItem({ ...newItem, name, densityGPerMl: density, cannabinoid });
                                }}
                            />
                        </div>
                        <div className="col-span-1">
                            <select
                                value={newItem.cannabinoid}
                                onChange={(e) => setNewItem({ ...newItem, cannabinoid: e.target.value as CannabinoidType })}
                                className="w-full bg-white/15 border border-white/20 rounded px-0.5 py-1 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-white/30"
                            >
                                {CANNABINOID_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <NumberInput value={newItem.costPerKg} onChange={(v) => setNewItem({ ...newItem, costPerKg: v })} prefix="$" />
                        </div>
                        <div className="col-span-4 flex gap-1">
                            <div className="flex-1">
                                <NumberInput value={newItem.amount} onChange={(v) => setNewItem({ ...newItem, amount: v })} step={0.01} />
                            </div>
                            <select
                                value={newItem.unit}
                                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as VolumeUnit })}
                                className="bg-white/15 border border-white/20 rounded px-1 py-1 text-xs text-white/80 w-14 focus:outline-none focus:ring-1 focus:ring-white/30"
                            >
                                {UNIT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                            <button onClick={handleAdd} className="text-xs bg-white/20 text-white px-3 py-1.5 rounded hover:bg-white/30 transition-colors border border-white/20">Save</button>
                        </div>
                    </div>
                )}

                {/* Summary Footer */}
                {ingredients.length > 0 && (
                    <div className="border-t border-white/20 mt-3 pt-3">
                        <div className="grid grid-cols-12 gap-1 text-xs">
                            <div className="col-span-5 font-bold text-white/70">TOTAL</div>
                            <div className="col-span-3 text-right">
                                <span className="text-white/50">Weight: </span>
                                <span className="font-mono font-bold text-white">
                                    {ingredients.reduce((sum, i) => sum + i.gramsPerRecipeUnit, 0).toFixed(2)}g
                                </span>
                            </div>
                            <div className="col-span-4 text-right">
                                <span className="text-white/50">Active: </span>
                                <span className="font-mono font-bold text-green-500">
                                    {ingredients.reduce((sum, i) => sum + (i.gramsPerRecipeUnit * i.purityPercent / 100 * 1000), 0).toFixed(0)}mg
                                </span>
                            </div>
                        </div>
                        {baseUnitSize > 0 && (
                            <div className="mt-1 text-xs text-white/50">
                                Coverage: {((ingredients.reduce((sum, i) => sum + i.gramsPerRecipeUnit, 0) / baseUnitSize) * 100).toFixed(1)}% of {baseUnitSize.toFixed(1)}g base unit
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
