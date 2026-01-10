"use server";

import { createClient } from "../supabase/server";
import { getUserLocationByUserId } from "../supabase/userLocation";
import { getLiveWeatherByLocation } from "../weather/fetchWeather";
import { classifyWeatherCategories } from "../weather/classify";
import { calculateSeason, isValidSkinTone, isValidUndertone, SkinTone, Undertone } from "../seasonColor";
import { filterWardrobeItems, generateOutfitCandidates, WeatherCondition } from "../wardrobe/outfitLogic";
import { FormalityEnum, WardrobeItem } from "../wardrobe/types";

export async function generateWardrobeOutfit(userId: string, formalityRaw: string = 'casual', preFilteredItems?: WardrobeItem[]) {

    const supabase = await createClient();

    const { data, error } = await supabase.from('user_measurements').select('*')
        .eq('user_id', userId);

    if(error || !data) {
        throw new Error('Failed to fetch user measurements');
    }

    const m = data[0];

    // Skin profile
    const { data: skin } = await supabase
        .from('user_skin_profile')
        .select('seasonal_palette, perferred_colors, avoid_colors, skin_tone, undertone')
        .eq('user_id', userId)
        .maybeSingle();

    let wardrobeItems: WardrobeItem[] = [];

    if (preFilteredItems) {
        // Use provided items directly (assume already filtered)
        wardrobeItems = preFilteredItems;
    } else {
        // Fetch Wardrobe Items
        const { data: wardrobeRaw } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId);
        
        wardrobeItems = wardrobeRaw || [];
        // Step 1: Filter Wardrobe (SQL + Code)
        wardrobeItems = filterWardrobeItems(wardrobeItems);
    }

    let seasonUi: string | undefined = undefined;
    const rawSeason: string | undefined = skin?.seasonal_palette ?? undefined;
    if (rawSeason === "spring" || rawSeason === "summar" || rawSeason === "autumn" || rawSeason === "winter") {
        seasonUi = rawSeason === "summar" ? "summer" : rawSeason;
    } else if (skin?.skin_tone && skin?.undertone && isValidSkinTone(String(skin.skin_tone)) && isValidUndertone(String(skin.undertone))) {
        seasonUi = calculateSeason(String(skin.undertone) as Undertone, String(skin.skin_tone) as SkinTone);
    }

    const location = await getUserLocationByUserId(userId);
    let weatherText = "";
    let categories: string[] = [];
    // let weatherOutfit: ReturnType<typeof generateWeatherAwareOutfit> | null = null;
    let weatherCondition: WeatherCondition = "neutral";
    let currentSeason: "summer" | "winter" | "spring" | "autumn" = "summer";

    if (location) {
        const weather = await getLiveWeatherByLocation(location.city, location.country);
        categories = classifyWeatherCategories(weather);
        // generateWeatherAwareOutfit unused for candidate logic but good for metadata if needed
        // weatherOutfit = generateWeatherAwareOutfit({...});
        weatherText = `Weather in ${location.city}, ${location.country}: ${weather.temperature}°C, humidity ${weather.humidity}%, wind ${weather.wind_speed} km/h, condition ${weather.condition}. Categories: ${categories.join(', ')}.`
        
        if (weather.temperature < 15) weatherCondition = "cold";
        else if (weather.temperature > 25) weatherCondition = "hot";
        if (weather.condition.toLowerCase().includes("rain")) weatherCondition = "rainy";

        if (weather.temperature > 20) currentSeason = "summer";
        else if (weather.temperature < 10) currentSeason = "winter";
        else currentSeason = "spring"; 
    }

    // ------------------------------------------------------------------
    // Step 2: Build Outfit Candidates (Combinatorial)
    // ------------------------------------------------------------------
    const candidates = generateOutfitCandidates(wardrobeItems, {
        weather: weatherCondition,
        season: currentSeason,
        formality: formalityRaw as FormalityEnum || 'casual',
    }, 15);

    const candidatesText = candidates.map((c, i) => {
        const itemsList = c.items.map(item => `- ${item.item_name} (${item.category}, ${item.color_primary})`).join('\n');
        return `Option ${i + 1}:\n${itemsList}`;
    }).join('\n\n');

    const paletteLine = seasonUi ? `Seasonal palette: ${seasonUi}.` : "";
    
    // ------------------------------------------------------------------
    // Step 3: Send Candidates to LLM
    // ------------------------------------------------------------------
    const OutfitPrompt = `You are an expert fashion stylist. I have pre-selected ${candidates.length} technically valid outfit combinations from the user's wardrobe based on weather and basic rules.
Your goal is to SELECT the best 2 distinct options from this list and refine/describe them.

User Profile:
- Body type: ${m.body_type}
- Palette: ${paletteLine}
- Weather: ${weatherText}
- Required Formality: ${formalityRaw}
- Note: Candidates are strictly filtered for the occasion.

Pre-selected Candidates:
${candidatesText || "No valid candidates found based on strict rules. Suggest a theoretical outfit instead."}

Instructions:
1. Review the provided "Pre-selected Candidates".
2. Pick the 2 best outfits that match the user's style, body type, and the current weather context.
3. If the candidates are good, use them EXACTLY. Do not invent new items unless the candidates are empty.
4. Output specific reasons why these work.
5. Format as clean markdown with bullets.

Output Format:
### Option 1: [Name of Outfit]
- **Items**: [List the specific items found in the candidate]
- **Why it works**: [Brief explanation]

### Option 2: [Name of Outfit]
- **Items**: [List items]
- **Why it works**: [Brief explanation]
`;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: OutfitPrompt
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                max_tokens: 600,
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Groq Error Body:", errBody);
            throw new Error(`Groq API error: ${response.statusText} - ${errBody}`);
        }

        const data = await response.json();
        const generatedText = data.choices[0]?.message?.content || "No outfit suggestion generated.";
        
        return {
            generated_text: generatedText,
            weather_text: weatherText
        };
    } catch (error) {
        console.error('Error in textGeneration:', error);
        throw error;
    }
}
