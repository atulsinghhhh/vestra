"use client";
import React from "react";
import type { WeatherInput } from "@/lib/weather/types";
import type { WeatherAwareOutfit } from "@/lib/weather/types";

type Props = {
  locationLabel: string;
  weather: WeatherInput;
  categories: string[];
  suggestion: WeatherAwareOutfit;
};

export default function WeatherOutfitSuggestion({ locationLabel, weather, categories, suggestion }: Props) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-light tracking-wider text-white">Weather-aware Outfit</h2>
              <p className="text-gray-400 text-sm">{locationLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {categories.map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white capitalize">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase mb-2">Conditions</p>
              <div className="text-sm text-white space-y-1">
                <div>Temp: <span className="text-gray-200">{weather.temperature.toFixed(1)}°C</span></div>
                <div>Humidity: <span className="text-gray-200">{weather.humidity}%</span></div>
                <div>Wind: <span className="text-gray-200">{weather.wind_speed} km/h</span></div>
                <div>Condition: <span className="text-gray-200">{weather.condition}</span></div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase mb-2">Fit</p>
              <div className="text-white text-sm">{suggestion.fit}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase mb-2">Fabrics</p>
              <div className="flex flex-wrap gap-2">
                {suggestion.fabrics.map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white capitalize">
                    {f}
                  </span>
                ))}
                {suggestion.fabrics.length === 0 && (
                  <span className="text-gray-300 text-sm">Use your usual options</span>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase mb-2">Layering</p>
              <ul className="list-disc list-inside text-sm text-white space-y-1">
                {suggestion.layering.map((l) => (
                  <li key={l}>{l}</li>
                ))}
                {suggestion.layering.length === 0 && (
                  <li className="text-gray-300">No additional layers needed</li>
                )}
              </ul>
            </div>

            <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs uppercase">Color Guidance</p>
                <span className="text-[10px] uppercase tracking-wide text-white/70">{suggestion.colorGuidance.intensity}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestion.colorGuidance.palette.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white">
                    {c}
                  </span>
                ))}
              </div>
              <ul className="mt-3 text-xs text-gray-300 list-disc list-inside space-y-1">
                {suggestion.colorGuidance.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
