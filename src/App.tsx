import { useState } from 'react';
import { FlaskConical, Truck, History, BookOpen, Cookie, Printer, Save, Download, FileJson, HelpCircle, Settings2, Calculator, FileText, BarChart3 } from 'lucide-react';
import { AnalyticsTab } from './components/analytics';
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
import { ParticleField } from './components/ui/ParticleField';

function App() {
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'logistics' | 'analytics' | 'snapshots' | 'recipes' | 'edibles' | 'config'>('manufacturing');
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
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/cogs-calculator/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Ethereal overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-emerald-900/30 to-slate-900/60" />

        {/* Animated glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating particles - biology & chemistry connections */}
        <ParticleField particleCount={45} connectionDistance={100} />

        {/* Glassmorphism login card with breathing animation */}
        <div
          className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 w-full max-w-md shadow-2xl"
          style={{
            animation: 'breathe 4s ease-in-out infinite',
          }}
        >
          {/* Breathing animation keyframes */}
          <style>{`
            @keyframes breathe {
              0%, 100% { 
                transform: scale(1) translateY(0); 
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(245, 158, 11, 0.1);
              }
              50% { 
                transform: scale(1.01) translateY(-4px); 
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 0 80px rgba(16, 185, 129, 0.15);
              }
            }
          `}</style>

          {/* Logo/Brand area */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                style={{ animation: 'breathe 3s ease-in-out infinite' }}
              >
                <span className="text-3xl">🌿</span>
              </div>
            </div>
            <h1 className="text-3xl font-light tracking-[0.25em] text-white/90 mb-1">ROLOS KITCHEN</h1>
            <p className="text-white/40 text-xs tracking-widest italic">by Dawson Bros</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="text-white/40 text-xs tracking-widest">KITCHEN</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'black50') {
              const expiry = Date.now() + (4 * 60 * 60 * 1000);
              localStorage.setItem('rolos-auth-session', JSON.stringify({ expiry }));
              setIsAuthenticated(true);
            } else {
              alert('Incorrect password');
            }
          }}>
            <div className="relative mb-6">
              <input
                type="password"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 focus:bg-white/10 transition-all tracking-wider"
                autoFocus
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-emerald-400/0 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 text-white rounded-xl px-6 py-4 font-medium tracking-widest uppercase text-sm hover:from-amber-400 hover:to-emerald-400 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Enter Kitchen
            </button>
          </form>

          {/* Subtle footer */}
          <p className="text-center text-white/30 text-xs mt-8 tracking-wider">
            COGS & Potency Calculator
          </p>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <ConfigProvider>
      {/* Darker ethereal background with botanical image */}
      <div
        className="min-h-screen font-sans print:bg-white print:p-0 relative"
        style={{
          backgroundImage: 'url(/cogs-calculator/login-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay to dim the background - increased opacity for better contrast */}
        <div className="fixed inset-0 bg-gradient-to-br from-stone-900/80 via-stone-900/70 to-stone-900/80 pointer-events-none" />

        {/* Floating particles - biology & chemistry connections */}
        <div className="fixed inset-0 opacity-25 pointer-events-none print:hidden">
          <ParticleField particleCount={35} connectionDistance={80} />
        </div>

        {/* Warm ambient glow orbs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-emerald-400/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="fixed top-1/2 right-0 w-64 h-64 bg-amber-300/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Sticky Header - Liquid Glass */}
        <div className="sticky top-0 z-40 print:static print:border-none">
          {/* Stacked glass layers - darkened for better contrast */}
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-white/5" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
          <div className="absolute inset-0 shadow-lg shadow-black/30" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div>
                <h1 className="text-3xl font-light tracking-[0.15em] text-white/90">ROLOS KITCHEN</h1>
                <p className="text-amber-200/60 text-sm tracking-widest italic">by Dawson Bros</p>
              </div>

              <div className="flex gap-2 relative">
                <div className="flex bg-stone-700/75 backdrop-blur-sm border border-stone-500/40 rounded-xl p-1 shadow-lg overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-none no-scrollbar">
                  <TabButton active={activeTab === 'manufacturing'} onClick={() => setActiveTab('manufacturing')} icon={FlaskConical} label="Manufacturing" />
                  <TabButton active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} icon={Truck} label="Logistics" />
                  <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={BarChart3} label="Analytics" />
                  <TabButton active={activeTab === 'snapshots'} onClick={() => setActiveTab('snapshots')} icon={History} label="Snapshots" />
                  <TabButton active={activeTab === 'recipes'} onClick={() => setActiveTab('recipes')} icon={BookOpen} label="Recipes" />
                  <TabButton active={activeTab === 'edibles'} onClick={() => setActiveTab('edibles')} icon={Cookie} label="Edibles" />
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
                        <button onClick={handleSaveToDrive} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2 text-green-600">
                          <FileJson size={16} /> Save Config (JSON)
                        </button>
                        <button onClick={() => { setShowHelp(true); setShowActions(false); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2 border-t border-neutral-100">
                          <HelpCircle size={16} /> Help & Guide
                        </button>
                        <button onClick={() => { setActiveTab('config'); setShowActions(false); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 text-sm flex items-center gap-2">
                          <Settings2 size={16} /> Config
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
              baseUnits={calc.batchScale.calculatedBaseUnits}
              totalRevenue={calc.skuCalculations.reduce((sum, s) => sum + (s.wholesalePrice * s.quantity), 0)}
              totalCOGS={calc.skuCalculations.reduce((sum, s) => sum + (s.fullyLoadedCost * s.quantity), 0)}
              cannabinoidTotals={calc.cannabinoidTotals}
              totalBatchWeight={calc.totalBatchWeightGrams}
            />
          </div>
        </div>

        {/* Main Content - with subtle glow for separation */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-24">
          <div className="space-y-6 relative">
            {/* Subtle glow behind content for separation */}
            <div className="absolute inset-0 -m-4 bg-gradient-to-b from-black/20 via-black/30 to-black/20 rounded-3xl blur-xl pointer-events-none" />
            <div className="relative space-y-6">
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

              {activeTab === 'analytics' && (
                <AnalyticsTab data={calc} />
              )}


              {activeTab === 'snapshots' && (
                <SnapshotsView
                  snapshots={calc.snapshots}
                  onLoad={(snap) => {
                    calc.loadSnapshot(snap);
                    setActiveTab('manufacturing');
                  }}
                  onDelete={(id) => calc.setSnapshots(calc.snapshots.filter(s => s.id !== id))}
                  onSave={() => calc.saveSnapshot()}
                  onImport={(json) => {
                    try {
                      const data = JSON.parse(json);
                      const snap: import('./lib/types').Snapshot = {
                        id: Date.now(),
                        name: data.name || `Imported ${new Date().toLocaleTimeString()}`,
                        config: {
                          recipeConfig: data.recipeConfig,
                          batchConfig: data.batchConfig,
                          activeIngredients: data.activeIngredients,
                          inactiveIngredients: data.inactiveIngredients,
                          skus: data.skus,
                          logistics: data.logistics,
                          pricing: data.pricing,
                        },
                        cost: 0, // Will be recalculated on load
                      };
                      calc.setSnapshots([snap, ...calc.snapshots]);
                    } catch (e) {
                      console.error('Failed to import snapshot:', e);
                    }
                  }}
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
          </div>
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
