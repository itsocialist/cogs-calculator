import { useState } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle, Zap, Calculator, Bug, Lightbulb, Settings } from 'lucide-react';
import { useCalculator } from '../../hooks/useCalculator';

interface HelpSectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    level?: 'basic' | 'intermediate' | 'advanced';
}

const levelColors = {
    basic: 'bg-green-50 border-green-200 text-green-700',
    intermediate: 'bg-blue-50 border-blue-200 text-blue-700',
    advanced: 'bg-purple-50 border-purple-200 text-purple-700'
};

const levelLabels = {
    basic: '📗 Basic',
    intermediate: '📘 Intermediate',
    advanced: '📕 Advanced'
};

function HelpSection({ title, icon, children, defaultOpen = false, level = 'basic' }: HelpSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between p-3 text-left hover:bg-neutral-50 transition-colors ${isOpen ? 'bg-neutral-50' : ''}`}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-neutral-900">{title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[level]}`}>
                        {levelLabels[level]}
                    </span>
                </div>
                {isOpen ? <ChevronDown size={18} className="text-neutral-400" /> : <ChevronRight size={18} className="text-neutral-400" />}
            </button>
            {isOpen && (
                <div className="p-4 pt-2 border-t bg-white text-sm text-neutral-600 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
}

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    calculatorData?: ReturnType<typeof useCalculator>;
}

export function HelpModal({ isOpen, onClose, calculatorData }: HelpModalProps) {
    if (!isOpen) return null;

    // Debug data from calculator
    const debugData = calculatorData ? {
        batchVolumeMl: calculatorData.batchConfig.targetVolumeMl,
        batchWeightG: calculatorData.batchConfig.targetVolumeMl * calculatorData.recipeConfig.density,
        density: calculatorData.recipeConfig.density,
        baseUnitSize: calculatorData.recipeConfig.baseUnitSize,
        totalFormulaMg: calculatorData.totalActiveMg,
        totalBatchWeightG: calculatorData.totalBatchWeightGrams,
        mgPerGram: calculatorData.totalBatchWeightGrams > 0
            ? (calculatorData.totalActiveMg / calculatorData.totalBatchWeightGrams).toFixed(4)
            : 0,
        skuCount: calculatorData.skus.length,
        skuCalculations: calculatorData.skuCalculations
    } : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="text-yellow-500" size={24} />
                        <h2 className="text-xl font-black text-neutral-900">Help & Documentation</h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                    {/* Level 1: How to Use (Basic) */}
                    <HelpSection
                        title="How to Use"
                        icon={<Zap size={18} className="text-green-600" />}
                        level="basic"
                        defaultOpen={true}
                    >
                        <ol className="space-y-2 list-decimal list-inside">
                            <li><strong>Set Base Unit</strong> — Define your recipe's base unit (default: 1 fl oz)</li>
                            <li><strong>Add Ingredients</strong> — Enter active (cannabinoids) and inactive ingredients with costs (defaults to grams)</li>
                            <li><strong>Set Batch Volume</strong> — Enter how much you're making (in L, ml, or fl oz)</li>
                            <li><strong>Configure SKUs</strong> — Define product sizes, quantities, and pricing</li>
                            <li><strong>Review KPIs</strong> — Check COGS, margins, and potency at the top</li>
                            <li><strong>Use Math Panel</strong> — Click "Math" to see detailed calculation breakdown</li>
                            <li><strong>Take Notes</strong> — Click "Notes" to save notes and sticky notes</li>
                        </ol>
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                            💡 <strong>Tip:</strong> All calculations work directly in the UI - no JSON required! Ingredients default to grams (g) for easy entry. Use sticky notes for quick reminders, or the notepad for detailed notes.
                        </div>
                    </HelpSection>

                    {/* Level 2: How Calculations Work (Intermediate) */}
                    <HelpSection
                        title="How Calculations Work"
                        icon={<Calculator size={18} className="text-blue-600" />}
                        level="intermediate"
                    >
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-neutral-800 mb-1">Potency Calculation</h4>
                                <div className="bg-slate-100 p-2 rounded font-mono text-xs">
                                    mgPerGram = totalActiveMg ÷ totalBatchWeightG<br />
                                    potencyPerSKU = mgPerGram × skuSizeInGrams
                                </div>
                                <p className="text-xs mt-1 text-neutral-500">
                                    Potency is based purely on formula concentration, not batch scaling.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-neutral-800 mb-1">Cost Breakdown</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• <strong>COGS/Unit</strong> = (Ingredients + Labor + Packaging) ÷ Total Units</li>
                                    <li>• <strong>Landed Cost</strong> = COGS + Lab + Shipping + Distribution %</li>
                                    <li>• <strong>Margin</strong> = Wholesale Price − Landed Cost</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-neutral-800 mb-1">Unit Conversions</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>1 fl oz = 29.574 ml</div>
                                    <div>1 oz (weight) = 28.35 g</div>
                                    <div>1 cup = 236.6 ml</div>
                                    <div>1 tbsp = 14.8 ml</div>
                                    <div>1 tsp = 4.9 ml</div>
                                    <div>Salve density ≈ 0.95 g/ml</div>
                                </div>
                            </div>
                        </div>
                    </HelpSection>

                    {/* Level 3: Debug Insights (Advanced) */}
                    <HelpSection
                        title="Debug Insights"
                        icon={<Bug size={18} className="text-purple-600" />}
                        level="advanced"
                    >
                        {debugData ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-neutral-800 mb-2">Current Batch State</h4>
                                    <div className="bg-slate-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                        <pre>{JSON.stringify({
                                            batch: {
                                                volumeMl: debugData.batchVolumeMl,
                                                weightG: Math.round(debugData.batchWeightG),
                                                density: debugData.density
                                            },
                                            recipe: {
                                                baseUnitSizeG: debugData.baseUnitSize,
                                                calculatedUnits: Math.floor(debugData.batchWeightG / debugData.baseUnitSize)
                                            },
                                            formula: {
                                                totalActiveMg: Math.round(debugData.totalFormulaMg),
                                                totalWeightG: Math.round(debugData.totalBatchWeightG),
                                                mgPerGram: debugData.mgPerGram
                                            }
                                        }, null, 2)}</pre>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-neutral-800 mb-2">SKU Potency Breakdown</h4>
                                    <div className="bg-slate-800 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                        <pre>{JSON.stringify(
                                            debugData.skuCalculations.map(sku => ({
                                                name: sku.name,
                                                sizeG: Math.round(sku.unitSizeGrams * 100) / 100,
                                                potencyMg: Math.round(sku.potencyMg),
                                            }))
                                            , null, 2)}</pre>
                                    </div>
                                </div>

                                <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                                    <strong>Debug Formula:</strong><br />
                                    potency = ({debugData.mgPerGram} mg/g) × skuSizeGrams
                                </div>
                            </div>
                        ) : (
                            <p className="text-neutral-500 italic">
                                Calculator data not available. Close and reopen Help from the Manufacturing tab to see live debug data.
                            </p>
                        )}
                    </HelpSection>

                    {/* Additional Sections */}
                    <HelpSection
                        title="Config Settings"
                        icon={<Settings size={18} className="text-slate-600" />}
                        level="basic"
                    >
                        <p>The <strong>Config tab</strong> lets you customize display units:</p>
                        <ul className="mt-2 space-y-1 text-xs">
                            <li>• <strong>Batch</strong>: Weight (g/kg) or Volume (ml/L/fl oz)</li>
                            <li>• <strong>Manifest</strong>: Display scale for weights and volumes</li>
                            <li>• <strong>SKU Defaults</strong>: Default unit for new SKUs (g/ml/oz)</li>
                        </ul>
                        <p className="mt-2 text-xs text-neutral-500">Settings persist to your browser's localStorage.</p>
                    </HelpSection>

                    <HelpSection
                        title="Updates (v0.1.2)"
                        icon={<Zap size={18} className="text-orange-500" />}
                        level="basic"
                        defaultOpen={true}
                    >
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-bold text-green-800 mb-1">🐛 Bug Fix: Potency Calculations (#17)</h4>
                                <p className="text-xs text-green-700">
                                    <strong>Fixed potency display:</strong> Both the KPI Grid and Accounting Tape now correctly show potency per <em>base recipe unit</em> instead of SKU potency.
                                </p>
                                <p className="text-xs text-green-700 mt-2">
                                    <strong>Example:</strong> For a 1oz base unit with 500mg target, the display now shows ~500mg instead of incorrectly showing the 2oz SKU potency (1053mg).
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-bold text-blue-800 mb-1">✨ New Feature: Cost Per Unit (#18)</h4>
                                <p className="text-xs text-blue-700">
                                    <strong>Ingredients Manifest:</strong> Added new <code className="bg-blue-100 px-1 rounded">$/Unit</code> column showing the cost per base recipe unit for each ingredient.
                                </p>
                                <p className="text-xs text-blue-700 mt-2">
                                    This helps you understand unit economics at a glance. The column appears in both the table view and CSV/PDF exports.
                                </p>
                            </div>
                        </div>
                    </HelpSection>

                    <HelpSection
                        title="Previous Updates (v0.1.1)"
                        icon={<Zap size={18} className="text-gray-500" />}
                        level="basic"
                    >
                        <div className="space-y-3">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-bold text-blue-800 mb-1">✨ UX Improvements</h4>
                                <p className="text-xs text-blue-700">
                                    <strong>Ingredient Defaults:</strong> Inactive ingredients now default to grams (g) instead of cups for consistency with active ingredients.
                                </p>
                                <p className="text-xs text-blue-700 mt-2">
                                    <strong>Help Documentation:</strong> Clarified that JSON format is not required - all calculations work directly in the UI!
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-bold text-green-800 mb-1">🐛 Bug Fix: COST/GRAM KPI</h4>
                                <p className="text-xs text-green-700">
                                    Fixed the COST/GRAM KPI always showing <code className="bg-green-100 px-1 rounded">$0.000</code>.
                                    The KPI now correctly displays cost per gram and batch weight in kilograms.
                                </p>
                            </div>
                        </div>
                    </HelpSection>

                    <HelpSection
                        title="Tips & Best Practices"
                        icon={<Lightbulb size={18} className="text-amber-500" />}
                        level="basic"
                    >
                        <ul className="space-y-2">
                            <li>✅ <strong>Start with your recipe</strong> — Define base unit first, then add ingredients</li>
                            <li>✅ <strong>Check the formula weight</strong> — Should be close to batch weight (green = OK, red = over)</li>
                            <li>✅ <strong>Use Snapshots</strong> — Save different formulations to compare costs</li>
                            <li>✅ <strong>Industry standard</strong> — Cannabis salves typically label as "500mg CBD per 1oz jar"</li>
                            <li>⚠️ <strong>Weight allocation</strong> — Don't over-allocate SKU quantities beyond batch size</li>
                        </ul>
                    </HelpSection>
                </div>

                {/* Footer */}
                <div className="border-t p-3 bg-neutral-50 text-center text-xs text-neutral-400 shrink-0">
                    Click section headers to expand/collapse • Settings persist automatically
                </div>
            </div>
        </div>
    );
}
