import { Settings2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { useConfig, type VolumeScale, type WeightScale, type SKUUnit } from '../../context/configContext';

export const ConfigView = () => {
    const { config, updateBatchConfig, updateManifestConfig, updateSKUConfig } = useConfig();

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Batch Configuration */}
            <Card title="Batch Scaling Units" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                            Measurement Type
                        </label>
                        <select
                            value={config.batch.type}
                            onChange={(e) => updateBatchConfig({ type: e.target.value as 'weight' | 'volume' })}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                        >
                            <option value="volume">Volume-based (ml, L, fl oz)</option>
                            <option value="weight">Weight-based (g, kg)</option>
                        </select>
                    </div>

                    {config.batch.type === 'volume' ? (
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                                Volume Scale
                            </label>
                            <select
                                value={config.batch.volumeScale}
                                onChange={(e) => updateBatchConfig({ volumeScale: e.target.value as VolumeScale })}
                                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                            >
                                <option value="ml">Milliliters (ml)</option>
                                <option value="L">Liters (L)</option>
                                <option value="floz">Fluid Ounces (fl oz)</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                                Weight Scale
                            </label>
                            <select
                                value={config.batch.weightScale}
                                onChange={(e) => updateBatchConfig({ weightScale: e.target.value as WeightScale })}
                                className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                            >
                                <option value="g">Grams (g)</option>
                                <option value="kg">Kilograms (kg)</option>
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            {/* Manifest Display */}
            <Card title="Manifest Display Units" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                            Weight Display
                        </label>
                        <select
                            value={config.manifest.weightScale}
                            onChange={(e) => updateManifestConfig({ weightScale: e.target.value as WeightScale })}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                        >
                            <option value="g">Grams (g)</option>
                            <option value="kg">Kilograms (kg)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                            Volume Display
                        </label>
                        <select
                            value={config.manifest.volumeScale}
                            onChange={(e) => updateManifestConfig({ volumeScale: e.target.value as VolumeScale })}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                        >
                            <option value="ml">Milliliters (ml)</option>
                            <option value="L">Liters (L)</option>
                            <option value="floz">Fluid Ounces (fl oz)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* SKU Defaults */}
            <Card title="SKU Defaults" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                            Default Unit Size Type
                        </label>
                        <select
                            value={config.sku.defaultUnit}
                            onChange={(e) => updateSKUConfig({ defaultUnit: e.target.value as SKUUnit })}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                        >
                            <option value="g">Grams (g)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="oz">Ounces (oz)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Preview/Summary */}
            <div className="bg-slate-100 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Current Configuration</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className="text-slate-500">Batch: </span>
                        <span className="font-mono font-bold">
                            {config.batch.type === 'volume' ? config.batch.volumeScale : config.batch.weightScale}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Manifest: </span>
                        <span className="font-mono font-bold">{config.manifest.weightScale}/{config.manifest.volumeScale}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">SKU: </span>
                        <span className="font-mono font-bold">{config.sku.defaultUnit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
