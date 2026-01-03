import { useState, useEffect, useCallback } from 'react';
import type {
    SavedRecipe,
    RecipeConfig,
    ActiveIngredient,
    InactiveIngredient,
    RecipeMode,
    EdibleProductType
} from '../lib/types';

const STORAGE_KEY = 'rolos_kitchen_recipes';

// Generate unique ID
const generateId = () => `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Load recipes from localStorage
const loadRecipes = (): SavedRecipe[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load recipes:', e);
        return [];
    }
};

// Save recipes to localStorage
const saveRecipesToStorage = (recipes: SavedRecipe[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch (e) {
        console.error('Failed to save recipes:', e);
    }
};

export interface UseRecipeLibraryReturn {
    recipes: SavedRecipe[];
    saveRecipe: (
        name: string,
        recipeConfig: RecipeConfig,
        activeIngredients: ActiveIngredient[],
        inactiveIngredients: InactiveIngredient[],
        options?: {
            description?: string;
            mode?: RecipeMode;
            productType?: EdibleProductType;
            tags?: string[];
        }
    ) => SavedRecipe;
    loadRecipe: (id: string) => SavedRecipe | undefined;
    updateRecipe: (id: string, updates: Partial<Omit<SavedRecipe, 'id' | 'createdAt'>>) => SavedRecipe | undefined;
    deleteRecipe: (id: string) => boolean;
    duplicateRecipe: (id: string, newName: string) => SavedRecipe | undefined;
    exportRecipe: (id: string) => string | undefined;
    importRecipe: (json: string) => SavedRecipe | undefined;
}

export function useRecipeLibrary(): UseRecipeLibraryReturn {
    const [recipes, setRecipes] = useState<SavedRecipe[]>([]);

    // Load on mount
    useEffect(() => {
        setRecipes(loadRecipes());
    }, []);

    // Save a new recipe
    const saveRecipe = useCallback((
        name: string,
        recipeConfig: RecipeConfig,
        activeIngredients: ActiveIngredient[],
        inactiveIngredients: InactiveIngredient[],
        options?: {
            description?: string;
            mode?: RecipeMode;
            productType?: EdibleProductType;
            tags?: string[];
        }
    ): SavedRecipe => {
        const now = new Date().toISOString();

        const newRecipe: SavedRecipe = {
            id: generateId(),
            name,
            description: options?.description,
            createdAt: now,
            updatedAt: now,
            mode: options?.mode || 'topical',
            productType: options?.productType,
            recipeConfig,
            activeIngredients: activeIngredients.map(ing => ({
                name: ing.name,
                costPerKg: ing.costPerKg,
                unit: ing.unit,
                amount: ing.amount,
                densityGPerMl: ing.densityGPerMl,
                purityPercent: ing.purityPercent,
                cannabinoid: ing.cannabinoid,
            })),
            inactiveIngredients: inactiveIngredients.map(ing => ({
                name: ing.name,
                costPerKg: ing.costPerKg,
                unit: ing.unit,
                amount: ing.amount,
                densityGPerMl: ing.densityGPerMl,
                type: ing.type,
            })),
            tags: options?.tags,
        };

        const updated = [...recipes, newRecipe];
        setRecipes(updated);
        saveRecipesToStorage(updated);

        return newRecipe;
    }, [recipes]);

    // Load a recipe by ID
    const loadRecipe = useCallback((id: string): SavedRecipe | undefined => {
        return recipes.find(r => r.id === id);
    }, [recipes]);

    // Update an existing recipe
    const updateRecipe = useCallback((
        id: string,
        updates: Partial<Omit<SavedRecipe, 'id' | 'createdAt'>>
    ): SavedRecipe | undefined => {
        const index = recipes.findIndex(r => r.id === id);
        if (index === -1) return undefined;

        const updatedRecipe: SavedRecipe = {
            ...recipes[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        const updated = [...recipes];
        updated[index] = updatedRecipe;
        setRecipes(updated);
        saveRecipesToStorage(updated);

        return updatedRecipe;
    }, [recipes]);

    // Delete a recipe
    const deleteRecipe = useCallback((id: string): boolean => {
        const index = recipes.findIndex(r => r.id === id);
        if (index === -1) return false;

        const updated = recipes.filter(r => r.id !== id);
        setRecipes(updated);
        saveRecipesToStorage(updated);

        return true;
    }, [recipes]);

    // Duplicate a recipe with new name
    const duplicateRecipe = useCallback((id: string, newName: string): SavedRecipe | undefined => {
        const original = recipes.find(r => r.id === id);
        if (!original) return undefined;

        const now = new Date().toISOString();
        const duplicate: SavedRecipe = {
            ...original,
            id: generateId(),
            name: newName,
            createdAt: now,
            updatedAt: now,
        };

        const updated = [...recipes, duplicate];
        setRecipes(updated);
        saveRecipesToStorage(updated);

        return duplicate;
    }, [recipes]);

    // Export recipe as JSON string
    const exportRecipe = useCallback((id: string): string | undefined => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return undefined;
        return JSON.stringify(recipe, null, 2);
    }, [recipes]);

    // Import recipe from JSON string
    const importRecipe = useCallback((json: string): SavedRecipe | undefined => {
        try {
            const parsed = JSON.parse(json) as SavedRecipe;

            // Validate required fields
            if (!parsed.name || !parsed.recipeConfig || !parsed.activeIngredients || !parsed.inactiveIngredients) {
                console.error('Invalid recipe format');
                return undefined;
            }

            // Generate new ID and timestamps
            const now = new Date().toISOString();
            const imported: SavedRecipe = {
                ...parsed,
                id: generateId(),
                name: `${parsed.name} (Imported)`,
                createdAt: now,
                updatedAt: now,
            };

            const updated = [...recipes, imported];
            setRecipes(updated);
            saveRecipesToStorage(updated);

            return imported;
        } catch (e) {
            console.error('Failed to import recipe:', e);
            return undefined;
        }
    }, [recipes]);

    return {
        recipes,
        saveRecipe,
        loadRecipe,
        updateRecipe,
        deleteRecipe,
        duplicateRecipe,
        exportRecipe,
        importRecipe,
    };
}
