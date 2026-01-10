
import { WardrobeItem } from "../wardrobe/types";

export type TripDetails = {
    trip_id: string;
    user_id: string;
    destination: string;
    start_date: string;
    end_date: string;
    trip_type: string; // e.g. "business", "leisure", "vacation"
    activities: string; // comma separated or text
    notes?: string;
    lat?: number;
    lon?: number;
};

export type PackedOutfit = {
    day: number;
    occasion: "day" | "evening" | "special";
    items: WardrobeItem[];
    reason?: string;
};

export type PackingList = {
    tripId: string;
    totalDays: number;
    weatherSummary: string;
    outfits: PackedOutfit[];
    backupItems: WardrobeItem[];
};
