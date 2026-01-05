import React, { useState, useCallback } from 'react';
import { X, FlaskConical, Target, Scale } from 'lucide-react';

interface DosageCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({ isOpen, onClose }) => {
    const [targetPotency, setTargetPotency] = useState('100'); // mg per unit
    const [concentration, setConcentration] = useState('85'); // % purity/concentration
    const [numberOfUnits, setNumberOfUnits] = useState('100'); // units to produce

    const calculateMaterial = useCallback(() => {
        const potencyMg = parseFloat(targetPotency) || 0;
        const purityPercent = parseFloat(concentration) || 0;
        const units = parseFloat(numberOfUnits) || 0;

        if (purityPercent === 0) return { perUnit: 0, total: 0, activeMgTotal: 0 };

        // Material needed per unit (in grams)
        const materialPerUnitGrams = (potencyMg / 1000) / (purityPercent / 100);
        const totalMaterialGrams = materialPerUnitGrams * units;

        return {
            perUnit: materialPerUnitGrams,
            total: totalMaterialGrams,
            activeMgTotal: potencyMg * units,
        };
    }, [targetPotency, concentration, numberOfUnits]);

    const result = calculateMaterial();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-stone-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FlaskConical size={20} className="text-green-400" />
                        <h2 className="text-lg font-bold text-white">Dosage Calculator</h2>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                    {/* Target Potency */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Target size={14} />
                            Target Potency (per unit)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={targetPotency}
                                onChange={(e) => setTargetPotency(e.target.value)}
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                placeholder="100"
                            />
                            <span className="text-white/60 font-medium">mg</span>
                        </div>
                    </div>

                    {/* Concentration */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <FlaskConical size={14} />
                            Material Concentration/Purity
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={concentration}
                                onChange={(e) => setConcentration(e.target.value)}
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                placeholder="85"
                                step="0.1"
                            />
                            <span className="text-white/60 font-medium">%</span>
                        </div>
                    </div>

                    {/* Number of Units */}
                    <div>
                        <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                            <Scale size={14} />
                            Number of Units
                        </label>
                        <input
                            type="number"
                            value={numberOfUnits}
                            onChange={(e) => setNumberOfUnits(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50"
                            placeholder="100"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="mt-6 space-y-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="text-sm text-green-400/60 mb-1">Material Required (per unit)</div>
                        <div className="text-2xl font-bold text-green-400 font-mono">
                            {result.perUnit.toFixed(4)}g
                        </div>
                        <div className="text-xs text-green-400/50 mt-1">
                            = {(result.perUnit * 1000).toFixed(2)}mg raw material
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <div className="text-sm text-amber-400/60 mb-1">Total Material for Batch</div>
                        <div className="text-2xl font-bold text-amber-400 font-mono">
                            {result.total >= 1000
                                ? `${(result.total / 1000).toFixed(3)}kg`
                                : `${result.total.toFixed(2)}g`
                            }
                        </div>
                        <div className="text-xs text-amber-400/50 mt-1">
                            = {(result.activeMgTotal / 1000).toFixed(2)}g active cannabinoids
                        </div>
                    </div>
                </div>

                {/* Formula Reference */}
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
                    <strong>Formula:</strong> Material (g) = (Target mg ÷ 1000) ÷ (Concentration ÷ 100)
                </div>
            </div>
        </div>
    );
};
