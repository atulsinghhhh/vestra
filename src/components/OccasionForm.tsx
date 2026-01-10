"use client";

import { useState } from "react";
import { createOccasionAction } from "@/lib/occasions/occasion";
import { OccasionType, DressCode } from "@/lib/occasions/types";

export default function OccasionForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    
    // Default form state
    const [form, setForm] = useState({
        occasion_name: "",
        date_time: "",
        occasion_type: "social" as OccasionType,
        dress_code: "smart_casual" as DressCode,
        location: "",
        notes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createOccasionAction({
                ...form,
                date_time: new Date(form.date_time).toISOString() // Ensure ISO format
            });
            onSuccess();
            // Reset
            setForm({
                occasion_name: "",
                date_time: "",
                occasion_type: "social",
                dress_code: "smart_casual",
                location: "",
                notes: ""
            });
        } catch (err) {
            console.error(err);
            alert("Failed to create occasion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div className="space-y-2">
                <input
                    name="occasion_name"
                    placeholder="Occasion Name (e.g. My Wedding)"
                    value={form.occasion_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Date</label>
                    <input
                        type="datetime-local"
                        name="date_time"
                        value={form.date_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all scheme-dark"
                        required
                    />
                </div>
                <div className="space-y-1">
                     <label className="text-xs text-gray-400 ml-1">Location</label>
                     <input
                        name="location"
                        placeholder="Location"
                        value={form.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Type</label>
                    <div className="relative">
                        <select
                            name="occasion_type"
                            value={form.occasion_type}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="professional" className="bg-zinc-900 text-white">Professional</option>
                            <option value="social" className="bg-zinc-900 text-white">Social</option>
                            <option value="formal" className="bg-zinc-900 text-white">Formal</option>
                            <option value="casual" className="bg-zinc-900 text-white">Casual</option>
                            <option value="active" className="bg-zinc-900 text-white">Active</option>
                            <option value="travel" className="bg-zinc-900 text-white">Travel</option>
                            <option value="special" className="bg-zinc-900 text-white">Special</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Dress Code</label>
                    <div className="relative">
                        <select
                            name="dress_code"
                            value={form.dress_code}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="casual" className="bg-zinc-900 text-white">Casual</option>
                            <option value="smart_casual" className="bg-zinc-900 text-white">Smart Casual</option>
                            <option value="business_casual" className="bg-zinc-900 text-white">Business Casual</option>
                            <option value="business_formal" className="bg-zinc-900 text-white">Business Formal</option>
                            <option value="formal" className="bg-zinc-900 text-white">Formal</option>
                            <option value="black_tie" className="bg-zinc-900 text-white">Black Tie</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
                {loading ? "Creating..." : "Create Occasion"}
            </button>
        </form>
    );
}
