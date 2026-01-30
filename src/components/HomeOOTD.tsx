"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getDailyOutfitAction, confirmOutfitWearAction } from "@/lib/ootd/ootd";
import { OOTDResult } from "@/lib/ootd/ootdLogic";
import { createClient } from "@/lib/supabase/client";

export default function HomeOOTD() {
    const [ootd, setOotd] = useState<OOTDResult>(null);
    const [loading, setLoading] = useState(true);
    const [wearing, setWearing] = useState(false);
    const [wornToday, setWornToday] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 setUserId(user.id);
                 loadOOTD();
             } else {
                 setLoading(false);
             }
        };
        checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadOOTD = async () => {
        setLoading(true);
        try {
            const res = await getDailyOutfitAction();
            setOotd(res);
        } catch (e: unknown) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleWear = async () => {
        if (!ootd) return;
        setWearing(true);
        try {
            const itemIds = ootd.outfit.items.map(i => i.id).filter((id): id is string => !!id);
            if(itemIds.length > 0) {
                 await confirmOutfitWearAction(itemIds);
                 setWornToday(true);
            }
        } catch {
            alert("Failed to update stats");
        } finally {
            setWearing(false);
        }
    };

    if (!userId) return null;

    return (
        <section className="py-12 px-6 bg-black relative z-10">
            <div className="max-w-6xl mx-auto">
                 <div className="bg-linear-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                            <svg className="w-64 h-64 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-12 relative z-10">
                            {/* Left: Info */}
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wider uppercase border border-indigo-500/20">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Outfit of the Day
                                </div>
                                
                                <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                                    Why this fits today.
                                </h2>
                                
                                {loading ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                ) : ootd ? (
                                    <div className="space-y-4">
                                        <div className="prose prose-invert">
                                            <p className="text-xl text-gray-300 leading-relaxed font-light">
                                                {ootd.ai.explanation}
                                            </p>
                                        </div>
                                        
                                        {ootd.ai.note && (
                                             <div className="flex items-start gap-3 bg-purple-900/20 p-4 rounded-xl border border-purple-500/20">
                                                <svg className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-sm text-purple-200 italic">&quot;{ootd.ai.note}&quot;</p>
                                             </div>
                                        )}
                                        
                                        <div className="flex items-center gap-4 pt-4">
                                            {wornToday ? (
                                                <button disabled className="px-8 py-3 rounded-full bg-green-500/20 text-green-400 font-bold border border-green-500/20 cursor-default flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    Worn Today
                                                </button>
                                            ) : (
                                                <button onClick={handleWear} disabled={wearing} className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2">
                                                    {wearing ? "Updating..." : "Wear This"}
                                                </button>
                                            )}
                                            
                                            <button onClick={loadOOTD} disabled={wearing || loading} className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10">
                                                Shuffle
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                     <div className="text-gray-500">
                                         Could not generate an outfit. Is your wardrobe empty?
                                     </div>
                                )}
                            </div>

                            {/* Right: Visuals */}
                            <div className="flex-1">
                                {loading ? (
                                    <div className="h-[400px] w-full bg-white/5 rounded-3xl animate-pulse"></div>
                                ) : ootd && ootd.outfit ? (
                                    <div className="grid grid-cols-2 gap-4 h-full content-center">
                                         {ootd.outfit.items.map((item, i: number) => (
                                             <div key={i} className="group relative aspect-3/4 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                                                 {item.image_url ? (
                                                     <Image src={item.image_url} alt={item.item_name} fill className="object-cover transition-transform group-hover:scale-105" />
                                                 ) : (
                                                     <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                                                 )}
                                                 <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-3">
                                                     <p className="text-sm font-bold text-white truncate">{item.item_name}</p>
                                                     <p className="text-xs text-gray-400 uppercase">{item.sub_category}</p>
                                                 </div>
                                             </div>
                                         ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        {ootd && ootd.weather && (
                            <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm text-gray-300">
                                <span>{ootd.weather.city}</span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span className="text-white font-bold">{ootd.weather.temp}°C {ootd.weather.condition}</span>
                            </div>
                        )}
                    </div>
            </div>
        </section>
    );
}
