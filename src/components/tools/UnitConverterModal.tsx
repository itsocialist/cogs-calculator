import React, { useState, useCallback } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { DraggableToolPanel } from '../ui/DraggableToolPanel';

interface UnitConverterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ConversionType = 'weight' | 'volume' | 'temperature';

const weightUnits = ['g', 'oz', 'kg', 'lb'] as const;
const volumeUnits = ['ml', 'floz', 'L', 'gal'] as const;
const tempUnits = ['C', 'F'] as const;

// Conversion factors to base unit (g for weight, ml for volume)
const weightToGrams: Record<string, number> = {
    g: 1,
    oz: 28.3495,
    kg: 1000,
    lb: 453.592,
};

const volumeToMl: Record<string, number> = {
    ml: 1,
    floz: 29.5735,
    L: 1000,
    gal: 3785.41,
};

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({ isOpen, onClose }) => {
    const [conversionType, setConversionType] = useState<ConversionType>('weight');
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState('g');
    const [toUnit, setToUnit] = useState('oz');

    const getUnits = useCallback(() => {
        switch (conversionType) {
            case 'weight': return weightUnits;
            case 'volume': return volumeUnits;
            case 'temperature': return tempUnits;
        }
    }, [conversionType]);

    const convert = useCallback(() => {
        const value = parseFloat(inputValue) || 0;

        if (conversionType === 'temperature') {
            if (fromUnit === 'C' && toUnit === 'F') {
                return (value * 9 / 5) + 32;
            } else if (fromUnit === 'F' && toUnit === 'C') {
                return (value - 32) * 5 / 9;
            }
            return value;
        }

        if (conversionType === 'weight') {
            const inGrams = value * weightToGrams[fromUnit];
            return inGrams / weightToGrams[toUnit];
        }

        if (conversionType === 'volume') {
            const inMl = value * volumeToMl[fromUnit];
            return inMl / volumeToMl[toUnit];
        }

        return value;
    }, [conversionType, inputValue, fromUnit, toUnit]);

    const handleTypeChange = (type: ConversionType) => {
        setConversionType(type);
        const units = type === 'weight' ? weightUnits : type === 'volume' ? volumeUnits : tempUnits;
        setFromUnit(units[0]);
        setToUnit(units[1]);
    };

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const formatUnit = (unit: string) => {
        if (unit === 'floz') return 'fl oz';
        if (unit === 'C') return '°C';
        if (unit === 'F') return '°F';
        return unit;
    };

    if (!isOpen) return null;

    return (
        <DraggableToolPanel
            title="Unit Converter"
            isOpen={isOpen}
            onClose={onClose}
            width="w-full max-w-md"
            icon={ArrowRightLeft}
            initialPosition={{ x: window.innerWidth / 2 - 100, y: 150 }}
        >
            {/* Type Tabs */}
            <div className="flex gap-2 mb-6">
                {(['weight', 'volume', 'temperature'] as ConversionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${conversionType === type
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/10 text-white/60 hover:bg-white/15'
                            }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* Converter */}
            <div className="space-y-4">
                {/* From */}
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="Enter value"
                    />
                    <select
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        {getUnits().map((unit) => (
                            <option key={unit} value={unit} className="bg-stone-900">{formatUnit(unit)}</option>
                        ))}
                    </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <button
                        onClick={swapUnits}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowRightLeft size={20} className="rotate-90" />
                    </button>
                </div>

                {/* To (Result) */}
                <div className="flex gap-3">
                    <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-lg font-mono font-bold">
                        {convert().toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <select
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                        {getUnits().map((unit) => (
                            <option key={unit} value={unit} className="bg-stone-900">{formatUnit(unit)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Reference */}
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/40">
                {conversionType === 'weight' && '1 oz = 28.35g • 1 lb = 453.59g • 1 kg = 1000g'}
                {conversionType === 'volume' && '1 fl oz = 29.57ml • 1 gal = 3785.41ml • 1 L = 1000ml'}
                {conversionType === 'temperature' && '°F = (°C × 9/5) + 32 • °C = (°F - 32) × 5/9'}
            </div>
        </DraggableToolPanel>
    );
};
