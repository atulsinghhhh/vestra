
// Main Categories
export const WARDROBE_CATEGORY_ENUM = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "footwear",
  "accessories",
] as const;

// Tops Sub-Categories
export const TOPS_SUB_CATEGORY_ENUM = [
  "t-shirt",
  "tank",
  "blouse",
  "shirt",
  "sweater",
  "hoodie",
  "crop-top",
] as const;

// Bottoms Sub-Categories
export const BOTTOMS_SUB_CATEGORY_ENUM = [
  "jeans",
  "pants",
  "shorts",
  "skirts",
  "leggings",
] as const;

// Dresses & Jumpsuits Sub-Categories
export const DRESSES_SUB_CATEGORY_ENUM = [
  "casual-dress",
  "formal-dress",
  "jumpsuits",
] as const;

// Outerwear Sub-Categories
export const OUTERWEAR_SUB_CATEGORY_ENUM = [
  "jacket",
  "coat",
  "blazers",
  "cardigans",
  "vests",
] as const;

// Footwear Sub-Categories
export const FOOTWEAR_SUB_CATEGORY_ENUM = [
  "sneakers",
  "athletic",
  "boots",
  "booties",
  "sandals",
  "flats",
  "heels",
  "formal-footwear",
] as const;

// Accessories Sub-Categories
export const ACCESSORIES_SUB_CATEGORY_ENUM = [
  "bags-purses",
  "jewelry",
  "hats-caps",
  "scarves-belts",
  "sunglasses",
] as const;

// Colors
export const COLOR_ENUM = [
  "white",
  "black",
  "gray",
  "navy",
  "blue",
  "red",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
  "brown",
  "beige",
  "gold",
  "silver",
  "multicolor",
] as const;

// Fabrics / Materials
export const FABRIC_ENUM = [
  "cotton",
  "cotton-blend",
  "denim",
  "linen",
  "wool",
  "wool-blend",
  "silk",
  "polyester",
  "polyester-blend",
  "nylon",
  "rayon",
  "spandex",
  "spandex-blend",
  "leather",
  "synthetic",
  "mesh",
  "canvas",
] as const;

// Pattern Types
export const PATTERN_ENUM = [
  "solid",
  "striped",
  "floral",
  "checked",
  "printed",
  "textured",
] as const;

// Formality Levels
export const FORMALITY_ENUM = [
  "casual",
  "smart_casual",
  "business",
  "formal",
] as const;

// Seasons
export const SEASON_OPTIONS = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "all-season",
] as const;

// Care Instructions
export const CARE_INSTRUCTION_ENUM = [
  "machine-wash-cold",
  "machine-wash-warm",
  "hand-wash",
  "dry-clean-only",
  "tumble-dry-low",
  "air-dry",
  "do-not-bleach",
  "iron-low",
  "iron-medium",
  "iron-high",
] as const;

// Type Definitions
export type WardrobeCategoryEnum = typeof WARDROBE_CATEGORY_ENUM[number];
export type TopsSubCategory = typeof TOPS_SUB_CATEGORY_ENUM[number];
export type BottomsSubCategory = typeof BOTTOMS_SUB_CATEGORY_ENUM[number];
export type DressesSubCategory = typeof DRESSES_SUB_CATEGORY_ENUM[number];
export type OuterwearSubCategory = typeof OUTERWEAR_SUB_CATEGORY_ENUM[number];
export type FootwearSubCategory = typeof FOOTWEAR_SUB_CATEGORY_ENUM[number];
export type AccessoriesSubCategory = typeof ACCESSORIES_SUB_CATEGORY_ENUM[number];

export type SubCategoryEnum = 
  | TopsSubCategory 
  | BottomsSubCategory 
  | DressesSubCategory 
  | OuterwearSubCategory 
  | FootwearSubCategory 
  | AccessoriesSubCategory;

export type PatternEnum = typeof PATTERN_ENUM[number];
export type FormalityEnum = typeof FORMALITY_ENUM[number];
export type SeasonOption = typeof SEASON_OPTIONS[number];
export type ColorEnum = typeof COLOR_ENUM[number];
export type FabricEnum = typeof FABRIC_ENUM[number];
export type CareInstructionEnum = typeof CARE_INSTRUCTION_ENUM[number];

// Helper to get sub-categories based on main category
export const getSubCategoriesForCategory = (category: WardrobeCategoryEnum): string[] => {
  switch (category) {
    case "tops":
      return TOPS_SUB_CATEGORY_ENUM as unknown as string[];
    case "bottoms":
      return BOTTOMS_SUB_CATEGORY_ENUM as unknown as string[];
    case "dresses":
      return DRESSES_SUB_CATEGORY_ENUM as unknown as string[];
    case "outerwear":
      return OUTERWEAR_SUB_CATEGORY_ENUM as unknown as string[];
    case "footwear":
      return FOOTWEAR_SUB_CATEGORY_ENUM as unknown as string[];
    case "accessories":
      return ACCESSORIES_SUB_CATEGORY_ENUM as unknown as string[];
    default:
      return [];
  }
};

export type WardrobeItem = {
  id?: string;
  user_id: string;
  item_name: string;
  category: WardrobeCategoryEnum;
  sub_category?: string;
  color_primary: ColorEnum | string;
  color_secondary?: ColorEnum | string;
  pattern?: PatternEnum;
  fabric?: FabricEnum | string;
  season?: SeasonOption[];
  formality?: FormalityEnum;
  brand?: string;
  image_url?: string;
  worn_count?: number;
  last_worn_date?: string;
  purchase_date?: string;
  tags?: string[];
  created_at?: string;
  care_instructions?: (CareInstructionEnum | string)[];
  is_available?: boolean;
};
