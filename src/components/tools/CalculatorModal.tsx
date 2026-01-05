import React, { useState, useCallback } from 'react';
import { X, Delete, Divide, Minus, Plus, X as Multiply, Equal, RotateCcw } from 'lucide-react';

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [newNumber, setNewNumber] = useState(true);
    const [memory, setMemory] = useState(0);

    const handleNumber = useCallback((num: string) => {
        if (newNumber) {
            setDisplay(num);
            setNewNumber(false);
        } else {
            setDisplay(prev => prev === '0' ? num : prev + num);
        }
    }, [newNumber]);

    const handleDecimal = useCallback(() => {
        if (newNumber) {
            setDisplay('0.');
            setNewNumber(false);
        } else if (!display.includes('.')) {
            setDisplay(prev => prev + '.');
        }
    }, [display, newNumber]);

    const handleOperation = useCallback((op: string) => {
        const current = parseFloat(display);

        if (previousValue !== null && operation && !newNumber) {
            const result = calculate(previousValue, current, operation);
            setDisplay(String(result));
            setPreviousValue(result);
        } else {
            setPreviousValue(current);
        }

        setOperation(op);
        setNewNumber(true);
    }, [display, previousValue, operation, newNumber]);

    const calculate = (a: number, b: number, op: string): number => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 0;
            default: return b;
        }
    };

    const handleEquals = useCallback(() => {
        if (previousValue !== null && operation) {
            const current = parseFloat(display);
            const result = calculate(previousValue, current, operation);
            setDisplay(String(result));
            setPreviousValue(null);
            setOperation(null);
            setNewNumber(true);
        }
    }, [display, previousValue, operation]);

    const handleClear = useCallback(() => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setNewNumber(true);
    }, []);

    const handleBackspace = useCallback(() => {
        if (!newNumber && display.length > 1) {
            setDisplay(prev => prev.slice(0, -1));
        } else {
            setDisplay('0');
            setNewNumber(true);
        }
    }, [display, newNumber]);

    const handlePercent = useCallback(() => {
        const current = parseFloat(display);
        setDisplay(String(current / 100));
        setNewNumber(true);
    }, [display]);

    // Memory functions
    const handleMemoryAdd = useCallback(() => {
        setMemory(prev => prev + parseFloat(display));
    }, [display]);

    const handleMemorySubtract = useCallback(() => {
        setMemory(prev => prev - parseFloat(display));
    }, [display]);

    const handleMemoryRecall = useCallback(() => {
        setDisplay(String(memory));
        setNewNumber(true);
    }, [memory]);

    const handleMemoryClear = useCallback(() => {
        setMemory(0);
    }, []);

    if (!isOpen) return null;

    const Button = ({ onClick, children, className = '', wide = false }: {
        onClick: () => void;
        children: React.ReactNode;
        className?: string;
        wide?: boolean;
    }) => (
        <button
            onClick={onClick}
            className={`${wide ? 'col-span-2' : ''} py-3 rounded-lg font-medium text-lg transition-colors ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-stone-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-full max-w-xs shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white/60 uppercase tracking-wide">Calculator</h2>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Memory Indicator */}
                {memory !== 0 && (
                    <div className="text-xs text-amber-400 mb-1">M: {memory}</div>
                )}

                {/* Display */}
                <div className="bg-black/40 rounded-lg p-4 mb-3">
                    <div className="text-xs text-white/40 h-4">
                        {previousValue !== null && `${previousValue} ${operation}`}
                    </div>
                    <div className="text-3xl font-mono font-bold text-white text-right truncate">
                        {display}
                    </div>
                </div>

                {/* Memory Buttons */}
                <div className="grid grid-cols-4 gap-1 mb-2">
                    <Button onClick={handleMemoryClear} className="bg-white/5 text-white/50 hover:bg-white/10 text-xs">MC</Button>
                    <Button onClick={handleMemoryRecall} className="bg-white/5 text-white/50 hover:bg-white/10 text-xs">MR</Button>
                    <Button onClick={handleMemorySubtract} className="bg-white/5 text-white/50 hover:bg-white/10 text-xs">M-</Button>
                    <Button onClick={handleMemoryAdd} className="bg-white/5 text-white/50 hover:bg-white/10 text-xs">M+</Button>
                </div>

                {/* Calculator Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={handleClear} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        <RotateCcw size={18} className="mx-auto" />
                    </Button>
                    <Button onClick={handleBackspace} className="bg-white/10 text-white/70 hover:bg-white/20">
                        <Delete size={18} className="mx-auto" />
                    </Button>
                    <Button onClick={handlePercent} className="bg-white/10 text-white/70 hover:bg-white/20">%</Button>
                    <Button onClick={() => handleOperation('÷')} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        <Divide size={18} className="mx-auto" />
                    </Button>

                    <Button onClick={() => handleNumber('7')} className="bg-white/10 text-white hover:bg-white/20">7</Button>
                    <Button onClick={() => handleNumber('8')} className="bg-white/10 text-white hover:bg-white/20">8</Button>
                    <Button onClick={() => handleNumber('9')} className="bg-white/10 text-white hover:bg-white/20">9</Button>
                    <Button onClick={() => handleOperation('×')} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        <Multiply size={18} className="mx-auto" />
                    </Button>

                    <Button onClick={() => handleNumber('4')} className="bg-white/10 text-white hover:bg-white/20">4</Button>
                    <Button onClick={() => handleNumber('5')} className="bg-white/10 text-white hover:bg-white/20">5</Button>
                    <Button onClick={() => handleNumber('6')} className="bg-white/10 text-white hover:bg-white/20">6</Button>
                    <Button onClick={() => handleOperation('-')} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        <Minus size={18} className="mx-auto" />
                    </Button>

                    <Button onClick={() => handleNumber('1')} className="bg-white/10 text-white hover:bg-white/20">1</Button>
                    <Button onClick={() => handleNumber('2')} className="bg-white/10 text-white hover:bg-white/20">2</Button>
                    <Button onClick={() => handleNumber('3')} className="bg-white/10 text-white hover:bg-white/20">3</Button>
                    <Button onClick={() => handleOperation('+')} className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">
                        <Plus size={18} className="mx-auto" />
                    </Button>

                    <Button onClick={() => handleNumber('0')} wide className="bg-white/10 text-white hover:bg-white/20">0</Button>
                    <Button onClick={handleDecimal} className="bg-white/10 text-white hover:bg-white/20">.</Button>
                    <Button onClick={handleEquals} className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                        <Equal size={18} className="mx-auto" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
