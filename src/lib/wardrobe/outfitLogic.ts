
import { 
    WardrobeItem, 
    FormalityEnum, 
    SeasonOption,
    PatternEnum
} from "./types";

export type WeatherCondition = "hot" | "cold" | "rainy" | "neutral";

type GenerationContext = {
    weather: WeatherCondition;
    season: "summer" | "winter" | "spring" | "autumn";
    formality: FormalityEnum;
};

export type OutfitCandidate = {
    items: WardrobeItem[];
    score: number;
};

// --- Helper: Formality Mapping ---
const formalityScore = (f?: FormalityEnum): number => {
    switch (f) {
        case "casual": return 1;
        case "smart_casual": return 2;
        case "business": return 3;
        case "formal": return 4;
        default: return 1;
    }
};

// --- Step 1: Filter Wardrobe ---
export function filterWardrobeItems(items: WardrobeItem[]): WardrobeItem[] {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    return items
        .filter(item => {
            // 1. Availability check
            if (item.is_available === false) return false;

            // 2. Rotation check (worn in last 3 days)
            if (item.last_worn_date) {
                const wornDate = new Date(item.last_worn_date);
                if (wornDate >= threeDaysAgo) return false;
            }
            return true;
        })
        .sort((a, b) => {
            // 3. Sort by worn_count ASC, then last_worn_date ASC
            const countDiff = (a.worn_count || 0) - (b.worn_count || 0);
            if (countDiff !== 0) return countDiff;

            const dateA = a.last_worn_date ? new Date(a.last_worn_date).getTime() : 0;
            const dateB = b.last_worn_date ? new Date(b.last_worn_date).getTime() : 0;
            return dateA - dateB;
        });
}

// --- Step 2: Build Candidates ---
export function generateOutfitCandidates(
    items: WardrobeItem[],
    context: GenerationContext,
    limit: number = 10
): OutfitCandidate[] {
    const { weather, season, formality } = context;
    const reqFormalityScore = formalityScore(formality);

    // Group items
    const tops = items.filter(i => i.category === "tops");
    const bottoms = items.filter(i => i.category === "bottoms");
    const dresses = items.filter(i => i.category === "dresses");
    const outerwear = items.filter(i => i.category === "outerwear");
    const footwear = items.filter(i => i.category === "footwear");
    const accessories = items.filter(i => i.category === "accessories");

    const candidates: OutfitCandidate[] = [];

    // Helpers
    const isItemValid = (item: WardrobeItem): boolean => {
        // Formality Rule: item >= required
        if (formalityScore(item.formality) < reqFormalityScore) return false;

        // Weather/Season Blocking
        if (season === "summer" || weather === "hot") {
            // Block heavy outerwear and winter items
            if (item.season?.includes("winter") && !item.season.includes("all-season") && !item.season.includes("summer")) return false;
            if (item.category === "outerwear" && (item.sub_category === "coat" || item.sub_category === "jacket")) {
               // lighter jackets might be ok, but logic says "Block heavy outerwear"
               if (item.season?.includes("winter")) return false; 
            }
        }
        
        return true;
    };

    const isOutfitValid = (outfitItems: WardrobeItem[]): boolean => {
        // Pattern Rule: Max 1 patterned item (assuming non-solid/null is patterned)
        const patternedCount = outfitItems.filter(i => i.pattern && i.pattern !== "solid").length;
        if (patternedCount > 1) return false;

        return true;
    };

    const createCandidate = (baseItems: WardrobeItem[]) => {
        // Add Footwear (Always required)
        for (const shoe of footwear) {
            if (!isItemValid(shoe)) continue;
            
            const currentBase = [...baseItems, shoe];
            
            let outerwearOptions: (WardrobeItem | null)[] = [null]; // Always try without first
            
            if (weather === "cold" || weather === "rainy") {
                outerwearOptions = [...outerwear.filter(o => isItemValid(o)), null];
                // If it's REALLY cold, maybe force outerwear? The logic says "allow", not "require".
            }

            for (const outer of outerwearOptions) {
                const outfit = [...currentBase];
                if (outer) outfit.push(outer);

                // Check entire outfit validity so far
                if (!isOutfitValid(outfit)) continue;

                // Add Accessories (Optional, max 1)
                // Just take 1 valid accessory or none
                // For combinatorial explosion avoidance, maybe just pick top 1 valid accessory
                const validAccessory = accessories.find(a => isItemValid(a));
                if (validAccessory && isOutfitValid([...outfit, validAccessory])) {
                    // Start with accessory
                    const final = [...outfit, validAccessory];
                    candidates.push({ items: final, score: 0 }); // Score logic not defined, pushing blindly
                } else {
                    candidates.push({ items: outfit, score: 0 });
                }

                if (candidates.length >= limit) return;
            }
            if (candidates.length >= limit) return;
        }
    };

    // Strategy 1: Top + Bottom
    for (const top of tops) {
        if (!isItemValid(top)) continue;
        for (const bottom of bottoms) {
            if (!isItemValid(bottom)) continue;
            
            // 1. Double Denim Check    
            if (top.fabric === 'denim' && bottom.fabric === 'denim') {
                if (top.color_primary === bottom.color_primary) continue; 
            }

            if (reqFormalityScore > 1) { // Smart Casual+
                if (top.sub_category === 'hoodie' && bottom.sub_category === 'sweatpants') continue;
                if (top.sub_category === 't-shirt' && bottom.sub_category === 'shorts') continue;
            }
            
            createCandidate([top, bottom]);
            if (candidates.length >= limit) break;
        }
        if (candidates.length >= limit) break;
    }

    // Strategy 2: Desse (Blocks Top/Bottom)
    if (candidates.length < limit) {
        for (const dress of dresses) {
            if (!isItemValid(dress)) continue;
            createCandidate([dress]);
            if (candidates.length >= limit) break;
        }
    }

    return candidates;
}
