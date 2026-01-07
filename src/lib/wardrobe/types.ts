
export const WARDROBE_CATEGORY_ENUM = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "bags",
] as const;

export const PATTERN_ENUM = [
  "solid",
  "striped",
  "checkered",
  "floral",
  "polka-dot",
  "geometric",
  "abstract",
  "animal-print",
  "plaid",
] as const;

export const FORMALITY_ENUM = [
  "casual",
  "smart-casual",
  "business",
  "formal",
  "athletic",
] as const;

export const SEASON_OPTIONS = [
  "spring",
  "summer",
  "autumn",
  "winter",
] as const;

export type WardrobeCategoryEnum = typeof WARDROBE_CATEGORY_ENUM[number];
export type PatternEnum = typeof PATTERN_ENUM[number];
export type FormalityEnum = typeof FORMALITY_ENUM[number];
export type SeasonOption = typeof SEASON_OPTIONS[number];

export type WardrobeItem = {
  item_id?: string;
  user_id: string;
  item_name: string;
  category: WardrobeCategoryEnum;
  sub_category?: string;
  color_primary: string;
  color_secondary?: string;
  pattern?: PatternEnum;
  fabric?: string;
  season?: SeasonOption[];
  formality?: FormalityEnum;
  brand?: string;
  image_url?: string;
  worn_count?: number;
  last_worn_date?: string;
  purchase_date?: string;
  tags?: string[];
  created_at?: string;
};
