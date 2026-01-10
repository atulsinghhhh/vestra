"use server";

import { createClient } from "@/lib/supabase/server";
import { generateOOTD } from "@/lib/ootd/ootdLogic";

export async function getDailyOutfitAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    return await generateOOTD(user.id);
}

export async function confirmOutfitWearAction(itemIds: string[]) {
    const supabase = await createClient();
    
    // Update all items in the outfit
    // Increment worn_count, set last_worn_date to now()
    
    // We can do this with a loop or a special RPC, but loop is fine for <10 items.
    // Or simpler: Update items where ID is in list.
    
    // First, we need to fetch current counts to increment them? 
    // Or use a postgres function. 
    // Supabase JS doesn't have an atomic increment easily without RPC.
    // We'll read, then write for now.
    
    const { data: items } = await supabase
        .from("wardrobe_items")
        .select("item_id, worn_count")
        .in("item_id", itemIds);

    if (!items) return false;

    const updates = items.map(item => ({
        item_id: item.item_id,
        worn_count: (item.worn_count || 0) + 1,
        last_worn_date: new Date().toISOString()
    }));

    const { error } = await supabase
        .from("wardrobe_items")
        .upsert(updates);

    if (error) {
        console.error("Failed to update wear stats", error);
        throw new Error(error.message);
    }
    
    return true;
}
