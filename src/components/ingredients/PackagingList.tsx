import { Package } from 'lucide-react';
import { Card } from '../ui/Card';
import { NumberInput } from '../ui/NumberInput';
import type { PackagingItem } from '../../lib/types';

interface Props {
    items: PackagingItem[];
    onUpdate: (items: PackagingItem[]) => void;
}

export const PackagingList = ({ items, onUpdate }: Props) => {
    const updateItem = (id: number, field: keyof PackagingItem, value: string | number) => {
        onUpdate(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    return (
        <Card title="Packaging Configuration" icon={Package}>
            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-neutral-400 uppercase">{item.name}</label>
                            <div className="text-sm font-medium">{item.name}</div>
                        </div>
                        <div className="w-32">
                            <NumberInput
                                label="Cost / Unit"
                                value={item.costPerUnit}
                                onChange={(v) => updateItem(item.id, 'costPerUnit', v)}
                                prefix="$"
                                step={0.01}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
