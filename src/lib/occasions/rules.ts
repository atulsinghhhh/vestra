import { OccasionRule, DressCode } from "./types";

// Mapping Dress Codes to Strict Rules
export const DRESS_CODE_RULES: Record<DressCode, OccasionRule> = {
    "casual": {
        id: "casual",
        label: "Casual",
        minFormality: "casual",
        // No strict disallows, anything goes basically, but maybe block "formal" stuff if we wanted?
        // Let's keep it open.
    },
    "smart_casual": {
        id: "smart_casual",
        label: "Smart Casual",
        minFormality: "smart_casual",
        disallowedSubCategories: ["hoodie", "sweatpants", "gym_shorts", "flip_flops", "running_shoes"],
        disallowedCategories: ["activewear"]
    },
    "business_casual": {
        id: "business_casual",
        label: "Business Casual",
        minFormality: "smart_casual", // Can accept smart casual items
        allowedFormalityFloor: "smart_casual", 
        disallowedSubCategories: ["jeans", "t-shirt", "sneakers", "hoodie", "shorts", "sandals"],
        // Note: Some places allow jeans + blazer for business casual, but let's be strict for safety first.
    } as any, // casting allows extra props if needed or just sticking to type
    "business_formal": {
        id: "business_formal",
        label: "Business Formal",
        minFormality: "business",
        disallowedSubCategories: ["jeans", "chinos", "t-shirt", "polo", "sneakers", "boots", "shorts"],
        // strict suit/pants logic
    },
    "formal": {
        id: "formal",
        label: "Formal", // Covers Cocktail/Party
        minFormality: "formal",
        disallowedSubCategories: ["jeans", "t-shirt", "sneakers", "shorts", "polo", "hoodie"],
    },
    "black_tie": {
        id: "black_tie",
        label: "Black Tie",
        minFormality: "formal",
        disallowedCategories: ["jeans", "shorts", "activewear"],
        disallowedSubCategories: ["sneakers", "boots", "sandals", "t-shirt", "polo", "sweater"],
        // Ideally requires a Tuxedo, but we might just have "Formal" items.
    }
};

export function getRuleForDressCode(code: DressCode): OccasionRule {
    return DRESS_CODE_RULES[code] || DRESS_CODE_RULES["casual"];
}
