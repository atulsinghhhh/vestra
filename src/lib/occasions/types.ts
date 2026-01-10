import { WardrobeItem, FormalityEnum } from "../wardrobe/types";

export type OccasionType = "professional" | "social" | "formal" | "casual" | "active" | "travel" | "special";
export type DressCode = "casual" | "smart_casual" | "business_casual" | "business_formal" | "formal" | "black_tie";

export type OccasionEvent = {
    occasion_id: string;
    user_id: string;
    occasion_name: string;
    occasion_type: OccasionType;
    date_time: string; // ISO string
    location?: string;
    dress_code: DressCode;
    notes?: string;
    created_at?: string;
};

// Configuration Rule for logic
export type OccasionRule = {
    id: string;
    label: string;
    minFormality: FormalityEnum; // Minimum formality required
    maxFormality?: FormalityEnum; // Optional ceiling
    requiredCategories?: string[]; // e.g., must have "blazer" for business formal? (Maybe too strict, handle in logic)
    disallowedCategories?: string[]; // e.g., no "shorts"
    disallowedSubCategories?: string[]; // e.g. no "hoodie"
    disallowedFootwear?: string[]; // e.g. no "sneakers"
    requiredItems?: Partial<WardrobeItem>[]; // Specific items required? (Advanced)
};
