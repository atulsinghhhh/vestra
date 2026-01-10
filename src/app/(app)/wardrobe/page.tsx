"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import WardrobeItemForm from "@/components/WardrobeItemForm";
import WardrobeGenerator from "@/components/WardrobeGenerator";
import DummyDataSeeder from "@/components/DummyDataSeeder";
import type { WardrobeItem } from "@/lib/wardrobe/types";
import { getPublicImageUrl, preloadImages } from "@/lib/supabase/imageUtils";

function WardrobePage() {
    const supabase = createClient();

    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchWardrobeItems(user.id);
            }
        };
        fetchUser();
    }, []);

    const fetchWardrobeItems = async (uid: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("wardrobe_items")
                .select("*")
                .eq("user_id", uid)
                .order("created_at", { ascending: false });

            if (error) throw error;
            
            const items = data || [];
            setWardrobeItems(items);
            
            // Preload all images
            if (items.length > 0) {
                const imagePaths = items.map(item => item.image_url);
                await preloadImages(imagePaths);
                
                // Generate public URLs for all images
                const urls: Record<string, string> = {};
                for (const item of items) {
                    if (item.id && item.image_url) {
                        const publicUrl = await getPublicImageUrl(item.image_url);
                        if (publicUrl) {
                            urls[item.id] = publicUrl;
                        }
                    }
                }
                setImageUrls(urls);
            }
        } catch (error) {
            console.error("Error fetching wardrobe items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemAdded = (newItem: WardrobeItem) => {
        setWardrobeItems((prev) => [newItem, ...prev]);
        setShowForm(false);
        
        // Update image URLs for new item
        if (newItem.id && newItem.image_url) {
            const itemId = newItem.id;
            getPublicImageUrl(newItem.image_url).then(url => {
                if (url) {
                    setImageUrls(prev => ({ ...prev, [itemId]: url }));
                }
            });
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] pt-24 pb-12 relative overflow-hidden text-gray-200 font-sans">
            {/* Background effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light tracking-widest text-white">MY WARDROBE</h1>
                        <p className="text-sm text-gray-400 font-light tracking-wide uppercase mt-1">
                            Manage your clothing collection
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-white text-black font-medium py-3 px-6 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                    >
                        {showForm ? "Cancel" : "+ Add Item"}
                    </button>
                </div>

                {/* Wardrobe AI Generator */}
                {userId && <WardrobeGenerator userId={userId} />}

                {/* Add Item Form */}
                {showForm && userId && (
                    <div className="mb-8">
                        <WardrobeItemForm userId={userId} onSaveSuccess={handleItemAdded} />
                    </div>
                )}

                {/* Wardrobe Items Grid */}
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Loading wardrobe...</div>
                ) : wardrobeItems.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
                            <p className="text-gray-400 mb-4">Your wardrobe is empty</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-white text-black font-medium py-3 px-6 rounded-xl hover:bg-gray-100 transition"
                            >
                                Add Your First Item
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wardrobeItems.map((item) => {
                            const imageUrl = item.id ? imageUrls[item.id] || item.image_url : item.image_url;
                            
                            return (
                            <div
                                key={item.id}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition group"
                            >
                                {imageUrl ? (
                                    <div className="aspect-square overflow-hidden bg-white/5">
                                        <img
                                            src={imageUrl}
                                            alt={item.item_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            onError={(e) => {
                                                console.warn(`Image failed to load for ${item.item_name}`);
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-white/5 flex items-center justify-center">
                                        <span className="text-gray-500 text-4xl">👕</span>
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="text-white font-medium text-lg mb-1">{item.item_name}</h3>
                                    <p className="text-gray-400 text-sm capitalize mb-2">
                                        {item.category} {item.sub_category && `• ${item.sub_category}`}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                                            {item.color_primary}
                                        </span>
                                        {item.formality && (
                                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300 capitalize">
                                                {item.formality}
                                            </span>
                                        )}
                                    </div>
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.slice(0, 3).map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <DummyDataSeeder />
        </div>
    );
}

export default WardrobePage;
 
