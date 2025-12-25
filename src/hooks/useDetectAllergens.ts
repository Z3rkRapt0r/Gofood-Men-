import { useMutation } from '@tanstack/react-query';

export interface AllergenResult {
    dishName: string;
    allergens: string[];
    contains_gluten: boolean | "unknown";
    confidence: "high" | "medium" | "low";
    rationale: string;
    needs_review: boolean;
}

export interface DetectAllergensResponse {
    results: AllergenResult[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDetectAllergens() {
    return useMutation({
        mutationFn: async (dishes: any[]) => {
            const response = await fetch('/api/ai/detect-allergens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dishes }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Errore durante l\'analisi degli allergeni');
            }

            const data = await response.json();
            return data as DetectAllergensResponse;
        },
    });
}
