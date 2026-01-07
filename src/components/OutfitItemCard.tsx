"use client";

import { WardrobeItem } from "@/lib/wardrobe/types";

function OutfitItemCard({
    item,
    slot,
    onExclude,
}: {
    item: WardrobeItem;
    slot: string;
    onExclude: (itemId?: string | null) => void;
}) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 group-hover:border-white/40 transition-all" />
            <div className="relative z-20 p-4">
                {/* Item Image */}
                {item.image_url && (
                    <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-32 object-cover rounded-xl mb-3 border border-white/10"
                    />
                )}

                {/* Item Info */}
                <h4 className="font-medium text-white text-sm mb-1">{item.item_name}</h4>
                <p className="text-xs text-gray-400 capitalize mb-2">{item.category}</p>

                {/* Color Tags */}
                <div className="flex gap-1.5 mb-3 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20 text-gray-300">
                        {item.color_primary}
                    </span>
                    {item.color_secondary && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20 text-gray-300">
                            {item.color_secondary}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs mb-3">
                    {item.pattern && item.pattern !== "solid" && (
                        <p className="text-gray-400">Pattern: <span className="text-gray-300 capitalize">{item.pattern}</span></p>
                    )}
                    {item.formality && (
                        <p className="text-gray-400">Formality: <span className="text-gray-300 capitalize">{item.formality}</span></p>
                    )}
                </div>

                {/* Exclude Button */}
                <button
                    onClick={() => onExclude(item.item_id || (item as any).id)}
                    className="w-full text-xs py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-all"
                >
                    Exclude Item
                </button>
            </div>
        </div>
    );
}


export default OutfitItemCard;