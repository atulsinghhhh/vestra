
import { TripDetails, PackingList, PackedOutfit } from "./types";
import { WardrobeItem, FormalityEnum } from "../wardrobe/types";
import { generateOutfitCandidates, WeatherCondition } from "../wardrobe/outfitLogic";
import { getLiveWeatherByLocation } from "../weather/fetchWeather";


function getSeasonForDate(dateStr: string): "summer" | "winter" | "spring" | "autumn" {
    const month = new Date(dateStr).getMonth() + 1; 
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
}

function filterWardrobeForTrip(
    items: WardrobeItem[], 
    trip: TripDetails, 
    predictedWeather: WeatherCondition,
    tripSeason: string
): WardrobeItem[] {
    const requiredFormality = mapTripTypeToFormality(trip.trip_type);

    return items.filter(item => {
        if (item.is_available === false) return false;

        if (item.season && item.season.length > 0) {
            const isAllSeason = item.season.includes("all-season");
            const matchesSeason = item.season.includes(tripSeason as any);
            if (!isAllSeason && !matchesSeason) return false;
        }
        if (getFormalityScore(item.formality) < getFormalityScore(requiredFormality)) {
            return false;
        }

        if (predictedWeather === "hot") {
            if (item.category === "outerwear" && (item.sub_category === "coat" || item.sub_category === "jacket")) {
                // Check if it's a "heavy" item based on fabric?
                if (item.fabric?.includes("wool") || item.fabric?.includes("down")) return false;
            }
        }

        return true;
    });
}

function mapTripTypeToFormality(type: string): FormalityEnum {
    const t = type.toLowerCase();
    if (t.includes("business") || t.includes("work")) return "business";
    if (t.includes("wedding") || t.includes("formal")) return "formal";
    if (t.includes("party") || t.includes("date")) return "smart_casual";
    return "casual";
}

function getFormalityScore(f?: FormalityEnum): number {
    switch (f) {
        case "casual": return 1;
        case "smart_casual": return 2;
        case "business": return 3;
        case "formal": return 4;
        default: return 1;
    }
}

export async function generateTripPackingList(
    userId: string,
    trip: TripDetails,
    allItems: WardrobeItem[]
): Promise<PackingList> {
    
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Inclusive

    const season = getSeasonForDate(trip.start_date);
    
    let weatherCondition: WeatherCondition = "neutral";
    let weatherSummary = `${season}`;

    const daysUntilStart = Math.ceil((start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilStart >= 0 && daysUntilStart <= 5) {
        try {
            const liveWeather = await getLiveWeatherByLocation(trip.destination, ""); 
            
            if (liveWeather.temperature > 25) weatherCondition = "hot";
            else if (liveWeather.temperature < 10) weatherCondition = "cold";
            else weatherCondition = "neutral";

            if (liveWeather.condition.toLowerCase().includes("rain")) weatherCondition = "rainy";
            
            weatherSummary = `${liveWeather.temperature}°C, ${liveWeather.condition} (${season})`;
            console.log(`Using Live Weather for ${trip.destination}:`, weatherSummary);
        } catch (e) {
            console.error("Failed to fetch live weather, falling back to season:", e);
             // Fallback
             if (season === "summer") weatherCondition = "hot";
             if (season === "winter") weatherCondition = "cold";
        }
    } else {
        // Fallback or Future Trip
        if (season === "summer") weatherCondition = "hot";
        if (season === "winter") weatherCondition = "cold";
        if (season === "spring") weatherCondition = "neutral";
        weatherSummary = `${season} (Typical detected)`;
    }
    
    const eligibleItems = filterWardrobeForTrip(allItems, trip, weatherCondition, season);
    
    const outfits: PackedOutfit[] = [];
    const usedItemIds = new Set<string>();

    const candidates = generateOutfitCandidates(eligibleItems, {
        weather: weatherCondition,
        season: season,
        formality: mapTripTypeToFormality(trip.trip_type)
    }, 50); // Get many candidates

    let daysFilled = 0;
    for (const cand of candidates) {
        if (daysFilled >= durationDays) break;
        
        outfits.push({
            day: daysFilled + 1,
            occasion: "day",
            items: cand.items
        });
        daysFilled++;
    }

    const eveningsNeeded = Math.floor(durationDays / 2);
    for (let i = 0; i < eveningsNeeded; i++) {
         if (candidates.length > outfits.length) {
             const nextOutfit = candidates[outfits.length]; // Crude pick next
             outfits.push({
                 day: (i * 2) + 1,
                 occasion: "evening",
                 items: nextOutfit.items
             });
         }
    }

    return {
        tripId: trip.trip_id,
        totalDays: durationDays,
        weatherSummary: weatherSummary,
        outfits: outfits,
        backupItems: []
    };
}
