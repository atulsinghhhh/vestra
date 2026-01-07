import React from "react";
import { OutfitSuggestion } from "@/lib/outfit/ruleBasedSuggestions";

type Props = {
  suggestions: OutfitSuggestion[];
};

export default function OutfitSuggestionsGrid({ suggestions }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {suggestions.map((s) => (
        <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-white font-semibold">{s.label}</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-200">
            {s.items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-gray-400 capitalize w-20 shrink-0">{item.role}</span>
                <span className="text-white/90">{item.description}</span>
              </div>
            ))}
          </div>
          <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
            {s.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
