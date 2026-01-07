export const SKIN_TONE_ENUM = [
    "fair",
    "light",
    "medium",
    "olive",
    "tan",
    "deep",
] as const;

export const UNDERTONE_ENUM = ["cool", "warm", "neutral"] as const;

export const SEASON_UI_ENUM = ["spring", "summer", "autumn", "winter"] as const;
export const SEASON_DB_ENUM = ["spring", "summar", "autumn", "winter"] as const;

export type SkinTone = typeof SKIN_TONE_ENUM[number];
export type Undertone = typeof UNDERTONE_ENUM[number];
export type SeasonKey = typeof SEASON_UI_ENUM[number];

export const seasonPalettes: Record<SeasonKey, { preferred: string[]; avoid: string[] }> = {
    spring: {
        preferred: ["coral", "peach", "mint", "cream"],
        avoid: ["black", "charcoal"],
    },
    summer: {
        preferred: ["lavender", "powder blue", "rose", "soft gray"],
        avoid: ["orange", "mustard"],
    },
    autumn: {
        preferred: ["olive", "rust", "camel", "maroon"],
        avoid: ["neon", "icy pastels"],
    },
    winter: {
        preferred: ["navy", "emerald", "black", "white"],
        avoid: ["muted beige", "dusty tones"],
    },
};

export function calculateSeason(undertone: Undertone, skinTone: SkinTone): SeasonKey {
    if (undertone === "warm") {
        return skinTone === "fair" || skinTone === "light" ? "spring" : "autumn";
    }
    if (undertone === "cool") {
        return skinTone === "fair" || skinTone === "light" ? "summer" : "winter";
    }
    return "summer";
}

export function toDbSeasonKey(season: SeasonKey): (typeof SEASON_DB_ENUM)[number] {
    return season === "summer" ? "summar" : season;
}

export function isValidSkinTone(value: string): value is SkinTone {
    return (SKIN_TONE_ENUM as readonly string[]).includes(value);
}

export function isValidUndertone(value: string): value is Undertone {
    return (UNDERTONE_ENUM as readonly string[]).includes(value);
}

export function isValidSeasonUi(value: string): value is SeasonKey {
    return (SEASON_UI_ENUM as readonly string[]).includes(value);
}