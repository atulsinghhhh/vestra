import { calculateSeason, seasonPalettes, type SeasonKey } from "../seasonColor";
import type { WeatherAwareOutfit, WeatherCategory, WeatherInput, SkinProfileInput, BaseFit } from "./types";
import { classifyWeatherCategories } from "./classify";

const FABRIC_MAP: Record<WeatherCategory, string[]> = {
    hot: ["cotton", "linen", "modal"],
    warm: [],
    mild: [],
    cool: [],
    cold: ["wool", "fleece", "down"],
    humid: ["moisture-wicking", "bamboo"],
    rainy: ["water-resistant", "nylon"],
    windy: ["windbreaker", "softshell"],
};

function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

function resolveSeason(skinProfile?: SkinProfileInput): SeasonKey | undefined {
    if (!skinProfile) return undefined;
    if (skinProfile.season) return skinProfile.season;
    if (skinProfile.undertone && skinProfile.skinTone) {
      return calculateSeason(skinProfile.undertone, skinProfile.skinTone);
    }
    return undefined;
}

function buildFabrics(categories: WeatherCategory[]): string[] {
    const orderedPriority: WeatherCategory[] = [
      "rainy",
      "cold",
      "windy",
      "hot",
      "humid",
      "cool",
      "warm",
      "mild",
    ];
    const fabrics: string[] = [];
    for (const key of orderedPriority) {
      if (categories.includes(key)) fabrics.push(...FABRIC_MAP[key]);
    }
    return unique(fabrics);
}

function buildLayering(categories: WeatherCategory[]): string[] {
    const layers: string[] = [];
    if (categories.includes("cold")) {
      layers.push("thermal base", "insulating mid", "outer jacket");
    } else if (categories.includes("cool")) {
      layers.push("base", "mid layer");
    } else if (categories.includes("hot")) {
      layers.push("single breathable layer");
    }
    if (categories.includes("rainy")) {
      if (!layers.includes("waterproof outer layer")) {
        layers.push("waterproof outer layer");
      }
    }
    return unique(layers);
}

function buildFit(baseFit: BaseFit, categories: WeatherCategory[]): string {
    if (categories.includes("hot")) return "relaxed fit";
    if (categories.includes("humid")) return "regular fit";
    if (categories.includes("cold")) return "layer-friendly fit";
    return String(baseFit);
}

function buildColorGuidance(categories: WeatherCategory[], season?: SeasonKey): WeatherAwareOutfit["colorGuidance"] {
    const isHot = categories.includes("hot");
    const isCold = categories.includes("cold");
    const isRainy = categories.includes("rainy");

    let intensity: WeatherAwareOutfit["colorGuidance"]["intensity"] = "standard";
    if (isRainy) intensity = "darker"; // safety/neutral tones on rainy days
    else if (isCold) intensity = "deeper";
    else if (isHot) intensity = "lighter";

    const notes: string[] = [];
    if (isHot) notes.push("Prefer lighter, airy shades to reflect heat");
    if (isCold) notes.push("Use deeper, saturated tones for visual warmth");
    if (isRainy) notes.push("Neutral, darker colors handle splashes and stains better");
    if (notes.length === 0) notes.push("Follow your standard seasonal palette");

    const basePalette = season ? seasonPalettes[season].preferred : [
      "navy",
      "charcoal",
      "olive",
      "white",
      "camel",
    ];

    // If rainy, bias palette toward neutrals/darker, but keep seasonal options visible
    const rainyNeutrals = ["navy", "charcoal", "black", "olive", "taupe"];
    const palette = unique(
      (isRainy ? [...rainyNeutrals, ...basePalette] : basePalette)
    );

    return { palette, intensity, notes };
}

export function generateWeatherAwareOutfit(params: {
    baseFit: BaseFit;
    skinProfile?: SkinProfileInput;
    weather: WeatherInput;
  }): WeatherAwareOutfit {
    const categories = classifyWeatherCategories(params.weather);
    const fabrics = buildFabrics(categories);
    const layering = buildLayering(categories);
    const fit = buildFit(params.baseFit, categories);
    const season = resolveSeason(params.skinProfile);
    const colorGuidance = buildColorGuidance(categories, season);

    return { fit, fabrics, layering, colorGuidance };
  }

export default generateWeatherAwareOutfit;
