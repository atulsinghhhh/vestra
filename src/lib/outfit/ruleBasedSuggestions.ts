import { BodyTypeEnum } from "@/lib/bodyType";
import { WeatherCategory } from "@/lib/weather/types";

export type StyleLevel = "Casual" | "Smart Casual" | "Formal";

export type OutfitItem = {
  role: "top" | "bottom" | "outer" | "footwear" | "accessory";
  description: string;
};

export type OutfitSuggestion = {
  label: StyleLevel;
  items: OutfitItem[];
  notes: string[];
};

type Inputs = {
  bodyType?: string | null;
  baseFit: string;
  categories: WeatherCategory[];
  fabrics: string[];
  layering: string[];
  colorPalette: string[];
  avoidColors?: string[] | null;
  colorIntensity: "lighter" | "deeper" | "darker" | "standard";
};

function normalizeBodyType(bodyType?: string | null): BodyTypeEnum | undefined {
  if (!bodyType) return undefined;
  const bt = bodyType.toLowerCase();
  if (bt.includes("hourglass")) return BodyTypeEnum.HOURGLASS;
  if (bt.includes("triangle") && !bt.includes("inverted")) return BodyTypeEnum.TRIANGLE;
  if (bt.includes("inverted")) return BodyTypeEnum.INVERTED_TRIANGLE;
  if (bt.includes("apple")) return BodyTypeEnum.APPLE;
  if (bt.includes("rectangle")) return BodyTypeEnum.RECTANGLE;
  return undefined;
}

export function inferBaseFit(bodyType?: string | null): "slim" | "regular" | "relaxed" {
  const bt = normalizeBodyType(bodyType);
  switch (bt) {
    case BodyTypeEnum.INVERTED_TRIANGLE:
      return "slim";
    case BodyTypeEnum.APPLE:
      return "relaxed";
    default:
      return "regular";
  }
}

function pickColor(palette: string[], avoid?: string[] | null): string {
  const avoidSet = new Set((avoid || []).map((c) => c.toLowerCase()));
  const pick = palette.find((c) => !avoidSet.has(c.toLowerCase()));
  return pick || palette[0] || "neutral";
}

function bodyTypeNote(bt?: BodyTypeEnum): string | undefined {
  switch (bt) {
    case BodyTypeEnum.HOURGLASS:
      return "Highlight the waist; keep balanced proportions.";
    case BodyTypeEnum.TRIANGLE:
      return "Add structure up top to balance the hips.";
    case BodyTypeEnum.INVERTED_TRIANGLE:
      return "Soften shoulders; add volume at hips.";
    case BodyTypeEnum.APPLE:
      return "Create vertical lines; avoid cling at midsection.";
    case BodyTypeEnum.RECTANGLE:
      return "Add shape at waist and vary textures.";
    default:
      return undefined;
  }
}

function weatherNote(categories: WeatherCategory[]): string {
  const notes: string[] = [];
  if (categories.includes("cold")) notes.push("Include insulation and wind block.");
  if (categories.includes("cool")) notes.push("Use removable mid-layers.");
  if (categories.includes("hot")) notes.push("Go breathable and airy.");
  if (categories.includes("humid")) notes.push("Prioritize moisture-wicking next-to-skin.");
  if (categories.includes("rainy")) notes.push("Add waterproof shell.");
  if (categories.includes("windy")) notes.push("Use windproof shell.");
  return notes.join(" ") || "Weather-flexible selections.";
}

function pickTop(categories: WeatherCategory[], fabrics: string[], label: StyleLevel): string {
  const fabricHint = fabrics[0] ? `(${fabrics[0]})` : "";
  if (label === "Casual") {
    if (categories.includes("hot") || categories.includes("humid")) return `Breathable knit tee ${fabricHint}`;
    if (categories.includes("cold")) return `Merino crew sweater ${fabricHint}`;
    return `Oxford or jersey henley ${fabricHint}`;
  }
  if (label === "Smart Casual") {
    if (categories.includes("hot")) return `Linen or cotton-poplin button-down ${fabricHint}`;
    if (categories.includes("cold")) return `Merino mock-neck or fine gauge knit ${fabricHint}`;
    return `Soft-structure button-down ${fabricHint}`;
  }
  if (categories.includes("hot")) return `Lightweight dress shirt (poplin/linen blend) ${fabricHint}`;
  if (categories.includes("cold")) return `Crisp twill dress shirt with wool layer ${fabricHint}`;
  return `Dress shirt with subtle texture ${fabricHint}`;
}

function pickBottom(categories: WeatherCategory[], label: StyleLevel): string {
  if (label === "Casual") {
    if (categories.includes("hot")) return "Airy chino short or lightweight chino";
    return "Tapered chinos or athletic denim";
  }
  if (label === "Smart Casual") {
    if (categories.includes("hot")) return "Lightweight chinos or tropical wool trousers";
    return "Tailored chinos or wool-blend trousers";
  }
  return categories.includes("hot") ? "Tropical wool dress trousers" : "Structured wool dress trousers";
}

function pickOuter(categories: WeatherCategory[], layering: string[]): string | null {
  if (categories.includes("rainy")) return "Waterproof shell or trench";
  if (categories.includes("cold")) return "Insulated coat or wool overcoat";
  if (categories.includes("cool")) return "Unstructured blazer or light jacket";
  if (layering.includes("waterproof outer layer")) return "Waterproof outer layer";
  return null;
}

function pickFootwear(categories: WeatherCategory[], label: StyleLevel): string {
  if (categories.includes("rainy")) return label === "Formal" ? "Weather-safe dress boots" : "Water-resistant sneakers/boots";
  if (categories.includes("hot")) return label === "Formal" ? "Breathable leather loafers" : "Mesh or knit sneakers";
  return label === "Formal" ? "Oxford/derby with rubber sole" : "Leather sneakers or loafers";
}

function buildAccessory(categories: WeatherCategory[], color: string): string {
  if (categories.includes("rainy")) return `Compact umbrella + belt in ${color}`;
  if (categories.includes("cold")) return `Scarf + beanie in ${color}`;
  if (categories.includes("hot")) return `Sunglasses + breathable cap in ${color}`;
  return `Watch + belt in ${color}`;
}

export function buildRuleBasedSuggestions(input: Inputs): OutfitSuggestion[] {
  const bt = normalizeBodyType(input.bodyType);
  const color = pickColor(input.colorPalette, input.avoidColors);
  const bNote = bodyTypeNote(bt);
  const wNote = weatherNote(input.categories);

  const styles: StyleLevel[] = ["Casual", "Smart Casual", "Formal"];
  const outfits: OutfitSuggestion[] = [];

  for (const label of styles) {
    const outer = pickOuter(input.categories, input.layering);
    const items: OutfitItem[] = [
      { role: "top", description: pickTop(input.categories, input.fabrics, label) },
      { role: "bottom", description: pickBottom(input.categories, label) },
      { role: "footwear", description: pickFootwear(input.categories, label) },
      { role: "accessory", description: buildAccessory(input.categories, color) },
    ];
    if (outer) items.splice(2, 0, { role: "outer", description: outer });

    const notes = [
      `Color focus: ${color} (${input.colorIntensity}).`,
      `Fit: ${input.baseFit}.`,
      wNote,
    ];
    if (bNote) notes.push(bNote);

    outfits.push({ label, items, notes });
  }

  return outfits;
}
