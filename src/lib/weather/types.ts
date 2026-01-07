export type WeatherInput = {
  temperature: number;
  humidity: number; // percent (0-100)
  wind_speed: number; // km/h
  condition: string; // e.g., "Clear", "Clouds", "Rain", etc.
};

export type WeatherCategory =
  | "hot"
  | "warm"
  | "mild"
  | "cool"
  | "cold"
  | "rainy"
  | "humid"
  | "windy";

export type BaseFit = "slim" | "regular" | "relaxed" | "oversized" | string;

export type SkinProfileInput = {
  // If season known (from user_skin_profile), pass it directly
  season?: import("../seasonColor").SeasonKey;
  // Optional raw inputs in case season needs to be inferred
  skinTone?: import("../seasonColor").SkinTone;
  undertone?: import("../seasonColor").Undertone;
};

export type WeatherAwareOutfit = {
  fit: string;
  fabrics: string[];
  layering: string[];
  colorGuidance: {
    palette: string[];
    intensity: "lighter" | "deeper" | "darker" | "standard";
    notes: string[];
  };
};
