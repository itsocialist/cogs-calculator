import { useState } from 'react';
import { FlaskConical, Truck, Sparkles, History, Printer, Save, Download, FileJson, HelpCircle, X } from 'lucide-react';
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
  const [showHelp, setShowHelp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const calc = useCalculator();

  const handleExportCSV = () => {
    const headers = ["Category", "Item", "Value", "Unit", "Total Cost", "Cost Per Unit"];
    const rows: (string | number)[][] = [];

    // Ingredients
    calc.activeIngredients.forEach(i => rows.push(["Active Ingredient", i.name, i.gramsInBatch, "g", ((i.gramsInBatch / 1000) * i.costPerKg).toFixed(2), (((i.gramsInBatch / 1000) * i.costPerKg) / calc.unitsProduced).toFixed(4)]));
    calc.inactiveIngredients.forEach(i => rows.push(["Inactive Ingredient", i.name, i.gramsInBatch, "g", ((i.gramsInBatch / 1000) * i.costPerKg).toFixed(2), (((i.gramsInBatch / 1000) * i.costPerKg) / calc.unitsProduced).toFixed(4)]));

    // Packaging (from SKUs)
    calc.skus.forEach(sku => {
      sku.packaging.forEach(p => rows.push([`Packaging (${sku.name})`, p.name, sku.quantity, "unit", (p.costPerUnit * sku.quantity).toFixed(2), p.costPerUnit.toFixed(4)]));
    });

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
    skus: calc.skus,
    batch: calc.batchConfig
  });

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-black text-neutral-900 mb-2">ROLOS KITCHEN</h1>
          <p className="text-neutral-500 mb-6">COGS & Potency Calculator</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'black50') {
              setIsAuthenticated(true);
            } else {
              alert('Incorrect password');
            }
          }}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white rounded-lg px-4 py-3 font-bold hover:bg-neutral-800 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 font-sans print:bg-white print:p-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-neutral-100/95 backdrop-blur-sm border-b border-neutral-200/50 print:static print:border-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-neutral-900">ROLOS KITCHEN</h1>
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
                    <button onClick={() => { setShowHelp(true); setShowActions(false); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2 border-t border-neutral-100">
                      <HelpCircle size={16} /> Help & Guide
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 space-y-6">
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
            skus={calc.skus}
            skuCalculations={calc.skuCalculations}
            totalBatchWeightGrams={calc.totalBatchWeightGrams}
            totalWeightAllocated={calc.totalWeightAllocated}
            isOverAllocated={calc.isOverAllocated}
            defaultPackaging={calc.defaultPackaging}
            addSKU={calc.addSKU}
            removeSKU={calc.removeSKU}
            updateSKU={calc.updateSKU}
            updateSKUPackaging={calc.updateSKUPackaging}
            addSKUPackagingItem={calc.addSKUPackagingItem}
            removeSKUPackagingItem={calc.removeSKUPackagingItem}
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
            totalDistroFeesPerUnit={calc.totalDistroFeesPerUnit}
            labTestPerUnit={calc.labTestPerUnit}
            shippingPerUnit={calc.shippingPerUnit}
            addDistroFee={calc.addDistroFee}
            removeDistroFee={calc.removeDistroFee}
            updateDistroFee={calc.updateDistroFee}
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Help & Guide</h2>
              <button onClick={() => setShowHelp(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 text-sm">
              <section>
                <h3 className="font-bold text-neutral-900 mb-2">🚀 Quick Start</h3>
                <ol className="space-y-2 text-neutral-600 list-decimal list-inside">
                  <li><strong>Set Batch Config</strong> — Enter product name, batch size (kg), and target potency</li>
                  <li><strong>Add Active Ingredients</strong> — Enter cannabinoids (CBD, THC, etc.) with cost, amount, and purity</li>
                  <li><strong>Add Base Ingredients</strong> — Add carriers, bases, and terpenes in cups/tsp/grams</li>
                  <li><strong>Configure SKUs</strong> — Set unit sizes (g/ml/oz), quantities, Wholesale & MSRP prices per SKU</li>
                  <li><strong>Customize Packaging</strong> — Expand each SKU to set per-unit packaging costs</li>
                  <li><strong>Review Logistics</strong> — Set lab testing, shipping, and distribution fee %</li>
                  <li><strong>Check KPIs</strong> — Review COGS, margins, and potency at the top</li>
                </ol>
              </section>

              <section>
                <h3 className="font-bold text-neutral-900 mb-2">📊 Key Calculations</h3>
                <ul className="space-y-2 text-neutral-600">
                  <li><strong>COGS/Unit</strong> = (Ingredient Costs + Labor + Packaging) ÷ Units Produced</li>
                  <li><strong>Landed Cost</strong> = COGS + Lab Testing + Shipping + Distribution Fees</li>
                  <li><strong>Wholesale Margin</strong> = Wholesale Price − Landed Cost</li>
                  <li><strong>Potency (mg)</strong> = Active Grams × Purity% × 1000 ÷ Units</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-neutral-900 mb-2">🧪 Volume Units</h3>
                <p className="text-neutral-600 mb-2">Enter ingredients in your preferred units. We auto-convert to grams for costing:</p>
                <ul className="space-y-1 text-neutral-600 text-xs">
                  <li>• 1 cup = 236.6 ml × density (g/ml)</li>
                  <li>• 1 tbsp = 14.8 ml × density</li>
                  <li>• 1 tsp = 4.9 ml × density</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-neutral-900 mb-2">🌿 Cannabinoids</h3>
                <p className="text-neutral-600">Active ingredients are tagged as CBD, THC, CBG, CBN, or Other. The summary shows total mg of each cannabinoid in your batch.</p>
              </section>

              <section>
                <h3 className="font-bold text-neutral-900 mb-2">💡 Tips</h3>
                <ul className="space-y-1 text-neutral-600">
                  <li>• <strong>Smart defaults</strong>: Ingredient names auto-detect density & cannabinoid type</li>
                  <li>• <strong>SKU packaging</strong>: Expand each SKU to customize its packaging</li>
                  <li>• <strong>Snapshots</strong>: Save different formulations to compare costs</li>
                  <li>• <strong>AI Assistant</strong>: Ask questions about your formulation</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
