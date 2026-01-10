"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { WardrobeItem } from "@/lib/wardrobe/types";

export default function DummyDataSeeder() {
  const [seeding, setSeeding] = useState(false);
  const supabase = createClient();

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to seed data.");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single();

      const gender = profile?.gender || "Female"; // Default to Female if not set
      const isMale = ["Male", "male", "Man", "man"].includes(gender);

      console.log("Seeding for gender:", gender);

      // Helpers for randomness
      const randomDate = (startObj: Date, endObj: Date) => 
        new Date(startObj.getTime() + Math.random() * (endObj.getTime() - startObj.getTime())).toISOString();
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const today = new Date();
      const randomInt = (max: number) => Math.floor(Math.random() * max);

      // COMMON ITEMS (Unisex)
      const commonItems: Partial<WardrobeItem>[] = [
        {
          user_id: user.id,
          item_name: "White Linen Shirt",
          category: "tops",
          sub_category: "shirt",
          color_primary: "white",
          fabric: "linen",
          season: ["summer", "spring"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
          brand: "Uniqlo",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(20),
          last_worn_date: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Black Leather Jacket",
          category: "outerwear",
          sub_category: "jacket",
          color_primary: "black",
          fabric: "leather",
          season: ["autumn", "winter"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1520183802917-238424ae2a28?auto=format&fit=crop&q=80&w=600",
          brand: "AllSaints",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(50),
          last_worn_date: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Beige Trench Coat",
          category: "outerwear",
          sub_category: "coat",
          color_primary: "beige",
          fabric: "cotton-blend",
          season: ["autumn", "spring"],
          formality: "business",
          image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600",
          brand: "Burberry",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(10),
          last_worn_date: undefined,
          is_available: true
        },
         {
          user_id: user.id,
          item_name: "Blue Denim Jeans", //1
          category: "bottoms",
          sub_category: "jeans",
          color_primary: "blue",
          fabric: "denim",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
          brand: "Levi's",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(100),
          last_worn_date: randomDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
         {
          user_id: user.id,
          item_name: "White Sneakers",
          category: "footwear",
          sub_category: "sneakers",
          color_primary: "white",
          fabric: "leather",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=600",
          brand: "Nike",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(40),
          last_worn_date: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Classic Wayfarer Sunglasses",
          category: "accessories",
          sub_category: "sunglasses",
          color_primary: "black",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600",
          brand: "Ray-Ban",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(60),
          last_worn_date: today.toISOString(),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Grey Wool Sweater",
          category: "tops",
          sub_category: "sweater",
          color_primary: "gray",
          fabric: "wool",
          season: ["winter", "autumn"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600",
          brand: "J.Crew",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(12),
          last_worn_date: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Brown Leather Boots",
          category: "footwear",
          sub_category: "boots",
          color_primary: "brown",
          fabric: "leather",
          season: ["autumn", "winter"],
          formality: "smart_casual",
          image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b69f?auto=format&fit=crop&q=80&w=600",
          brand: "Timberland",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(25),
          last_worn_date: randomDate(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Puffer Jacket (Black)",
          category: "outerwear",
          sub_category: "coat",
          color_primary: "black",
          fabric: "synthetic",
          season: ["winter"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&q=80&w=600",
          brand: "North Face",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(40),
          last_worn_date: today.toISOString(),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Wool Scarf (Grey)",
          category: "accessories",
          sub_category: "scarves-belts",
          color_primary: "grey",
          fabric: "wool",
          season: ["winter", "autumn"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1608667508764-33cf0726b13a?auto=format&fit=crop&q=80&w=600",
          brand: "Acne Studios",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(20),
          last_worn_date: today.toISOString(),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Leather Sandals",
          category: "footwear",
          sub_category: "sandals",
          color_primary: "brown",
          fabric: "leather",
          season: ["summer"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=600",
          brand: "Birkenstock",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(30),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Grey Hoodie",
          category: "tops",
          sub_category: "hoodie",
          color_primary: "grey",
          fabric: "cotton",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600",
          brand: "Champion",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(100),
          last_worn_date: today.toISOString(),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Running Shoes",
          category: "footwear",
          sub_category: "sneakers",
          color_primary: "blue",
          fabric: "mesh",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
          brand: "Adidas",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(60),
          last_worn_date: today.toISOString(),
          is_available: true
        }
      ];

      // MALE ITEMS
      const maleItems: Partial<WardrobeItem>[] = [
        {
          user_id: user.id,
          item_name: "Navy Chino Pants",
          category: "bottoms",
          sub_category: "pants",
          color_primary: "navy",
          fabric: "cotton",
          season: ["all-season"],
          formality: "smart_casual",
          image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=600",
          brand: "Banana Republic",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(30),
          last_worn_date: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Charcoal Wool Suit Jacket",
          category: "outerwear",
          sub_category: "blazers",
          color_primary: "grey",
          fabric: "wool",
          season: ["autumn", "winter", "spring"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=600",
          brand: "Hugo Boss",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(5),
          last_worn_date: randomDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Charcoal Wool Trousers",
          category: "bottoms",
          sub_category: "pants",
          color_primary: "grey",
          fabric: "wool",
          season: ["autumn", "winter", "spring"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
          brand: "Hugo Boss",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(5),
          last_worn_date: randomDate(new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Silk Tie (Navy)",
          category: "accessories",
          sub_category: "scarves-belts",
          color_primary: "navy",
          season: ["all-season"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1589756823695-278bc354f69e?auto=format&fit=crop&q=80&w=600",
          brand: "Hermès",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(3),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Black Oxford Shoes",
          category: "footwear",
          sub_category: "formal-footwear",
          color_primary: "black",
          fabric: "leather",
          season: ["all-season"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=600",
          brand: "Church's",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(15),
          last_worn_date: randomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Beige Chino Shorts",
          category: "bottoms",
          sub_category: "shorts",
          color_primary: "beige",
          fabric: "cotton",
          season: ["summer"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=600",
          brand: "J.Crew",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(10),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Linen Trousers (White)",
          category: "bottoms",
          sub_category: "pants",
          color_primary: "white",
          fabric: "linen",
          season: ["summer"],
          formality: "smart_casual",
          image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
          brand: "Club Monaco",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(8),
          last_worn_date: undefined,
          is_available: true
        }
      ];

      // FEMALE ITEMS
      const femaleItems: Partial<WardrobeItem>[] = [
        {
          user_id: user.id,
          item_name: "Floral Silk Blouse",
          category: "tops",
          sub_category: "blouse",
          color_primary: "pink",
          color_secondary: "white",
          fabric: "silk",
          season: ["spring", "summer"],
          formality: "smart_casual",
          pattern: "floral",
          image_url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&q=80&w=600",
          brand: "Zara",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(5),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Black Pencil Skirt",
          category: "bottoms",
          sub_category: "skirts",
          color_primary: "black",
          fabric: "polyester-blend",
          season: ["all-season"],
          formality: "business",
          image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=600",
          brand: "H&M",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(15),
          last_worn_date: randomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Red Summer Dress",
          category: "dresses",
          sub_category: "casual-dress",
          color_primary: "red",
          fabric: "cotton",
          season: ["summer"],
          formality: "casual",
          pattern: "solid",
          image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
          brand: "Reformation",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(8),
          last_worn_date: randomDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), today),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Gold Pendant Necklace",
          category: "accessories",
          sub_category: "jewelry",
          color_primary: "gold",
          season: ["all-season"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
          brand: "Mejuri",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(10),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Yoga Leggings (Black)",
          category: "bottoms",
          sub_category: "leggings",
          color_primary: "black",
          fabric: "synthetic",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&q=80&w=600",
          brand: "Lululemon",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(80),
          last_worn_date: today.toISOString(),
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Striped Breton Top",
          category: "tops",
          sub_category: "t-shirt",
          color_primary: "white",
          color_secondary: "navy",
          pattern: "striped",
          fabric: "cotton",
          season: ["spring", "summer", "autumn"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=600",
          brand: "Saint James",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(20),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Cocktail Dress (Black)",
          category: "dresses",
          sub_category: "formal-dress",
          color_primary: "black",
          fabric: "polyester",
          season: ["all-season"],
          formality: "formal",
          image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600",
          brand: "Reiss",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(4),
          last_worn_date: undefined,
          is_available: true
        },
        {
          user_id: user.id,
          item_name: "Cable Knit Cardigan",
          category: "tops",
          sub_category: "sweater",
          color_primary: "cream",
          fabric: "wool",
          season: ["autumn", "winter"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600",
          brand: "Ralph Lauren",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(15),
          last_worn_date: undefined,
          is_available: true
        }
      ];

      const itemsToInsert = isMale 
        ? [...maleItems, ...commonItems] 
        : [...femaleItems, ...commonItems];

      const { error } = await supabase.from("wardrobe_items").insert(itemsToInsert);

      if (error) throw error;

      alert(`Added ${itemsToInsert.length} dummy items for ${gender}! Refreshing...`);
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Failed to seed data.");
    } finally {
      setSeeding(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure? This will delete ALL your wardrobe items.")) return;
    
    setSeeding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      alert("Wardrobe cleared!");
      window.location.reload();
    } catch (error) {
      console.error("Error clearing wardrobe:", error);
      alert("Failed to clear wardrobe.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <button
        onClick={handleClear}
        disabled={seeding}
        className="bg-red-600/80 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition text-xs backdrop-blur-md"
      >
        Clear Wardrobe
      </button>
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition"
      >
        {seeding ? "Working..." : "Add Dummy Items"}
      </button>
    </div>
  );
}
