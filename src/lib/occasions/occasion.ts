"use server";

import { createClient } from "@/lib/supabase/server";
import { OccasionEvent } from "@/lib/occasions/types";
import { generateOccasionOutfit, getEligibleItemsForOccasion } from "@/lib/occasions/occasionLogic";
import { generateWardrobeOutfit } from "@/lib/huggingface/generateWardrobeOutfit";
import { WardrobeItem } from "@/lib/wardrobe/types";

export async function getUserOccasions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
        .from("occasions")
        .select("*")
        .eq("user_id", user.id)
        .order("date_time", { ascending: true });

    if (error) {
        console.error("Error fetching occasions:", error);
        return [];
    }

    return (data as OccasionEvent[]) || [];
}

export async function createOccasionAction(formData: Partial<OccasionEvent>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    const payload = {
        ...formData,
        user_id: user.id
    };

    const { data, error } = await supabase
        .from("occasions")
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Error creating occasion:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function deleteOccasionAction(occasionId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("occasions")
        .delete()
        .eq("occasion_id", occasionId);
    
    if (error) throw error;
    return true;
}

export async function generateOutfitForOccasionAction(occasionId: string) {
     const supabase = await createClient();
     
     // 1. Fetch Occasion
     const { data: occasion, error: occError } = await supabase
        .from("occasions")
        .select("*")
        .eq("occasion_id", occasionId)
        .single();
    
    if (occError || !occasion) throw new Error("Occasion not found");

    // 2. Fetch Wardrobe (ALL items, to be filtered by logic)
    const { data: items, error: itemError } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", occasion.user_id)
        .eq("is_available", true);

    if (itemError) throw new Error("Wardrobe fetch failed");
    
    // 3. Strict Filtering
    const eligibleItems = getEligibleItemsForOccasion(items as WardrobeItem[], occasion as OccasionEvent);
    
    console.log(`Generating for ${occasion.occasion_name} (${occasion.dress_code}). Total: ${items.length}, Eligible: ${eligibleItems.length}`);

    // 4. Rule-Based Generation
    const ruleBasedOutfit = await generateOccasionOutfit(items as WardrobeItem[], occasion as OccasionEvent);
    
    // 5. AI Generation (using STRICTLY filtered items)
    let aiSuggestion = null;
    try {
        console.log("Starting AI Generation...");
        aiSuggestion = await generateWardrobeOutfit(
            occasion.user_id, 
            occasion.dress_code, // Use dress code as formality prompt
            eligibleItems // Pass strictly filtered items
        );
        console.log("AI Generation complete.");
    } catch (e) {
        console.error("AI Generation failed:", e);
        // Don't fail the whole request, just return null for AI
    }

    return {
        ruleBased: ruleBasedOutfit,
        aiSuggestion: aiSuggestion
    };
}
