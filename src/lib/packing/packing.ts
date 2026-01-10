"use server";

import { createClient } from "../../lib/supabase/server";
import { generateTripPackingList } from "../../lib/packing/packingLogic";
import { WardrobeItem } from "../../lib/wardrobe/types";
import { TripDetails } from "../../lib/packing/types";

export async function generatePackingListAction(tripId: string) {
    const supabase = await createClient();
    
    console.log("Generating packing list for Trip ID:", tripId);

    // 1. Fetch Trip
    const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("trip_id", tripId)
        .single();
        
    if (tripError || !tripData) {
        console.error("Fetch Trip Error:", tripError);
        throw new Error(`Trip not found: ${tripError?.message}`);
    }

    const trip: TripDetails = tripData;

    // 2. Fetch User Wardrobe
    const { data: itemsData, error: itemsError } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", trip.user_id || (await supabase.auth.getUser()).data.user?.id); // Fallback if no user_id col (but we added it)

    if (itemsError) throw new Error("Failed to fetch wardrobe");

    const allItems: WardrobeItem[] = itemsData || [];

    // 3. Generate List
    const packingList = await generateTripPackingList(
        tripData.user_id,
        trip,
        allItems
    );

    return packingList;
}

export async function getUserTrips() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: true });
    
    if (data && data.length > 0) {
        console.log("Sample Trip Data:", data[0]);
    }

    return data || [];
}
