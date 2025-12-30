import { useState } from 'react';
import { FlaskConical, Truck, Sparkles, History, Printer, Save, Download, FileJson } from 'lucide-react';
import { TabButton } from './components/ui/TabButton';
import { KPIGrid } from './components/dashboard/KPIGrid';
import { ManufacturingView } from './components/views/ManufacturingView';
import { LogisticsView } from './components/views/LogisticsView';
import { AiView } from './components/views/AiView';
import { SnapshotsView } from './components/views/SnapshotsView';
import { useCalculator } from './hooks/useCalculator';

function App() {
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'logistics' | 'ai' | 'snapshots'>('manufacturing');
  const [showActions, setShowActions] = useState(false);

  const calc = useCalculator();

  const handleExportCSV = () => {
    const headers = ["Category", "Item", "Value", "Unit", "Total Cost", "Cost Per Unit"];
    const rows: (string | number)[][] = [];

    // Ingredients
    calc.activeIngredients.forEach(i => rows.push(["Active Ingredient", i.name, i.gramsInBatch, "g", ((i.gramsInBatch / 1000) * i.costPerKg).toFixed(2), (((i.gramsInBatch / 1000) * i.costPerKg) / calc.unitsProduced).toFixed(4)]));
    calc.inactiveIngredients.forEach(i => rows.push(["Inactive Ingredient", i.name, i.gramsInBatch, "g", ((i.gramsInBatch / 1000) * i.costPerKg).toFixed(2), (((i.gramsInBatch / 1000) * i.costPerKg) / calc.unitsProduced).toFixed(4)]));

    // Packaging
    calc.packaging.forEach(p => rows.push(["Packaging", p.name, "1", "unit", (p.costPerUnit * calc.unitsProduced).toFixed(2), p.costPerUnit.toFixed(4)]));

    // Labor
    rows.push(["Labor", "Manufacturing Labor", calc.batchConfig.laborHours, "hours", (calc.batchConfig.laborRate * calc.batchConfig.laborHours).toFixed(2), calc.laborCostPerUnit.toFixed(4)]);
    rows.push(["Fulfillment", "3PL Pick & Pack", calc.unitsProduced, "units", (calc.batchConfig.fulfillmentCost * calc.unitsProduced).toFixed(2), calc.batchConfig.fulfillmentCost.toFixed(4)]);

    // Summary
    rows.push(["SUMMARY", "Units Produced", calc.unitsProduced, "units", "", ""]);
    rows.push(["SUMMARY", "Fully Loaded Cost", "", "", (calc.fullyLoadedCost * calc.unitsProduced).toFixed(2), calc.fullyLoadedCost.toFixed(4)]);
    rows.push(["SUMMARY", "Wholesale Profit/Unit", "", "", "", calc.wholesaleMargin.toFixed(2)]);
    rows.push(["SUMMARY", "Retail Profit/Unit", "", "", "", calc.retailMargin.toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${calc.batchConfig.productName.replace(/\s+/g, '_')}_COGS.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDrive = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calc, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${calc.batchConfig.productName}_config.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSaveSnapshot = () => {
    calc.saveSnapshot();
    alert("Snapshot Saved!");
  };

  const bomSummary = JSON.stringify({
    actives: calc.activeIngredients,
    inactives: calc.inactiveIngredients,
    packaging: calc.packaging,
    batch: calc.batchConfig
  });

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-8 font-sans print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">DAWSON BROS.</h1>
            <p className="text-neutral-500 font-medium">COGS & Potency Calculator</p>
          </div>

          <div className="flex gap-2 relative">
            <div className="flex bg-neutral-900 rounded-xl p-1 shadow-lg overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none no-scrollbar">
              <TabButton active={activeTab === 'manufacturing'} onClick={() => setActiveTab('manufacturing')} icon={FlaskConical} label="Manufacturing" />
              <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} icon={Truck} label="Logistics" />
              <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={Sparkles} label="AI Assistant" highlight />
              <TabButton active={activeTab === 'snapshots'} onClick={() => setActiveTab('snapshots')} icon={History} label="Snapshots" />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="bg-white border border-neutral-200 text-neutral-600 rounded-xl px-4 py-3 font-medium hover:bg-neutral-50 transition-colors shadow-sm h-full flex items-center gap-2"
              >
                Actions
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <button onClick={() => window.print()} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2">
                    <Printer size={16} /> Print Report
                  </button>
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2">
                    <Download size={16} /> Export CSV
                  </button>
                  <button onClick={handleSaveSnapshot} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2 text-blue-600">
                    <Save size={16} /> Save Snapshot
                  </button>
                  <button onClick={handleSaveToDrive} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2 text-green-600">
                    <FileJson size={16} /> Save Config (JSON)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold">Product Costing Report</h1>
          <p className="text-sm text-neutral-500">Generated: {new Date().toLocaleDateString()}</p>
        </div>

        <KPIGrid
          actualPotencyMg={calc.actualPotencyMg}
          targetPotencyMg={calc.batchConfig.targetPotencyMg}
          isPotencySafe={calc.isPotencySafe}
          fullyLoadedCost={calc.fullyLoadedCost}
          manufCostPerUnit={calc.manufCostPerUnit}
          totalLogisticsPerUnit={calc.totalLogisticsPerUnit}
          wholesaleMargin={calc.wholesaleMargin}
          retailMargin={calc.retailMargin}
          wholesalePrice={calc.pricing.wholesale}
          msrp={calc.pricing.msrp}
        />

        {activeTab === 'manufacturing' && (
          <ManufacturingView
            batchConfig={calc.batchConfig}
            setBatchConfig={calc.setBatchConfig}
            activeIngredients={calc.activeIngredients}
            addActive={calc.addActive}
            removeActive={calc.removeActive}
            setActiveIngredients={calc.setActiveIngredients}
            inactiveIngredients={calc.inactiveIngredients}
            addInactive={calc.addInactive}
            removeInactive={calc.removeInactive}
            setInactiveIngredients={calc.setInactiveIngredients}
            packaging={calc.packaging}
            addPackaging={calc.addPackaging}
            removePackaging={calc.removePackaging}
            setPackaging={calc.setPackaging}
            totalBatchWeightGrams={calc.totalBatchWeightGrams}
          />
        )}

        {activeTab === 'logistics' && (
          <LogisticsView
            logistics={calc.logistics}
            setLogistics={calc.setLogistics}
            pricing={calc.pricing}
            setPricing={calc.setPricing}
            fullyLoadedCost={calc.fullyLoadedCost}
            manufCostPerUnit={calc.manufCostPerUnit}
            distroFeePerUnit={calc.distroFeePerUnit}
            commissionsPerUnit={calc.commissionsPerUnit}
            labTestPerUnit={calc.labTestPerUnit}
            shippingPerUnit={calc.shippingPerUnit}
          />
        )}

        {activeTab === 'ai' && (
          <AiView
            batchConfig={calc.batchConfig}
            activeIngredients={calc.activeIngredients}
            bomSummary={bomSummary}
          />
        )}

        {activeTab === 'snapshots' && (
          <SnapshotsView
            snapshots={calc.snapshots}
            onLoad={(snap) => {
              calc.loadSnapshot(snap);
              setActiveTab('manufacturing');
            }}
            onDelete={(id) => calc.setSnapshots(calc.snapshots.filter(s => s.id !== id))}
          />
        )}
      </div>
    </div>
  );
}

export default App;
