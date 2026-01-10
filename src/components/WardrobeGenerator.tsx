"use client";
import { useState } from "react";
import { generateWardrobeOutfit } from "@/lib/huggingface/generateWardrobeOutfit";

type Props = { userId: string };

export default function WardrobeGenerator({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [formality, setFormality] = useState("casual");

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await generateWardrobeOutfit(userId, formality);
      setText(res?.generated_text ?? "No outfit suggestion generated.");
      setWeather(res?.weather_text ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
           <p className="text-white font-medium">✨ AI Stylist (My Wardrobe)</p>
           <p className="text-xs text-gray-400">Generates outfits using ONLY your specific items.</p>
        </div>
        
        <div className="flex gap-2">
            <select 
                value={formality}
                onChange={(e) => setFormality(e.target.value)}
                className="bg-black/20 text-white text-sm border border-white/10 rounded-xl px-3 outline-none"
            >
                <option value="casual">Casual</option>
                <option value="smart_casual">Smart Casual</option>
                <option value="business">Business</option>
                <option value="formal">Formal</option>
            </select>
            <button
            onClick={run}
            disabled={loading}
            className="bg-purple-600 text-white text-sm font-medium py-2.5 px-6 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
            {loading ? 'Styling…' : 'Create Outfit'}
            </button>
        </div>
      </div>
      {error && <div className="text-xs text-red-300">{error}</div>}
      
      {weather && (
        <div className="text-xs text-purple-200 bg-purple-900/30 px-3 py-2 rounded-lg border border-purple-500/20">
            {weather}
        </div>
      )}

      {text && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}
