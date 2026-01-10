"use client";

import { useState, useEffect } from "react";
import TripForm from "./TripForm";
import { generatePackingListAction, getUserTrips } from "@/lib/packing/packing";
import { PackingList } from "@/lib/packing/types";

export default function PackingDashboard() {
    const [trips, setTrips] = useState<any[]>([]);
    const [selectedList, setSelectedList] = useState<PackingList | null>(null);
    const [loading, setLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const loadTrips = async () => {
        const t = await getUserTrips();
        setTrips(t);
    };

    useEffect(() => {
        loadTrips();
    }, []);

    const handleGenerate = async (tripId: string) => {
        setGeneratingId(tripId);
        try {
            const list = await generatePackingListAction(tripId);
            setSelectedList(list);
        } catch (e) {
            alert("Failed to generate list: " + e);
        } finally {
            setGeneratingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 text-white">
            <div className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white via-purple-200 to-indigo-200 mb-4">
                    Smart Packing Assistant
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                    Add your trips and let our AI generate the perfect packing list based on your wardrobe, destination weather, and events.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-10">
                {/* Left: Add Trip & List (5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-white/3 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">New Trip</h2>
                        </div>
                        <TripForm onSuccess={loadTrips} /> 
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <h2 className="text-xl font-bold text-white">Your Trips</h2>
                            <button onClick={loadTrips} className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Refresh
                            </button>
                        </div>
                        
                        {trips.length === 0 && (
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center border-dashed">
                                <p className="text-gray-500 text-sm">No upcoming trips found.</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {trips.map(trip => (
                                <div key={trip.trip_id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 p-5 rounded-2xl transition-all duration-300 flex justify-between items-center group-hover:translate-x-1">
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1 group-hover:text-purple-200 transition-colors">{trip.destination}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{trip.trip_type}</span>
                                            <span>•</span>
                                            <span>{trip.start_date}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleGenerate(trip.trip_id)}
                                        disabled={generatingId === trip.trip_id}
                                        className="bg-white text-black hover:bg-purple-50 disabled:bg-gray-500 disabled:text-gray-300 text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-white/10 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                                    >
                                        {generatingId === trip.trip_id ? (
                                            <>
                                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Packing...
                                            </>
                                        ) : (
                                            <>
                                            Pack Me
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right: Generated List (7 cols) */}
                <div className="lg:col-span-7">
                    <div className="bg-white/3 backdrop-blur-xl border border-white/10 p-8 rounded-3xl min-h-[600px] shadow-2xl shadow-black/50 relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="flex items-center gap-3 mb-8 relative z-10">
                             <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">Your Packing List</h2>
                        </div>
                        
                        {!selectedList ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-white/10 rounded-2xl relative z-10">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <p className="text-gray-400 font-medium">Select a trip to generate your packing list</p>
                                <p className="text-gray-600 text-sm mt-1">We'll calculate everything you need</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                                <div className="bg-linear-to-br from-purple-900/40 to-indigo-900/40 p-6 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">Weather Context</p>
                                            <p className="text-2xl font-bold text-white mb-2">{selectedList.weatherSummary}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-block bg-black/30 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                                 <p className="text-xs text-gray-300 font-medium">{selectedList.totalDays} Days Trip</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-6 text-sm text-gray-400">
                                        <div><span className="text-white font-bold">{selectedList.outfits.length}</span> Outfits</div>
                                        <div><span className="text-white font-bold">{selectedList.backupItems.length}</span> Extras</div>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedList.outfits.map((outfit, i) => (
                                        <div key={i} className="group bg-black/40 hover:bg-black/60 p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="flex items-center gap-2">
                                                    <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded">DAY {outfit.day}</span>
                                                    <span className="text-sm font-medium text-gray-300 capitalize">{outfit.occasion}</span>
                                                </span>
                                            </div>
                                            <div className="flex gap-3 flex-wrap">
                                                {outfit.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 pl-1 pr-3 py-1 rounded-lg border border-white/5 transition-colors cursor-default">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt="" className="w-10 h-10 rounded-md object-cover bg-black/50" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-200">{item.item_name}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase">{item.sub_category || item.category}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
