/**
 * Calls Google Gemini API for content generation
 */
export async function callGemini(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("Missing VITE_GEMINI_API_KEY");
        return "AI Features are unavailable (Missing API Key).";
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error generating content. Please try again.";
    }
}
