import { useState, useEffect } from 'react';
import { Settings2, Save, Palette } from 'lucide-react';
import { Card } from '../ui/Card';
import { useConfig, type VolumeScale, type WeightScale, type SKUUnit } from '../../context/configContext';
import { useTheme } from '../../context/themeContext';
import { form, text, button, glass } from '../../styles/theme';

export const ConfigView = () => {
    const { config, updateBatchConfig, updateManifestConfig, updateSKUConfig } = useConfig();
    const { theme, setTheme } = useTheme();

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
                        ? `${button.primary} shadow-lg shadow-amber-500/20`
                        : button.disabled
                        }`}
                >
                    <Save size={18} />
                    {showSavedMsg ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Appearance / Theme */}
            <Card title="Appearance" icon={Palette}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-medium ${text.primary}`}>Theme</p>
                        <p className={`text-sm ${text.muted}`}>Switch between styling modes</p>
                    </div>
                    <div className="flex bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setTheme('production')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${theme === 'production'
                                    ? 'bg-white text-neutral-900 shadow-md'
                                    : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            Production
                        </button>
                        <button
                            onClick={() => setTheme('glass')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${theme === 'glass'
                                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white shadow-md'
                                    : 'text-white/60 hover:text-white/80'
                                }`}
                        >
                            Liquid Glass
                        </button>
                    </div>
                </div>
            </Card>

            {/* Batch Configuration */}
            <Card title="Batch Scaling Units" icon={Settings2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className={form.label}>
                            Measurement Type
                        </label>
                        <select
                            value={localConfig.batch.type}
                            onChange={(e) => handleUpdateBatch({ type: e.target.value as 'weight' | 'volume' })}
                            className={`w-full ${form.select}`}
                        >
                            <option value="volume">Volume-based (ml, L, fl oz)</option>
                            <option value="weight">Weight-based (g, kg)</option>
                        </select>
                    </div>

                    {localConfig.batch.type === 'volume' ? (
                        <div>
                            <label className={form.label}>
                                Volume Scale
                            </label>
                            <select
                                value={localConfig.batch.volumeScale}
                                onChange={(e) => handleUpdateBatch({ volumeScale: e.target.value as VolumeScale })}
                                className={`w-full ${form.select}`}
                            >
                                <option value="ml">Milliliters (ml)</option>
                                <option value="L">Liters (L)</option>
                                <option value="floz">Fluid Ounces (fl oz)</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className={form.label}>
                                Weight Scale
                            </label>
                            <select
                                value={localConfig.batch.weightScale}
                                onChange={(e) => handleUpdateBatch({ weightScale: e.target.value as WeightScale })}
                                className={`w-full ${form.select}`}
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
                        <label className={form.label}>
                            Weight Display
                        </label>
                        <select
                            value={localConfig.manifest.weightScale}
                            onChange={(e) => handleUpdateManifest({ weightScale: e.target.value as WeightScale })}
                            className={`w-full ${form.select}`}
                        >
                            <option value="g">Grams (g)</option>
                            <option value="kg">Kilograms (kg)</option>
                        </select>
                    </div>
                    <div>
                        <label className={form.label}>
                            Volume Display
                        </label>
                        <select
                            value={localConfig.manifest.volumeScale}
                            onChange={(e) => handleUpdateManifest({ volumeScale: e.target.value as VolumeScale })}
                            className={`w-full ${form.select}`}
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
                        <label className={form.label}>
                            Default Unit Size Type
                        </label>
                        <select
                            value={localConfig.sku.defaultUnit}
                            onChange={(e) => handleUpdateSKU({ defaultUnit: e.target.value as SKUUnit })}
                            className={`w-full ${form.select}`}
                        >
                            <option value="g">Grams (g)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="oz">Ounces (oz)</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Preview/Summary */}
            <div className={`rounded-lg p-4 transition-colors ${isDirty
                ? 'bg-amber-500/10 border border-amber-500/30'
                : `${glass.card} rounded-lg`
                }`}>
                <h3 className={`text-sm font-bold mb-2 ${isDirty ? 'text-amber-300' : text.secondary}`}>
                    {isDirty ? 'Configuration (Unsaved Changes)' : 'Current Configuration'}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className={text.muted}>Batch: </span>
                        <span className={`font-mono font-bold ${text.primary}`}>
                            {localConfig.batch.type === 'volume' ? localConfig.batch.volumeScale : localConfig.batch.weightScale}
                        </span>
                    </div>
                    <div>
                        <span className={text.muted}>Manifest: </span>
                        <span className={`font-mono font-bold ${text.primary}`}>{localConfig.manifest.weightScale}/{localConfig.manifest.volumeScale}</span>
                    </div>
                    <div>
                        <span className={text.muted}>SKU: </span>
                        <span className={`font-mono font-bold ${text.primary}`}>{localConfig.sku.defaultUnit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
