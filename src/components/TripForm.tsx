"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

function TripForm({ onSuccess }: { onSuccess?: () => void }) {

    const supabase = createClient();
    const [trips,setTrips] = useState({
        destination: "",
        start_date: "",
        end_date: "",
        trip_type: "",
        activities: "",
        notes: "",
    });
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name,value} = e.target;
        setTrips({...trips,[name]:value});
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to add a trip.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.from("trips").insert([{
                ...trips,
                user_id: user.id
            }]);

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            setTrips({
                destination: "",
                start_date: "",
                end_date: "",
                trip_type: "",
                activities: "",
                notes: "",
            });
            alert("Trip added successfully!");
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            console.error("Submission Error:", error);
            setError(error instanceof Error ? error.message : "Failed to add trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <input 
                    type="text" 
                    name="destination" 
                    placeholder="Destination (e.g. Paris)" 
                    value={trips.destination} 
                    onChange={handleChange} 
                    className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
                    required 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">Start Date</label>
                    <input 
                        type="date" 
                        name="start_date" 
                        value={trips.start_date} 
                        onChange={handleChange} 
                        className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all scheme-dark" 
                        required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 ml-1">End Date</label>
                    <input 
                        type="date" 
                        name="end_date" 
                        value={trips.end_date} 
                        onChange={handleChange} 
                        className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all scheme-dark" 
                        required 
                    />
                </div>
            </div>

            <input 
                type="text" 
                name="trip_type" 
                placeholder="Trip Type (Business, Vacation...)" 
                value={trips.trip_type} 
                onChange={handleChange} 
                className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
            />
            
            <input 
                type="text" 
                name="activities" 
                placeholder="Activities (Sightseeing, Hiking...)" 
                value={trips.activities} 
                onChange={handleChange} 
                className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
            />
            
            <input 
                type="text" 
                name="notes" 
                placeholder="Notes (Optional)" 
                value={trips.notes} 
                onChange={handleChange} 
                className="block w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" 
            />

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Trip...
                    </span>
                ) : (
                    "Add Trip"
                )}
            </button>
            
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                    {error}
                </div>
            )}
        </form>
    )
}

export default TripForm