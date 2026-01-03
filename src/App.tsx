import { useState } from 'react';
import { FlaskConical, Truck, History, BookOpen, Cookie, Printer, Save, Download, FileJson, HelpCircle, Settings2, Calculator, FileText } from 'lucide-react';
import { TabButton } from './components/ui/TabButton';
import { KPIGrid } from './components/dashboard/KPIGrid';
import { ManufacturingView } from './components/views/ManufacturingView';
import { LogisticsView } from './components/views/LogisticsView';
import { SnapshotsView } from './components/views/SnapshotsView';
import { RecipesView } from './components/views/RecipesView';
import { EdiblesCalculator } from './components/views/EdiblesCalculator';
import { useCalculator } from './hooks/useCalculator';
import { useRecipeLibrary } from './hooks/useRecipeLibrary';
import { useNotes } from './hooks/useNotes';
import { ConfigView } from './components/views/ConfigView';
import { ConfigProvider } from './context/configContext';
import { HelpModal } from './components/ui/HelpModal';
import { DraggableMathPanel } from './components/ui/DraggableMathPanel';
import { NotesPanel } from './components/ui/NotesPanel';
import { StickyNote } from './components/ui/StickyNote';

function App() {
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'logistics' | 'snapshots' | 'recipes' | 'edibles' | 'config'>('manufacturing');
  const [showActions, setShowActions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for existing session on mount
    const session = localStorage.getItem('rolos-auth-session');
    if (session) {
      const { expiry } = JSON.parse(session);
      if (Date.now() < expiry) {
        return true;
      }
      localStorage.removeItem('rolos-auth-session');
    }
    return false;
  });
  const [password, setPassword] = useState('');

  const calc = useCalculator();
  const recipeLib = useRecipeLibrary();
  const notesData = useNotes();

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


  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-black text-neutral-900 mb-2">ROLOS KITCHEN</h1>
          <p className="text-neutral-500 mb-6">COGS & Potency Calculator</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'black50') {
              // Save session with 4-hour expiry
              const expiry = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
              localStorage.setItem('rolos-auth-session', JSON.stringify({ expiry }));
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
    <ConfigProvider>
      <div className="min-h-screen bg-neutral-100 font-sans print:bg-white print:p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-neutral-100/95 backdrop-blur-sm border-b-2 border-neutral-300 shadow-sm print:static print:border-none">
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
                  <TabButton active={activeTab === 'snapshots'} onClick={() => setActiveTab('snapshots')} icon={History} label="Snapshots" />
                  <TabButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} icon={BookOpen} label="Recipes" />
                  <TabButton active={activeTab === 'edibles'} onClick={() => setActiveTab('edibles')} icon={Cookie} label="Edibles" />
                  <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={Settings2} label="Config" />
                </div>

                <div className="flex gap-2 h-full">
                  <button
                    onClick={() => setShowMath(!showMath)}
                    className={`border border-neutral-200 rounded-xl px-3 md:px-4 py-2 font-medium transition-colors shadow-sm flex items-center gap-2 ${showMath ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                    title="See the Math"
                  >
                    <Calculator size={18} />
                    <span className="hidden md:inline">Math</span>
                  </button>

                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`border border-neutral-200 rounded-xl px-3 md:px-4 py-2 font-medium transition-colors shadow-sm flex items-center gap-2 ${showNotes ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                    title="Notes"
                  >
                    <FileText size={18} />
                    <span className="hidden md:inline">Notes</span>
                  </button>

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
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8">
              <h1 className="text-2xl font-bold">Product Costing Report</h1>
              <p className="text-sm text-neutral-500">Generated: {new Date().toLocaleDateString()}</p>
            </div>

            <KPIGrid
              actualPotencyMg={calc.actualPotencyMg}
              targetPotencyMg={calc.recipeConfig.targetPotencyMg}
              isPotencySafe={calc.isPotencySafe}
              fullyLoadedCost={calc.fullyLoadedCost}
              manufCostPerUnit={calc.manufCostPerUnit}
              totalLogisticsPerUnit={calc.totalLogisticsPerUnit}
              wholesaleMargin={calc.wholesaleMargin}
              retailMargin={calc.retailMargin}
              wholesalePrice={calc.pricing.wholesale}
              msrp={calc.pricing.msrp}
              totalUnits={calc.skuCalculations.reduce((sum, s) => sum + s.quantity, 0)}
              totalRevenue={calc.skuCalculations.reduce((sum, s) => sum + (s.wholesalePrice * s.quantity), 0)}
              totalCOGS={calc.skuCalculations.reduce((sum, s) => sum + (s.fullyLoadedCost * s.quantity), 0)}
              cannabinoidTotals={calc.cannabinoidTotals}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-24 space-y-6">
          {activeTab === 'manufacturing' && (
            <ManufacturingView
              recipeConfig={calc.recipeConfig}
              setRecipeConfig={calc.setRecipeConfig}
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

          {activeTab === 'recipes' && (
            <RecipesView
              recipes={recipeLib.recipes}
              recipeConfig={calc.recipeConfig}
              activeIngredients={calc.activeIngredients}
              inactiveIngredients={calc.inactiveIngredients}
              onSaveRecipe={recipeLib.saveRecipe}
              onLoadRecipe={(recipe) => {
                calc.setRecipeConfig(recipe.recipeConfig);
                calc.setActiveIngredients(recipe.activeIngredients.map((ing, idx) => ({
                  ...ing,
                  id: idx + 1,
                  type: 'active' as const,
                  unit: 'g' as const,
                  densityGPerMl: 1.0,
                  gramsPerRecipeUnit: ing.amount,
                  gramsInBatch: 0,
                })));
                calc.setInactiveIngredients(recipe.inactiveIngredients.map((ing, idx) => ({
                  ...ing,
                  id: 100 + idx + 1,
                  unit: 'g' as const,
                  densityGPerMl: 1.0,
                  gramsPerRecipeUnit: ing.amount,
                  gramsInBatch: 0,
                })));
                setActiveTab('manufacturing');
              }}
              onDeleteRecipe={recipeLib.deleteRecipe}
              onDuplicateRecipe={recipeLib.duplicateRecipe}
              onExportRecipe={recipeLib.exportRecipe}
              onImportRecipe={recipeLib.importRecipe}
            />
          )}

          {activeTab === 'edibles' && (
            <EdiblesCalculator
              onApplyToManufacturing={(data) => {
                calc.setRecipeConfig(data.recipeConfig);
                calc.setActiveIngredients(data.activeIngredients.map((ing, idx) => ({
                  ...ing,
                  id: idx + 1,
                  type: 'active' as const,
                  unit: 'g' as const,
                  densityGPerMl: 1.0,
                  gramsPerRecipeUnit: ing.amount,
                  gramsInBatch: 0,
                })));
                calc.setInactiveIngredients(data.inactiveIngredients.map((ing, idx) => ({
                  ...ing,
                  id: 100 + idx + 1,
                  unit: 'g' as const,
                  densityGPerMl: 1.0,
                  gramsPerRecipeUnit: ing.amount,
                  gramsInBatch: 0,
                })));
                setActiveTab('manufacturing');
              }}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView />
          )}
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} calculatorData={calc} />

        {/* Math Panel Overlay */}
        {showMath && <DraggableMathPanel data={calc} onClose={() => setShowMath(false)} />}

        {/* Notes Panel Overlay */}
        {showNotes && (
          <NotesPanel
            onClose={() => setShowNotes(false)}
            onCreateSticky={notesData.createSticky}
            notes={notesData.notes}
            onSaveNote={notesData.saveNote}
            onDeleteNote={notesData.deleteNote}
          />
        )}

        {/* Sticky Notes */}
        {notesData.stickies.map(sticky => (
          <StickyNote
            key={sticky.id}
            note={sticky}
            onUpdate={notesData.updateSticky}
            onDelete={notesData.deleteSticky}
          />
        ))}
      </div>
    </ConfigProvider>
  );
}

export default App;
