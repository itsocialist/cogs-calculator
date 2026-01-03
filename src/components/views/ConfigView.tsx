import { useState, useEffect } from 'react';
import { Settings2, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { useConfig, type VolumeScale, type WeightScale, type SKUUnit } from '../../context/configContext';

export const ConfigView = () => {
    const { config, updateBatchConfig, updateManifestConfig, updateSKUConfig } = useConfig();

    // Local state for pending changes
    const [localConfig, setLocalConfig] = useState(config);
    const [isDirty, setIsDirty] = useState(false);
    const [showSavedMsg, setShowSavedMsg] = useState(false);

    // Sync local state when config changes (initial load)
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleUpdateBatch = (updates: Partial<typeof config.batch>) => {
        setLocalConfig(prev => ({ ...prev, batch: { ...prev.batch, ...updates } }));
        setIsDirty(true);
    };

    const handleUpdateManifest = (updates: Partial<typeof config.manifest>) => {
        setLocalConfig(prev => ({ ...prev, manifest: { ...prev.manifest, ...updates } }));
        setIsDirty(true);
    };

    const handleUpdateSKU = (updates: Partial<typeof config.sku>) => {
        setLocalConfig(prev => ({ ...prev, sku: { ...prev.sku, ...updates } }));
        setIsDirty(true);
    };

    const handleSave = () => {
        // Apply all changes to context
        updateBatchConfig(localConfig.batch);
        updateManifestConfig(localConfig.manifest);
        updateSKUConfig(localConfig.sku);

        setIsDirty(false);
        setShowSavedMsg(true);
        setTimeout(() => setShowSavedMsg(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header with Save Action */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isDirty
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    <Save size={18} />
                    {showSavedMsg ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Batch Configuration */}
            <Card title="Batch Scaling Units" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                            Measurement Type
                        </label>
                        <select
                            value={localConfig.batch.type}
                            onChange={(e) => handleUpdateBatch({ type: e.target.value as 'weight' | 'volume' })}
                            className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 font-medium"
                        >
                            <option value="volume">Volume-based (ml, L, fl oz)</option>
                            <option value="weight">Weight-based (g, kg)</option>
                        </select>
                    </div>

                    {localConfig.batch.type === 'volume' ? (
                        <div>
                            <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                                Volume Scale
                            </label>
                            <select
                                value={localConfig.batch.volumeScale}
                                onChange={(e) => handleUpdateBatch({ volumeScale: e.target.value as VolumeScale })}
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
                                value={localConfig.batch.weightScale}
                                onChange={(e) => handleUpdateBatch({ weightScale: e.target.value as WeightScale })}
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
                            value={localConfig.manifest.weightScale}
                            onChange={(e) => handleUpdateManifest({ weightScale: e.target.value as WeightScale })}
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
                            value={localConfig.manifest.volumeScale}
                            onChange={(e) => handleUpdateManifest({ volumeScale: e.target.value as VolumeScale })}
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
                            value={localConfig.sku.defaultUnit}
                            onChange={(e) => handleUpdateSKU({ defaultUnit: e.target.value as SKUUnit })}
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
            <div className={`rounded-lg p-4 transition-colors ${isDirty ? 'bg-blue-50 border border-blue-200' : 'bg-slate-100'}`}>
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                    {isDirty ? 'Configuration (Unsaved Changes)' : 'Current Configuration'}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className="text-slate-500">Batch: </span>
                        <span className="font-mono font-bold">
                            {localConfig.batch.type === 'volume' ? localConfig.batch.volumeScale : localConfig.batch.weightScale}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500">Manifest: </span>
                        <span className="font-mono font-bold">{localConfig.manifest.weightScale}/{localConfig.manifest.volumeScale}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">SKU: </span>
                        <span className="font-mono font-bold">{localConfig.sku.defaultUnit}</span>
                    </div>
                </div>
            </div>"
        </div>
    );
};
