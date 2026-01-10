"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserLocationByUserId } from "@/lib/supabase/userLocation";
import { getLiveWeatherByLocation } from "@/lib/weather/fetchWeather";
import { generateOutfitCandidates, WeatherCondition } from "@/lib/wardrobe/outfitLogic";
import { WardrobeItem } from "@/lib/wardrobe/types";

export type OOTDResult = {
    outfit: {
        id: string; // Not real ID, but index from candidates
        items: WardrobeItem[];
    };
    weather: {
        temp: number;
        condition: string;
        city: string;
    };
    ai: {
        explanation: string;
        note?: string;
    };
} | null;

export async function generateOOTD(userId: string): Promise<OOTDResult> {
    const supabase = await createClient();

    // 0. Context: Profile (Gender)
    const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', userId)
        .maybeSingle();

    const genderContext = profile?.gender ? `Gender: ${profile.gender}` : "Gender: Unisex";

    // 1. Context: Weather
    const location = await getUserLocationByUserId(userId);
    let weatherCondition: WeatherCondition = "neutral";
    let weatherText = "Unknown Weather";
    let temp = 20;
    
    if (location) {
        try {
            const w = await getLiveWeatherByLocation(location.city, location.country);
            temp = w.temperature;
            weatherText = `${w.temperature}°C, ${w.condition}`;
            
            if (w.temperature < 15) weatherCondition = "cold";
            else if (w.temperature > 25) weatherCondition = "hot";
            if (w.condition.toLowerCase().includes("rain")) weatherCondition = "rainy";
        } catch (e) {
            console.error("Weather fetch failed", e);
        }
    }

    // 2. Wardrobe & Sorting (Shop your closet!)
    const { data: items } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", userId)
        .eq("is_available", true)
        .returns<WardrobeItem[]>();
    
    if (!items || items.length === 0) return null;

    // SORT: First by worn_count (ASC), then by last_worn_date (ASC/Oldest)
    // We want items that haven't been worn much or lately.
    const sortedItems = (items as WardrobeItem[]).sort((a, b) => {
        const countDiff = (a.worn_count || 0) - (b.worn_count || 0);
        if (countDiff !== 0) return countDiff;
        
        // If counts equal, prefer older last_worn
        const dateA = a.last_worn_date ? new Date(a.last_worn_date).getTime() : 0;
        const dateB = b.last_worn_date ? new Date(b.last_worn_date).getTime() : 0;
        return dateA - dateB; 
    });

    // 3. Generate Candidates
    // We pass the SORTED list. generateOutfitCandidates usually takes Top/Bottom.
    // It iterates through tops and finds matching bottoms.
    // Since we sorted by "least worn", the top of the list has high priority items.
    // Ideally we'd optimize the generator to prefer high-rank items, but strict passing might lose sort order 
    // if generator shuffles or exhaustively pairs. 
    // `generateOutfitCandidates` (from previous context) is combinatorial.
    // We will slice to top 50 to ensure we use "best" items first if list is huge? 
    // Actually, let's just pass all but assume generator produces reasonable combos.
    
    const candidates = generateOutfitCandidates(sortedItems, {
        weather: weatherCondition,
        season: "spring", // Default for now or derive
        formality: "casual" // OOTD is usually daily/casual
    }, 20); // Get 20 options

    if (candidates.length === 0) return null;

    // 4. LLM Selection
    // Construct Prompt
    const candidatesList = candidates.map((c, i) => {
        const itemNames = c.items.map(it => `${it.item_name} (${it.sub_category}, ${it.color_primary}, worn: ${it.worn_count || 0})`).join(", ");
        return `ID ${i}: ${itemNames}`;
    }).join("\n");

    const prompt = `
    SYSTEM ROLE: You evaluate pre-validated outfits. You cannot create or modify outfits.
    
    USER CONTEXT:
    - ${genderContext}
    - Weather: ${weatherText}
    - Temperature: ${temp}C
    - Goal: Select the single best "Outfit of the Day".
    - Constraint: Prefer items with lower 'worn' counts to rotate wardrobe ("Shop your closet").
    
    OUTFIT CANDIDATES:
    ${candidatesList}
    
    INSTRUCTIONS:
    1. Select the BEST single outfit ID.
    2. Explain WHY it fits today (weather, style, variety).
    3. Keep explanation short (1-2 sentences).
    
    OUTPUT FORMAT (JSON ONLY):
    {
        "selected_id": number,
        "explanation": "string",
        "note": "string (optional styling tip)"
    }
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.3,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        const selectedIndex = content.selected_id;
        const selectedOutfit = candidates[selectedIndex];

        if (!selectedOutfit) throw new Error("Invalid selection index");

        return {
            outfit: {
                id: `ootd-${Date.now()}`,
                items: selectedOutfit.items
            },
            weather: {
                temp,
                condition: weatherText,
                city: location?.city || "Unknown"
            },
            ai: {
                explanation: content.explanation,
                note: content.note
            }
        };

    } catch (e) {
        console.error("OOTD Generation Failed", e);
        // Fallback: Pick first candidate
        return {
            outfit: {
                id: `ootd-fallback`,
                items: candidates[0].items
            },
            weather: { temp, condition: weatherText, city: location?.city || "" },
            ai: { explanation: "A classic combination from your wardrobe.", note: "Simple and effective." }
        };
    }
}
