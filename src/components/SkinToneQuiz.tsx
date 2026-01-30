"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    SKIN_TONE_ENUM,
    UNDERTONE_ENUM,
    SEASON_UI_ENUM,
    seasonPalettes,
    calculateSeason,
    toDbSeasonKey,
    isValidSkinTone,
    type Undertone,
    type SkinTone,
    type SeasonKey,
} from "@/lib/seasonColor";

type Props = {
    userId: string | null;
    onSaveSuccess?: () => void;
};

export default function SkinToneQuiz({ userId, onSaveSuccess }: Props) {
  const supabase = createClient();

  const [skinTone, setSkinTone] = useState<string>("");
  const [veinColor, setVeinColor] = useState<string>(""); 
  const [sunReaction, setSunReaction] = useState<string>(""); 

  const [undertone, setUndertone] = useState<string>("");
  const [season, setSeason] = useState<string>(""); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const computeScores = () => {
    let cool = 0,
      warm = 0,
      neutral = 0;

    const addScore = (val: string) => {
      if (val === "cool") cool += 1;
      else if (val === "warm") warm += 1;
      else if (val === "neutral") neutral += 1;
    };

    addScore(veinColor);
    addScore(sunReaction);

    const scores = [
      { key: "cool", value: cool },
      { key: "warm", value: warm },
      { key: "neutral", value: neutral },
    ];
    const sorted = scores.sort((a, b) => b.value - a.value);
    const top = sorted[0];
    const second = sorted[1];

    const picked = top.value - second.value <= 1 ? "neutral" : (top.key as typeof UNDERTONE_ENUM[number]);
    return { picked, cool, warm, neutral };
  };

  const handleCalculate = () => {
    setError(null);
    setSuccess(false);

    if (!isValidSkinTone(skinTone)) {
      setError("Please select a valid natural skin shade.");
      return;
    }

    const { picked } = computeScores();
    setUndertone(picked);
    const s = calculateSeason(picked as Undertone, skinTone as SkinTone);
    setSeason(s);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!userId) {
      setError("You must be signed in to save your skin profile.");
      return;
    }

    if (!isValidSkinTone(skinTone)) {
      setError("Please select a valid natural skin shade.");
      return;
    }

    if (!UNDERTONE_ENUM.includes(undertone as "cool" | "warm" | "neutral")) {
      setError("Please calculate undertone before saving.");
      return;
    }

    if (!SEASON_UI_ENUM.includes(season as "spring" | "summer" | "autumn" | "winter")) {
      setError("Seasonal palette not calculated.");
      return;
    }

    const palette = seasonPalettes[season as keyof typeof seasonPalettes];
    const dbSeason = toDbSeasonKey(season as SeasonKey);

    const payload = {
      user_id: userId,
      skin_tone: skinTone,
      undertone: undertone,
      seasonal_palette: dbSeason,
      perferred_colors: palette.preferred, 
      avoid_colors: palette.avoid,
    };

    try {
      setSaving(true);
      const { error: upsertError } = await supabase
        .from("user_skin_profile")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      setSuccess(true);
      onSaveSuccess?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save skin profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" />
      <div className="relative z-20 p-8 flex flex-col gap-6">
        <div className="text-center space-y-2 mb-2">
          <h2 className="text-3xl font-light tracking-widest text-white">SKIN TONE & UNDERTONE</h2>
          <p className="text-sm text-gray-400 font-light tracking-wide uppercase">Self-selection quiz for seasonal palette</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs text-center">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-xs text-center">Profile saved successfully!</div>
        )}

        {/* Natural Skin Shade */}
        <div className="group relative">
          <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-4">Select your Skin Tone</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {SKIN_TONE_ENUM.map((tone) => {
              const colorMap: Record<string, string> = {
                 fair: "#FFE0D1",
                 light: "#EAC0A6",
                 medium: "#D3A183",
                 olive: "#C69666",
                 tan: "#A37254",
                 deep: "#6D4733",
              };
              const color = colorMap[tone] || "#ccc";
              
              return (
              <label key={tone} className="cursor-pointer group/item text-center">
                <input
                  type="radio"
                  name="skinTone"
                  value={tone}
                  checked={skinTone === tone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  className="hidden"
                />
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 transition-all duration-300 ${skinTone === tone ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent group-hover/item:scale-105'}`} style={{ backgroundColor: color }}>
                    {skinTone === tone && (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    )}
                </div>
                <span className={`text-xs capitalize transition-colors ${skinTone === tone ? 'text-white font-medium' : 'text-gray-400 group-hover/item:text-gray-300'}`}>{tone}</span>
              </label>
            )})}
          </div>
        </div>

        {/* Vein Color (wrist) */}
        <div className="group relative">
          <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">Vein Color (wrist)</label>
          <div className="grid grid-cols-3 gap-3">
            {["cool", "warm", "neutral"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white cursor-pointer hover:bg-white/10 transition">
                <input
                  type="radio"
                  name="veinColor"
                  value={opt}
                  checked={veinColor === opt}
                  onChange={(e) => setVeinColor(e.target.value)}
                  className="accent-white"
                />
                <span className="capitalize">{opt === "cool" ? "Blue/Purple" : opt === "warm" ? "Green" : "Blue + Green"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sun Reaction */}
        <div className="group relative">
          <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">Sun Reaction</label>
          <div className="grid grid-cols-3 gap-3">
            {["cool", "warm", "neutral"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white cursor-pointer hover:bg-white/10 transition">
                <input
                  type="radio"
                  name="sunReaction"
                  value={opt}
                  checked={sunReaction === opt}
                  onChange={(e) => setSunReaction(e.target.value)}
                  className="accent-white"
                />
                <span className="capitalize">{opt === "cool" ? "Burns easily" : opt === "warm" ? "Tans easily" : "Burns then tans"}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full sm:w-auto bg-white text-black font-medium py-3.5 px-5 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Calculate Undertone & Season
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="w-full sm:w-auto bg-white/10 border border-white/20 text-white font-medium py-3.5 px-5 rounded-xl hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Skin Profile"}
          </button>
        </div>

        {/* Results */}
        {(undertone || season) && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-200 text-sm leading-relaxed">
                <span className="font-medium">Undertone:</span> {undertone || "—"} · <span className="font-medium">Season:</span> {season || "—"}
              </p>
            </div>
            {season && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-gray-400 text-xs uppercase mb-2">Preferred Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {seasonPalettes[season as keyof typeof seasonPalettes].preferred.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-gray-400 text-xs uppercase mb-2">Avoid Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {seasonPalettes[season as keyof typeof seasonPalettes].avoid.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
