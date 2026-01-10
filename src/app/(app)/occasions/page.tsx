"use client";

import { useEffect, useState } from "react";
import { getUserOccasions, generateOutfitForOccasionAction, deleteOccasionAction } from "@/lib/occasions/occasion";
import { OccasionEvent } from "@/lib/occasions/types";
import OccasionForm from "@/components/OccasionForm";
import { PackedOutfit } from "@/lib/packing/types"; 

export default function OccasionsPage() {
    const [occasions, setOccasions] = useState<OccasionEvent[]>([]);
    const [activeResult, setActiveResult] = useState<{ id: string, outfit: PackedOutfit | null, ai: { generated_text: string, weather_text: string } | null }>({ id: "", outfit: null, ai: null });
    const [generating, setGenerating] = useState<string | null>(null);

    const loadData = async () => {
        const data = await getUserOccasions();
        setOccasions(data);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleGenerate = async (id: string) => {
        setGenerating(id);
        setActiveResult({ id: "", outfit: null, ai: null }); 
        try {
            const result = await generateOutfitForOccasionAction(id);
            if (result && (result.ruleBased || result.aiSuggestion)) {
                 setActiveResult({ 
                     id, 
                     outfit: result.ruleBased,
                     ai: result.aiSuggestion
                 });
            } else {
                alert("No valid outfit found strictly following rules! Try adding more formal items.");
            }
        } catch (e) {
            console.error(e);
            alert("Generation failed");
        } finally {
            setGenerating(null);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(!confirm("Delete this occasion?")) return;
        await deleteOccasionAction(id);
        loadData();
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 py-12">
            <div className="max-w-6xl mx-auto">
                 <div className="mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 mb-4">
                        Occasions & Events
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Manage your social calendar and get instant, rule-compliant outfit suggestions for every event type.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left: Input */}
                    <div className="lg:col-span-5 space-y-8">
                        <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white">Add Event</h2>
                            </div>
                            <OccasionForm onSuccess={loadData} />
                        </section>
                    </div>

                    {/* Right: List */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex justify-between items-end px-2">
                             <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
                        </div>

                        {occasions.length === 0 && (
                            <div className="p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center text-gray-500">
                                No occasions yet. Add one to get started.
                            </div>
                        )}

                        <div className="space-y-4">
                            {occasions.map((occ) => (
                                <div key={occ.occasion_id} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl relative group hover:bg-white/[0.05] transition-all duration-300">
                                    <button 
                                        onClick={() => handleDelete(occ.occasion_id)}
                                        className="absolute top-6 right-6 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-bold text-white">{occ.occasion_name}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">{occ.dress_code.replace("_", " ")}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                 <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                 {new Date(occ.date_time).toLocaleDateString()}
                                            </span>
                                            {occ.location && (
                                                <span className="flex items-center gap-1.5">
                                                     <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                     {occ.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Result Area */}
                                    {activeResult.id === occ.occasion_id && (
                                        <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2">
                                            
                                            {/* 1. Rule Based Visuals */}
                                            {activeResult.outfit && (
                                                <div className="bg-black/40 p-6 rounded-2xl border border-purple-500/30">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-xs text-purple-300 uppercase font-bold tracking-widest">Recommended Outfit</p>
                                                        <span className="text-xs text-gray-500">Strict Rule Match</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {activeResult.outfit.items.map((item, i) => (
                                                            <div key={i} className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt="" className="w-full aspect-square rounded-lg object-cover bg-black/50" />
                                                                ) : (
                                                                    <div className="w-full aspect-square rounded-lg bg-white/5 flex items-center justify-center">
                                                                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                    </div>
                                                                )}
                                                                <div className="text-xs">
                                                                    <p className="text-gray-200 font-semibold truncate">{item.item_name}</p>
                                                                    <p className="text-gray-500 text-[10px] uppercase">{item.sub_category}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. AI Advice */}
                                            {activeResult.ai && (
                                                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                         <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                         </div>
                                                         <p className="text-xs text-indigo-300 uppercase font-bold tracking-widest">AI Stylist's Advice</p>
                                                    </div>
                                                    
                                                    {activeResult.ai.weather_text && (
                                                        <p className="text-xs text-gray-400 mb-4 italic border-l-2 border-indigo-500 pl-3">
                                                            "{activeResult.ai.weather_text}"
                                                        </p>
                                                    )}
                                                    
                                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                                                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                                            {activeResult.ai.generated_text}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleGenerate(occ.occasion_id)}
                                        disabled={generating === occ.occasion_id}
                                        className="w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-purple-50 transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2"
                                    >
                                        {generating === occ.occasion_id ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5 text-purple-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                                Consulting AI...
                                            </>
                                        ) : (
                                            <>
                                            Generate with AI
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
