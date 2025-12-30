import { useState } from 'react';
import { callGemini } from '../lib/gemini';
import type { BatchConfig, ActiveIngredient } from '../lib/types';

export function useAiAssistant() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiMarketingCopy, setAiMarketingCopy] = useState("");
    const [aiCostAnalysis, setAiCostAnalysis] = useState("");

    const generateMarketingCopy = async (batchConfig: BatchConfig, activeIngredients: ActiveIngredient[]) => {
        setIsGenerating(true);
        const activesList = activeIngredients.map(a => a.name).join(", ");
        const prompt = `Write a premium, medical-grade product description for a cannabis salve named "${batchConfig.productName}". 
    Active Ingredients: ${activesList}. 
    Tone: Sophisticated, healing, trustworthy.`;

        const result = await callGemini(prompt);
        setAiMarketingCopy(result);
        setIsGenerating(false);
    };

    const analyzeCost = async (ingredients: string) => {
        setIsGenerating(true);
        const prompt = `Analyze this Bill of Materials (BOM) and suggest 3 specific ways to reduce costs without sacrificing quality. 
    Focus on supply chain and formulation efficiency. 
    BOM Data: ${ingredients}`;

        const result = await callGemini(prompt);
        setAiCostAnalysis(result);
        setIsGenerating(false);
    };

    return {
        isGenerating,
        aiMarketingCopy,
        aiCostAnalysis,
        generateMarketingCopy,
        analyzeCost
    };
}
