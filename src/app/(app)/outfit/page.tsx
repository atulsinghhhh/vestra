import { createClient } from "@/lib/supabase/server";
import { getUserLocationByUserId } from "@/lib/supabase/userLocation";
import { getLiveWeatherByLocation } from "@/lib/weather/fetchWeather";
import classifyWeatherCategories from "@/lib/weather/classify";
import generateWeatherAwareOutfit from "@/lib/weather/recommendation";
import { calculateSeason, isValidSkinTone, isValidUndertone, type SeasonKey } from "@/lib/seasonColor";
import { buildRuleBasedSuggestions, inferBaseFit } from "@/lib/outfit/ruleBasedSuggestions";
import OutfitSuggestionsGrid from "@/components/OutfitSuggestionsGrid";

export default async function Page() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;

    if (!user) {
        return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white">
            Please sign in to view your personalized outfit recommendations.
            </div>
        </div>
        );
    }

  // Load measurements
    const { data: m } = await supabase
        .from("user_measurements")
        .select("body_type, height, weight, measurement_unit, chest, shoulder_width, waist, hips, inseam")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!m) {
        return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white">
            Please complete your measurements first to generate outfit suggestions.
            </div>
        </div>
        );
    }

  // Load skin profile and compute season
    const { data: skin } = await supabase
        .from("user_skin_profile")
        .select("seasonal_palette, perferred_colors, avoid_colors, skin_tone, undertone")
        .eq("user_id", user.id)
        .maybeSingle();

    let season: SeasonKey | undefined = undefined;
    const rawSeason: string | undefined = skin?.seasonal_palette ?? undefined;
    if (rawSeason === "spring" || rawSeason === "summar" || rawSeason === "autumn" || rawSeason === "winter") {
        season = rawSeason === "summar" ? "summer" : (rawSeason as SeasonKey);
    } else if (skin?.skin_tone && skin?.undertone && isValidSkinTone(String(skin.skin_tone)) && isValidUndertone(String(skin.undertone))) {
        // Fallback: compute season from skin tone + undertone
        season = calculateSeason(String(skin.undertone) as any, String(skin.skin_tone) as any);
    }

    const location = await getUserLocationByUserId(user.id);

    if (!location) {
        return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-white">
            Please set your location to generate weather-aware outfit suggestions.
            </div>
        </div>
        );
    }

    const weather = await getLiveWeatherByLocation(location.city, location.country);
    const categories = classifyWeatherCategories(weather);

    const suggestion = generateWeatherAwareOutfit({
        baseFit: inferBaseFit(m.body_type),
        skinProfile: season ? { season } : undefined,
        weather,
    });

    const outfits = buildRuleBasedSuggestions({
        bodyType: m.body_type,
        baseFit: suggestion.fit,
        categories,
        fabrics: suggestion.fabrics,
        layering: suggestion.layering,
        colorPalette: suggestion.colorGuidance.palette,
        avoidColors: skin?.avoid_colors as any,
        colorIntensity: suggestion.colorGuidance.intensity,
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-widest text-white">YOUR PERSONALIZED OUTFITS</h1>
            <p className="text-sm text-gray-400 font-light tracking-wide uppercase">
            {location.city}, {location.country} • {weather.temperature}°C • {weather.condition}
            </p>
        </div>

        {/* Profile Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Body Type</p>
                <p className="text-white capitalize">{m.body_type || "—"}</p>
            </div>
            <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Height / Weight</p>
                <p className="text-white">{m.height}{m.measurement_unit === "metric" ? "cm" : "in"} / {m.weight}{m.measurement_unit === "metric" ? "kg" : "lbs"}</p>
            </div>
            <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Season</p>
                <p className="text-white capitalize">{season || "—"}</p>
            </div>
            <div>
                <p className="text-gray-400 uppercase text-xs mb-1">Color Intensity</p>
                <p className="text-white capitalize">{suggestion.colorGuidance.intensity}</p>
            </div>
            </div>
        </div>

        {/* 3 Outfit Suggestions */}
        <div>
            <h2 className="text-xl text-white mb-4 tracking-wide">3 Outfit Suggestions</h2>
            <OutfitSuggestionsGrid suggestions={outfits} />
        </div>
        </div>
    );
}
