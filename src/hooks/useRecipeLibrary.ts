import { useCallback, useEffect, useRef } from 'react';
import type {
    SavedRecipe,
    RecipeConfig,
    ActiveIngredient,
    InactiveIngredient,
    RecipeMode,
    EdibleProductType
} from '../lib/types';
import { useHybridStorage, TABLES } from './useHybridStorage';

// Generate unique ID
const generateId = () => `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export interface UseRecipeLibraryReturn {
    recipes: SavedRecipe[];
    isLoaded: boolean;
    isSyncing: boolean;
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
    // Use hybrid storage for recipes (localStorage + Supabase sync)
    const {
        data: recipes,
        setData: setRecipes,
        isLoaded,
        isSyncing,
    } = useHybridStorage<SavedRecipe[]>({
        table: TABLES.RECIPES,
        sessionKey: 'library',
        defaultValue: [],
        legacyKey: 'rolos_kitchen_recipes', // Migrate from old localStorage key
    });

    // Ref for stable access in callbacks
    const recipesRef = useRef(recipes);
    useEffect(() => {
        recipesRef.current = recipes;
    }, [recipes]);

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

        setRecipes(prev => [...prev, newRecipe]);
        return newRecipe;
    }, [setRecipes]);

    // Load a recipe by ID
    const loadRecipe = useCallback((id: string): SavedRecipe | undefined => {
        return recipesRef.current.find(r => r.id === id);
    }, []);

    // Update an existing recipe
    const updateRecipe = useCallback((
        id: string,
        updates: Partial<Omit<SavedRecipe, 'id' | 'createdAt'>>
    ): SavedRecipe | undefined => {
        let updatedRecipe: SavedRecipe | undefined;

        setRecipes(prev => {
            const index = prev.findIndex(r => r.id === id);
            if (index === -1) return prev;

            updatedRecipe = {
                ...prev[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            const updated = [...prev];
            updated[index] = updatedRecipe;
            return updated;
        });

        return updatedRecipe;
    }, [setRecipes]);

    // Delete a recipe
    const deleteRecipe = useCallback((id: string): boolean => {
        const exists = recipesRef.current.some(r => r.id === id);
        if (!exists) return false;

        setRecipes(prev => prev.filter(r => r.id !== id));
        return true;
    }, [setRecipes]);

    // Duplicate a recipe with new name
    const duplicateRecipe = useCallback((id: string, newName: string): SavedRecipe | undefined => {
        const original = recipesRef.current.find(r => r.id === id);
        if (!original) return undefined;

        const now = new Date().toISOString();
        const duplicate: SavedRecipe = {
            ...original,
            id: generateId(),
            name: newName,
            createdAt: now,
            updatedAt: now,
        };

        setRecipes(prev => [...prev, duplicate]);
        return duplicate;
    }, [setRecipes]);

    // Export recipe as JSON string
    const exportRecipe = useCallback((id: string): string | undefined => {
        const recipe = recipesRef.current.find(r => r.id === id);
        if (!recipe) return undefined;
        return JSON.stringify(recipe, null, 2);
    }, []);

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

            setRecipes(prev => [...prev, imported]);
            return imported;
        } catch (e) {
            console.error('Failed to import recipe:', e);
            return undefined;
        }
    }, [setRecipes]);

    return {
        recipes,
        isLoaded,
        isSyncing,
        saveRecipe,
        loadRecipe,
        updateRecipe,
        deleteRecipe,
        duplicateRecipe,
        exportRecipe,
        importRecipe,
    };
}
