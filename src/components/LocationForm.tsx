"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  initialCity?: string;
  initialCountry?: string;
  onSaveSuccess?: () => void;
  initialWeatherPreferences?: string;
};

export default function LocationForm({ userId, initialCity = "", initialCountry = "", initialWeatherPreferences = "", onSaveSuccess }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [country, setCountry] = useState(initialCountry);
  const [weatherPreferences, setWeatherPreferences] = useState(initialWeatherPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(false); setSaving(true);
    try {
      const payload = { user_id: userId, city, country, weather_preferences: weatherPreferences || null };
      const { error } = await supabase.from('user_location').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      setSuccess(true);
      onSaveSuccess?.();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm">Set your location for live weather</p>
      </div>
      {error && <div className="text-xs text-red-300">{error}</div>}
      {success && <div className="text-xs text-green-300">Saved!</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">Weather preferences (optional)</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none resize-none"
          rows={3}
          placeholder="e.g., prefer mild mornings, avoid heavy rain outfits"
          value={weatherPreferences}
          onChange={(e) => setWeatherPreferences(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full md:w-auto bg-white text-black font-medium py-3.5 px-5 rounded-xl hover:bg-gray-100 transition"
      >
        {saving ? 'Saving…' : 'Save Location'}
      </button>
    </form>
  );
}
