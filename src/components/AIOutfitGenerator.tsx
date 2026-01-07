"use client";
import { useState } from "react";
import { generateOutfit } from "@/lib/huggingface/generateOutfit";

type Props = { userId: string };

export default function AIOutfitGenerator({ userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await generateOutfit(userId);
      setText(res?.generated_text ?? "No outfit suggestion generated.");
    } catch (e: any) {
      setError(e?.message || "Failed to generate outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm">AI Outfit Suggestions</p>
        <button
          onClick={run}
          disabled={loading}
          className="bg-white text-black text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate Outfits'}
        </button>
      </div>
      {error && <div className="text-xs text-red-300">{error}</div>}
      {text && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-200 whitespace-pre-wrap">
          {text}
        </div>
      )}
    </div>
  );
}
