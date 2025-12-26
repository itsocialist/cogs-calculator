import { Bot, Sparkles, BrainCircuit, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { useAiAssistant } from '../../hooks/useAiAssistant';
import type { BatchConfig, ActiveIngredient } from '../../lib/types';

interface Props {
    batchConfig: BatchConfig;
    activeIngredients: ActiveIngredient[];
    // We pass a serialized BOM string or similar for cost analysis
    bomSummary: string;
}

export const AiView = ({ batchConfig, activeIngredients, bomSummary }: Props) => {
    const { isGenerating, aiMarketingCopy, aiCostAnalysis, generateMarketingCopy, analyzeCost } = useAiAssistant();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in print:hidden">
            {/* Marketing Generator */}
            <div className="space-y-6">
                <Card title="Marketing Copy Generator" icon={Bot}>
                    <p className="text-sm text-neutral-500 mb-4">
                        Generate premium product descriptions based on your current formulation and potency.
                    </p>
                    <button
                        onClick={() => generateMarketingCopy(batchConfig, activeIngredients)}
                        disabled={isGenerating}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} />}
                        Generate Description
                    </button>
                    {aiMarketingCopy && (
                        <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm leading-relaxed whitespace-pre-line animate-in fade-in">
                            {aiMarketingCopy}
                        </div>
                    )}
                </Card>
            </div>

            {/* Cost Analyst */}
            <div className="space-y-6">
                <Card title="Smart Cost Analysis" icon={BrainCircuit}>
                    <p className="text-sm text-neutral-500 mb-4">
                        Send your BOM to Gemini to identify cost drivers and margin optimization opportunities.
                    </p>
                    <button
                        onClick={() => analyzeCost(bomSummary)}
                        disabled={isGenerating}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <TrendingUp size={16} />}
                        Analyze Margins
                    </button>
                    {aiCostAnalysis && (
                        <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm leading-relaxed whitespace-pre-line animate-in fade-in">
                            {aiCostAnalysis}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
