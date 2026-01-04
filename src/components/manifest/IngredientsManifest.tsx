import { ClipboardList, Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Card } from '../ui/Card';
import { SpotlightCard } from '../ui/SpotlightCard';
import { useConfig } from '../../context/configContext';
import type { RecipeConfig, ActiveIngredient, InactiveIngredient } from '../../lib/types';

interface ManifestItem {
    id: number;
    name: string;
    type: 'active' | 'base' | 'carrier' | 'terpene';
    amountPerUnit: number;
    scaledAmount: number;
    unit: string;
    costPerKg: number;
    totalCost: number;
}

interface Props {
    recipeConfig: RecipeConfig;
    activeIngredients: ActiveIngredient[];
    inactiveIngredients: InactiveIngredient[];
    batchSizeKg: number;
}

export const IngredientsManifest = ({
    recipeConfig,
    activeIngredients,
    inactiveIngredients,
    batchSizeKg
}: Props) => {
    const { config, convertFromGrams, convertFromMl } = useConfig();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate how many base units in the batch
    const batchWeightGrams = batchSizeKg * 1000;
    const baseUnits = recipeConfig.baseUnitSize > 0
        ? batchWeightGrams / recipeConfig.baseUnitSize
        : 0;



    // Generate manifest items
    // Generate manifest items
    const manifestItems: ManifestItem[] = [
        ...activeIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            type: ing.type as 'active',
            amountPerUnit: ing.amount,
            scaledAmount: ing.gramsInBatch,
            unit: ing.unit,
            costPerKg: ing.costPerKg,
            totalCost: (ing.gramsInBatch / 1000) * ing.costPerKg
        })),
        ...inactiveIngredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            type: ing.type,
            amountPerUnit: ing.amount,
            scaledAmount: ing.gramsInBatch,
            unit: ing.unit,
            costPerKg: ing.costPerKg,
            totalCost: (ing.gramsInBatch / 1000) * ing.costPerKg
        }))
    ];

    // Totals
    const totalWeight = manifestItems.reduce((sum, item) => sum + item.scaledAmount, 0);
    const totalCost = manifestItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalVolumeMl = totalWeight / recipeConfig.density;

    // Export as CSV
    const handleExportCSV = () => {
        const headers = ['Ingredient', 'Type', 'Per Unit (g)', 'Unit', 'Total (g)', 'Volume (ml)', 'Cost'];
        const rows = manifestItems.map(item => [
            item.name,
            item.type,
            item.amountPerUnit.toFixed(2),
            item.unit,
            item.scaledAmount.toFixed(1),
            (item.scaledAmount / recipeConfig.density).toFixed(1),
            item.totalCost.toFixed(2)
        ]);

        // Add totals row
        rows.push(['TOTAL', '', '', '', totalWeight.toFixed(1), totalVolumeMl.toFixed(0), totalCost.toFixed(2)]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    // Export as professional PO-style PDF (via print)
    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to generate PDF');
            return;
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Purchase Order - ${recipeConfig.baseUnitLabel}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            padding: 40px; 
            color: #1a1a1a;
            font-size: 12px;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            border-bottom: 3px solid #1a1a1a;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name { 
            font-size: 28px; 
            font-weight: 900; 
            letter-spacing: -0.5px;
        }
        .document-title {
            font-size: 18px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: right;
        }
        .document-date {
            text-align: right;
            color: #666;
            margin-top: 4px;
        }
        .meta-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .meta-box {
            background: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
        }
        .meta-label { 
            font-size: 10px; 
            text-transform: uppercase; 
            color: #666; 
            font-weight: 700;
            margin-bottom: 4px;
        }
        .meta-value { 
            font-size: 16px; 
            font-weight: 700; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
        }
        th { 
            background: #1a1a1a; 
            color: white; 
            padding: 12px 10px; 
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
        }
        th:last-child, td:last-child { text-align: right; }
        td { 
            padding: 10px; 
            border-bottom: 1px solid #e0e0e0;
        }
        .type-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .type-active { background: #dbeafe; color: #1d4ed8; }
        .type-base { background: #fef3c7; color: #b45309; }
        .type-carrier { background: #d1fae5; color: #047857; }
        .type-terpene { background: #ede9fe; color: #6d28d9; }
        .totals-row { 
            background: #f0f0f0; 
            font-weight: 700;
        }
        .totals-row td { border-bottom: 2px solid #1a1a1a; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }
        .summary-box {
            text-align: center;
            padding: 15px;
            background: #f8f8f8;
            border-radius: 4px;
        }
        .summary-label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: 700; }
        .summary-value { font-size: 20px; font-weight: 900; margin-top: 5px; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #999;
        }
        @media print {
            body { padding: 20px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="company-name">ROLOS KITCHEN</div>
            <div style="color: #666; margin-top: 4px;">Manufacturing Purchase Order</div>
        </div>
        <div>
            <div class="document-title">Materials Manifest</div>
            <div class="document-date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
    </div>
    
    <div class="meta-section">
        <div class="meta-box">
            <div class="meta-label">Product</div>
            <div class="meta-value">${recipeConfig.baseUnitLabel}</div>
        </div>
        <div class="meta-box">
            <div class="meta-label">Batch Size</div>
            <div class="meta-value">${batchSizeKg}kg (${baseUnits.toFixed(0)} units)</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Ingredient</th>
                <th>Type</th>
                <th>Per Unit</th>
                <th>Total Weight</th>
                <th>Volume</th>
                <th>Cost</th>
            </tr>
        </thead>
        <tbody>
            ${manifestItems.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="type-badge type-${item.type}">${item.type}</span></td>
                    <td>${item.amountPerUnit.toFixed(2)}g</td>
                    <td>${item.scaledAmount.toFixed(1)}g</td>
                    <td>${(item.scaledAmount / recipeConfig.density).toFixed(1)}ml</td>
                    <td>$${item.totalCost.toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="totals-row">
                <td colspan="3"><strong>TOTAL</strong></td>
                <td><strong>${totalWeight.toFixed(1)}g</strong></td>
                <td><strong>${totalVolumeMl.toFixed(0)}ml</strong></td>
                <td><strong>$${totalCost.toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>
    
    <div class="summary-grid">
        <div class="summary-box">
            <div class="summary-label">Base Units</div>
            <div class="summary-value">${baseUnits.toFixed(0)}</div>
        </div>
        <div class="summary-box">
            <div class="summary-label">Total Weight</div>
            <div class="summary-value">${(totalWeight / 1000).toFixed(2)}kg</div>
        </div>
        <div class="summary-box">
            <div class="summary-label">Total Volume</div>
            <div class="summary-value">${(totalVolumeMl / 1000).toFixed(2)}L</div>
        </div>
        <div class="summary-box">
            <div class="summary-label">Materials Cost</div>
            <div class="summary-value">$${totalCost.toFixed(2)}</div>
        </div>
    </div>
    
    <div class="footer">
        <span>Generated by ROLOS KITCHEN COGS Calculator</span>
        <span>Document ID: MFG-${Date.now().toString(36).toUpperCase()}</span>
    </div>
    
    <script>window.onload = () => window.print();</script>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        setShowExportMenu(false);
    };

    // Type color mapping - glass with subtle accent
    const typeColors: Record<string, string> = {
        active: 'bg-blue-500/30 text-blue-200',
        base: 'bg-amber-500/30 text-amber-200',
        carrier: 'bg-emerald-500/30 text-emerald-200',
        terpene: 'bg-purple-500/30 text-purple-200'
    };

    return (
        <Card
            title="Ingredients Manifest"
            icon={ClipboardList}
            subtitle={`${baseUnits.toFixed(0)} units × ${recipeConfig.baseUnitLabel}`}
            collapsible
            action={
                <div className="flex items-center gap-2">
                    {/* Export Dropdown */}
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded bg-white/15 backdrop-blur-sm text-white/80 hover:bg-white/25 text-xs font-medium transition-colors"
                            title="Export manifest"
                        >
                            <Download size={14} />
                            Export
                            <ChevronDown size={12} />
                        </button>

                        {showExportMenu && (
                            <div
                                className="absolute right-0 top-full mt-1 w-48 bg-stone-900 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                                onMouseEnter={(e) => e.stopPropagation()}
                                onMouseMove={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleExportCSV(); }}
                                    className="w-full text-left px-4 py-3 hover:bg-white/15 text-sm flex items-center gap-3 text-white/90 transition-colors"
                                >
                                    <FileSpreadsheet size={16} className="text-emerald-400" />
                                    <span>Download CSV</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleExportPDF(); }}
                                    className="w-full text-left px-4 py-3 hover:bg-white/15 text-sm flex items-center gap-3 border-t border-white/15 text-white/90 transition-colors"
                                >
                                    <FileText size={16} className="text-rose-400" />
                                    <span>Export PDF (PO Style)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <div className="space-y-4">

                {/* Manifest Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/15 text-white/50 text-xs uppercase">
                                <th className="text-left py-2 font-bold">Ingredient</th>
                                <th className="text-left py-2 font-bold">Type</th>
                                <th className="text-right py-2 font-bold">Per Unit</th>
                                <th className="text-right py-2 font-bold">Total ({config.manifest.weightScale})</th>
                                <th className="text-right py-2 font-bold">Volume ({config.manifest.volumeScale})</th>
                                <th className="text-right py-2 font-bold">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {manifestItems.map(item => (
                                <tr key={item.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                                    <td className="py-2 font-medium text-white/90">{item.name}</td>
                                    <td className="py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${typeColors[item.type] || 'bg-white/15 text-white/70'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="py-2 text-right font-mono text-white/60">
                                        {item.amountPerUnit.toFixed(2)}g
                                    </td>
                                    <td className="py-2 text-right font-mono font-bold text-white/90">
                                        {convertFromGrams(item.scaledAmount, config.manifest.weightScale).toLocaleString()}
                                        {config.manifest.weightScale}
                                    </td>
                                    <td className="py-2 text-right font-mono text-white/50">
                                        {convertFromMl(item.scaledAmount / recipeConfig.density, config.manifest.volumeScale).toLocaleString()}
                                        {config.manifest.volumeScale}
                                    </td>
                                    <td className="py-2 text-right font-mono text-emerald-400">
                                        ${item.totalCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-white/20 bg-white/10 font-bold">
                                <td className="py-3 text-white/90">TOTAL</td>
                                <td className="py-3"></td>
                                <td className="py-3"></td>
                                <td className="py-3 text-right font-mono text-white/90">
                                    {convertFromGrams(totalWeight, config.manifest.weightScale).toLocaleString()}{config.manifest.weightScale}
                                </td>
                                <td className="py-3 text-right font-mono text-white/60">
                                    {convertFromMl(totalVolumeMl, config.manifest.volumeScale).toLocaleString()}{config.manifest.volumeScale}
                                </td>
                                <td className="py-3 text-right font-mono text-emerald-400">${totalCost.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Summary Cards - Glass Style with Spotlight */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <SpotlightCard className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-center border border-white/15">
                        <div className="text-xs text-white/50 font-bold uppercase">Base Units</div>
                        <div className="text-xl font-black text-white/90">{baseUnits.toFixed(0)}</div>
                    </SpotlightCard>
                    <SpotlightCard className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-center border border-white/15">
                        <div className="text-xs text-white/50 font-bold uppercase">Total Weight</div>
                        <div className="text-xl font-black text-white/90">
                            {convertFromGrams(totalWeight, config.manifest.weightScale).toLocaleString()}
                            <span className="text-sm ml-1 text-white/40">{config.manifest.weightScale}</span>
                        </div>
                    </SpotlightCard>
                    <SpotlightCard className="bg-white/10 backdrop-blur-sm p-3 rounded-lg text-center border border-white/15">
                        <div className="text-xs text-white/50 font-bold uppercase">Total Volume</div>
                        <div className="text-xl font-black text-white/90">
                            {convertFromMl(totalVolumeMl, config.manifest.volumeScale).toLocaleString()}
                            <span className="text-sm ml-1 text-white/40">{config.manifest.volumeScale}</span>
                        </div>
                    </SpotlightCard>
                    <SpotlightCard className="bg-emerald-500/15 backdrop-blur-sm p-3 rounded-lg text-center border border-emerald-400/30" opacity={0.15}>
                        <div className="text-xs text-emerald-400/80 font-bold uppercase">Materials Cost</div>
                        <div className="text-xl font-black text-emerald-400">${totalCost.toFixed(2)}</div>
                    </SpotlightCard>
                </div>
            </div>
        </Card>
    );
};
