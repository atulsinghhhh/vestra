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

      // Helpers for randomness
      const randomDate = (startObj: Date, endObj: Date) => 
        new Date(startObj.getTime() + Math.random() * (endObj.getTime() - startObj.getTime())).toISOString();
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const today = new Date();
      const randomInt = (max: number) => Math.floor(Math.random() * max);

      const dummyItems: Partial<WardrobeItem>[] = [
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
          item_name: "Black Leather Jacket",
          category: "outerwear",
          sub_category: "jacket",
          color_primary: "black",
          fabric: "leather",
          season: ["autumn", "winter"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1551028919-ac7eddce1d34?auto=format&fit=crop&q=80&w=600",
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
          last_worn_date: null as any,
          is_available: true
        },
         {
          user_id: user.id,
          item_name: "Blue Denim Jeans",
          category: "bottoms",
          sub_category: "jeans",
          color_primary: "blue",
          fabric: "denim",
          season: ["all-season"],
          formality: "casual",
          image_url: "https://images.unsplash.com/photo-1542272617-08f086302542?auto=format&fit=crop&q=80&w=600",
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
          last_worn_date: null as any,
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
          image_url: "https://images.unsplash.com/photo-1542840410-3092f48dfc11?auto=format&fit=crop&q=80&w=600",
          brand: "Timberland",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(25),
          last_worn_date: randomDate(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), today),
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
          image_url: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=600",
          brand: "Mejuri",
          purchase_date: randomDate(oneYearAgo, today),
          worn_count: randomInt(10),
          last_worn_date: null as any,
          is_available: true
        }
      ];

      const { error } = await supabase.from("wardrobe_items").insert(dummyItems);

      if (error) throw error;

      alert("Dummy data added! Refresh the page to see items.");
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Failed to seed data.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition"
      >
        {seeding ? "Adding..." : "Add Dummy Items"}
      </button>
    </div>
  );
}
