import { useState, useRef } from 'react';
import {
    BookOpen, Save, Upload, Download, Trash2, Copy,
    X, Clock, Tag
} from 'lucide-react';
import type {
    SavedRecipe,
    RecipeConfig,
    ActiveIngredient,
    InactiveIngredient
} from '../../lib/types';

interface RecipesViewProps {
    recipes: SavedRecipe[];
    recipeConfig: RecipeConfig;
    activeIngredients: ActiveIngredient[];
    inactiveIngredients: InactiveIngredient[];
    onSaveRecipe: (
        name: string,
        recipeConfig: RecipeConfig,
        activeIngredients: ActiveIngredient[],
        inactiveIngredients: InactiveIngredient[],
        options?: { description?: string; tags?: string[] }
    ) => SavedRecipe;
    onLoadRecipe: (recipe: SavedRecipe) => void;
    onDeleteRecipe: (id: string) => boolean;
    onDuplicateRecipe: (id: string, newName: string) => SavedRecipe | undefined;
    onExportRecipe: (id: string) => string | undefined;
    onImportRecipe: (json: string) => SavedRecipe | undefined;
}

export const RecipesView = ({
    recipes,
    recipeConfig,
    activeIngredients,
    inactiveIngredients,
    onSaveRecipe,
    onLoadRecipe,
    onDeleteRecipe,
    onDuplicateRecipe,
    onExportRecipe,
    onImportRecipe,
}: RecipesViewProps) => {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newRecipeName, setNewRecipeName] = useState('');
    const [newRecipeDescription, setNewRecipeDescription] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sort recipes by most recent first
    const sortedRecipes = [...recipes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const handleSave = () => {
        if (!newRecipeName.trim()) return;

        onSaveRecipe(
            newRecipeName.trim(),
            recipeConfig,
            activeIngredients,
            inactiveIngredients,
            { description: newRecipeDescription.trim() || undefined }
        );

        setNewRecipeName('');
        setNewRecipeDescription('');
        setShowSaveModal(false);
    };

    const handleLoad = (recipe: SavedRecipe) => {
        onLoadRecipe(recipe);
    };

    const handleDelete = (id: string) => {
        if (confirmDelete === id) {
            onDeleteRecipe(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    const handleDuplicate = (id: string, originalName: string) => {
        const newName = `${originalName} (Copy)`;
        onDuplicateRecipe(id, newName);
    };

    const handleExport = (id: string) => {
        const json = onExportRecipe(id);
        if (!json) return;

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const recipe = recipes.find(r => r.id === id);
        a.href = url;
        a.download = `${recipe?.name || 'recipe'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Parse CSV content into recipe format
    const parseCSVToRecipe = (csvContent: string): string | null => {
        try {
            const lines = csvContent.trim().split('\n');
            if (lines.length < 2) return null;

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const rows = lines.slice(1).map(line => {
                const values: string[] = [];
                let current = '';
                let inQuotes = false;
                for (const char of line) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                values.push(current.trim());
                return values;
            });

            // Convert to recipe format
            const activeIngredients: Array<{ name: string; costPerKg: number; amount: number; purityPercent: number; cannabinoid: string }> = [];
            const inactiveIngredients: Array<{ name: string; costPerKg: number; amount: number; type: string }> = [];

            const categoryIdx = headers.indexOf('category');
            const itemIdx = headers.indexOf('item');
            const valueIdx = headers.indexOf('value');
            const costIdx = headers.indexOf('total cost');

            rows.forEach(row => {
                const category = row[categoryIdx]?.toLowerCase() || '';
                const item = row[itemIdx] || '';
                const value = parseFloat(row[valueIdx]) || 0;
                const cost = parseFloat(row[costIdx]) || 0;
                const costPerKg = value > 0 ? (cost / value) * 1000 : 0;

                if (category.includes('active')) {
                    const cannabinoid = item.toLowerCase().includes('thc') ? 'THC' :
                        item.toLowerCase().includes('cbd') ? 'CBD' :
                            item.toLowerCase().includes('cbg') ? 'CBG' : 'other';
                    activeIngredients.push({
                        name: item,
                        costPerKg,
                        amount: value / 100, // Assume 100 units batch, scale down
                        purityPercent: 99,
                        cannabinoid,
                    });
                } else if (category.includes('inactive')) {
                    inactiveIngredients.push({
                        name: item,
                        costPerKg,
                        amount: value / 100,
                        type: 'base',
                    });
                }
            });

            if (activeIngredients.length === 0 && inactiveIngredients.length === 0) {
                return null;
            }

            // Create recipe JSON
            const recipe = {
                name: 'Imported from CSV',
                description: 'Imported from exported COGS CSV file',
                mode: 'topical',
                recipeConfig: {
                    baseUnitSize: 28.35,
                    baseUnitLabel: '1 oz jar',
                    targetPotencyMg: 500,
                    density: 0.95,
                },
                activeIngredients,
                inactiveIngredients,
            };

            return JSON.stringify(recipe);
        } catch (e) {
            console.error('CSV parse error:', e);
            return null;
        }
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isCSV = file.name.toLowerCase().endsWith('.csv');

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;

            let jsonToImport: string | null = null;

            if (isCSV) {
                jsonToImport = parseCSVToRecipe(content);
                if (!jsonToImport) {
                    setImportError('Could not parse CSV file. Ensure it matches the exported COGS format.');
                    setTimeout(() => setImportError(null), 3000);
                    return;
                }
            } else {
                jsonToImport = content;
            }

            const imported = onImportRecipe(jsonToImport);
            if (!imported) {
                setImportError('Invalid recipe file format');
                setTimeout(() => setImportError(null), 3000);
            }
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = '';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="text-slate-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-800">Recipe Library</h2>
                    <span className="text-sm text-slate-500">({recipes.length} saved)</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <Save size={16} />
                        Save Current
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium border border-slate-300"
                    >
                        <Upload size={16} />
                        Import
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Import Error */}
            {importError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {importError}
                </div>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Save Recipe</h3>
                            <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Recipe Name *</label>
                                <input
                                    type="text"
                                    value={newRecipeName}
                                    onChange={(e) => setNewRecipeName(e.target.value)}
                                    placeholder="e.g., CBD Muscle Balm 500mg"
                                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-slate-600 focus:outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Description (optional)</label>
                                <textarea
                                    value={newRecipeDescription}
                                    onChange={(e) => setNewRecipeDescription(e.target.value)}
                                    placeholder="Notes about this recipe..."
                                    rows={2}
                                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-slate-600 focus:outline-none resize-none"
                                />
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                                <div className="font-medium mb-1">Current Formula:</div>
                                <div>• {activeIngredients.length} active ingredient(s)</div>
                                <div>• {inactiveIngredients.length} base/inactive ingredient(s)</div>
                                <div>• Base unit: {recipeConfig.baseUnitLabel} ({recipeConfig.baseUnitSize}g)</div>
                                <div>• Target potency: {recipeConfig.targetPotencyMg}mg</div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!newRecipeName.trim()}
                                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recipe List */}
            {sortedRecipes.length === 0 ? (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No Saved Recipes</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Save your current recipe configuration to quickly load it later.
                    </p>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <Save size={16} />
                        Save Current Recipe
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedRecipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 truncate">{recipe.name}</h3>
                                    {recipe.description && (
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{recipe.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(recipe.updatedAt)}
                                        </span>
                                        <span>
                                            {recipe.recipeConfig.baseUnitLabel} • {recipe.recipeConfig.targetPotencyMg}mg
                                        </span>
                                        <span>
                                            {recipe.activeIngredients.length} actives • {recipe.inactiveIngredients.length} bases
                                        </span>
                                    </div>

                                    {recipe.tags && recipe.tags.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                            {recipe.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs"
                                                >
                                                    <Tag size={10} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleLoad(recipe)}
                                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                                    >
                                        Load
                                    </button>

                                    <button
                                        onClick={() => handleDuplicate(recipe.id, recipe.name)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                        title="Duplicate"
                                    >
                                        <Copy size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleExport(recipe.id)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                        title="Export"
                                    >
                                        <Download size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(recipe.id)}
                                        className={`p-1.5 rounded transition-colors ${confirmDelete === recipe.id
                                            ? 'bg-red-100 text-red-600'
                                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                            }`}
                                        title={confirmDelete === recipe.id ? 'Click again to confirm' : 'Delete'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
