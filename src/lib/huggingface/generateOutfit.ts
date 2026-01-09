"use server";

import { createClient } from "../supabase/server";
import { getUserLocationByUserId } from "../supabase/userLocation";
import { getLiveWeatherByLocation } from "../weather/fetchWeather";
import { classifyWeatherCategories } from "../weather/classify";
import { generateWeatherAwareOutfit } from "../weather/recommendation";
import { calculateSeason, isValidSkinTone, isValidUndertone } from "../seasonColor";
// import { InferenceClient } from "@huggingface/inference";

// InferenceClient import removed as we are using fetch directly
// const huggingface_Client = new InferenceClient(
//     process.env.GROQ_API_KEY!
// );

export async function generateOutfit(userId: string) {

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

    let seasonUi: string | undefined = undefined;
    const rawSeason: string | undefined = skin?.seasonal_palette ?? undefined;
    if (rawSeason === "spring" || rawSeason === "summar" || rawSeason === "autumn" || rawSeason === "winter") {
        seasonUi = rawSeason === "summar" ? "summer" : rawSeason;
    } else if (skin?.skin_tone && skin?.undertone && isValidSkinTone(String(skin.skin_tone)) && isValidUndertone(String(skin.undertone))) {
        seasonUi = calculateSeason(String(skin.undertone) as any, String(skin.skin_tone) as any);
    }

    const location = await getUserLocationByUserId(userId);
    let weatherText = "";
    let categories: string[] = [];
    let weatherOutfit: ReturnType<typeof generateWeatherAwareOutfit> | null = null;
    if (location) {
        const weather = await getLiveWeatherByLocation(location.city, location.country);
        categories = classifyWeatherCategories(weather);
        weatherOutfit = generateWeatherAwareOutfit({
            baseFit: 'regular',
            skinProfile: seasonUi ? { season: seasonUi as any } : undefined,
            weather,
        });
        weatherText = `Weather in ${location.city}, ${location.country}: ${weather.temperature}°C, humidity ${weather.humidity}%, wind ${weather.wind_speed} km/h, condition ${weather.condition}. Categories: ${categories.join(', ')}.`
    }

    const unitIsMetric = m.measurement_unit === 'metric';
    const preferredColors = Array.isArray(skin?.perferred_colors) ? skin?.perferred_colors : undefined;
    const avoidColors = Array.isArray(skin?.avoid_colors) ? skin?.avoid_colors : undefined;

    const paletteLine = seasonUi ? `Seasonal palette: ${seasonUi}.` : "";
    const colorHints = weatherOutfit ? `Color intensity: ${weatherOutfit.colorGuidance.intensity}. Suggested palette: ${weatherOutfit.colorGuidance.palette.join(', ')}.` : "";
    const fabricHints = weatherOutfit && weatherOutfit.fabrics.length ? `Recommended fabrics: ${weatherOutfit.fabrics.join(', ')}.` : "";
    const layerHints = weatherOutfit && weatherOutfit.layering.length ? `Layering: ${weatherOutfit.layering.join(' + ')}.` : "";
    const fitHint = weatherOutfit ? `Fit guidance: ${weatherOutfit.fit}.` : "";

    const OutfitPrompt = `You are a fashion stylist. Create 2 concise outfit options optimized for the user's body type, seasonal color palette, and current weather. Return clean markdown with short bullets.

User Profile:
- Body type: ${m.body_type}
- Measurements: height ${m.height} ${unitIsMetric ? 'cm' : 'in'}, weight ${m.weight} ${unitIsMetric ? 'kg' : 'lbs'}, chest ${m.chest}, shoulder ${m.shoulder_width}, waist ${m.waist}, hips ${m.hips}, inseam ${m.inseam}
- ${paletteLine} ${preferredColors ? `Preferred colors: ${preferredColors.join(', ')}.` : ''} ${avoidColors ? `Avoid colors: ${avoidColors.join(', ')}.` : ''} ${skin?.skin_tone ? `Skin tone: ${skin.skin_tone}.` : ''} ${skin?.undertone ? `Undertone: ${skin.undertone}.` : ''}

Context:
- ${weatherText}
- ${colorHints}
- ${fabricHints}
- ${layerHints}
- ${fitHint}

Instructions:
- Respect fabrics and layers when applicable
- Use seasonal palette and intensity guidance for colors
- Include: top, bottom, footwear, outerwear (if needed), and 1–2 accessories
- Mention why each outfit works for the body type and weather
- Keep each outfit under 6 short bullets
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
                model: "llama-3.1-8b-instant",
                temperature: 0.7,
                max_tokens: 500,
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText = data.choices[0]?.message?.content || "No outfit suggestion generated.";
        
        // console.log('Outfit Suggestion Output:', generatedText);

        return {
            generated_text: generatedText
        };
    } catch (error) {
        console.error('Error in textGeneration:', error);
        throw error;
    }
}

