import { WardrobeItem, FormalityEnum } from "../wardrobe/types";
import { OccasionEvent, OccasionRule } from "./types";
import { getRuleForDressCode } from "./rules";
import { getFormalityScore } from "../packing/packingLogic"; // Reuse helper
import { generateOutfitCandidates } from "../wardrobe/outfitLogic"; // Reuse core generator

export function getEligibleItemsForOccasion(allItems: WardrobeItem[], occasion: OccasionEvent): WardrobeItem[] {
    const rule = getRuleForDressCode(occasion.dress_code);
    
    return allItems.filter(item => {
        // A. Formality Check
        const itemScore = getFormalityScore(item.formality);
        const ruleScore = getFormalityScore(rule.minFormality);

        if (itemScore < ruleScore) return false;

        // B. Disallowed Categories (Implicit & Explicit)
        if (rule.disallowedCategories?.includes(item.category)) return false;
        if (rule.disallowedSubCategories?.includes(item.sub_category || "")) return false;
        if (item.category === "footwear" && rule.disallowedFootwear?.includes(item.sub_category || "")) return false;

        return true;
    });
}

export async function generateOccasionOutfit(
    allItems: WardrobeItem[],
    occasion: OccasionEvent
) {
    const rule = getRuleForDressCode(occasion.dress_code);
    const eligibleItems = getEligibleItemsForOccasion(allItems, occasion);

    console.log(`[Occasion] User has ${allItems.length} items. Eligible for ${occasion.dress_code}: ${eligibleItems.length}`);

    // 2. Generate Candidates
    // We reuse the generic "make outfits" logic which handles basic matching (Top+Bottom)
    // We just pass it the strictly filtered list.
    // We assume "neutral" weather unless we fetch it. logic reused from packing.
    const candidates = generateOutfitCandidates(eligibleItems, {
        weather: "neutral",
        season: "spring", // Neutral season to allow most items (filtering handled above)
        formality: rule.minFormality
    }, 50);

    if (candidates.length === 0) {
        return null;
    }

    // 3. Select Best Candidate
    // Maybe prefer "Higher Formality" within the eligible set?
    // Sort by total formality score descending?
    
    const sorted = candidates.sort((a, b) => {
        const scoreA = a.items.reduce((sum, it) => sum + getFormalityScore(it.formality), 0);
        const scoreB = b.items.reduce((sum, it) => sum + getFormalityScore(it.formality), 0);
        return scoreB - scoreA; // Highest formality first
    });

    return sorted[0];
}
