"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  WARDROBE_CATEGORY_ENUM,
  PATTERN_ENUM,
  FORMALITY_ENUM,
  SEASON_OPTIONS,
  type WardrobeItem,
  type SeasonOption,
} from "@/lib/wardrobe/types";

type Props = {
  userId: string;
  onSaveSuccess?: (item: WardrobeItem) => void;
};

export default function WardrobeItemForm({ userId, onSaveSuccess }: Props) {
    const supabase = createClient();

    const [formData, setFormData] = useState<Partial<WardrobeItem>>({
        item_name: "",
        category: "tops",
        sub_category: "",
        color_primary: "",
        color_secondary: "",
        pattern: "solid",
        fabric: "",
        season: [],
        formality: "casual",
        brand: "",
        image_url: "",
        purchase_date: "",
        tags: [],
    });

    const [tagInput, setTagInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

  const handleSeasonToggle = (season: string) => {
    setFormData((prev) => {
      const currentSeasons = prev.season || [];
      const updated = currentSeasons.includes(season as SeasonOption)
        ? currentSeasons.filter((s) => s !== season)
        : [...currentSeasons, season as SeasonOption];
      return { ...prev, season: updated };
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setUploading(true);
      setError(null);

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("wardrobes")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("wardrobes")
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        image_url: publicData.publicUrl,
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.item_name || !formData.category || !formData.color_primary) {
        setError("Please fill in all required fields");
        return;
      }

      const payload = {
        user_id: userId,
        item_name: formData.item_name,
        category: formData.category,
        sub_category: formData.sub_category || null,
        color_primary: formData.color_primary,
        color_secondary: formData.color_secondary || null,
        pattern: formData.pattern || null,
        fabric: formData.fabric || null,
        season: formData.season && formData.season.length > 0 ? formData.season : null,
        formality: formData.formality || null,
        brand: formData.brand || null,
        image_url: formData.image_url || null,
        purchase_date: formData.purchase_date || null,
        tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
      };

      const { data, error: insertError } = await supabase
        .from("wardrobe_items")
        .insert([payload])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      onSaveSuccess?.(data as WardrobeItem);

      // Reset form
      setFormData({
        item_name: "",
        category: "tops",
        sub_category: "",
        color_primary: "",
        color_secondary: "",
        pattern: "solid",
        fabric: "",
        season: [],
        formality: "casual",
        brand: "",
        image_url: "",
        purchase_date: "",
        tags: [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save wardrobe item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" />
      <div className="relative z-20 p-8">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-light tracking-widest text-white">
            ADD WARDROBE ITEM
          </h2>
          <p className="text-sm text-gray-400 font-light tracking-wide uppercase">
            Upload and organize your clothing collection
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs text-center mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-xs text-center mb-4">
            Item added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="group relative">
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
              Item Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:cursor-pointer"
            />
            {uploading && (
              <p className="text-xs text-gray-400 mt-1">Uploading...</p>
            )}
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-white/10"
                />
              </div>
            )}
          </div>

          {/* Item Name */}
          <div className="group relative">
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="item_name"
              required
              value={formData.item_name}
              onChange={handleChange}
              placeholder="e.g., Navy Blue Blazer"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Category and Sub-category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer capitalize"
              >
                {WARDROBE_CATEGORY_ENUM.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-800 capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Sub-category
              </label>
              <input
                type="text"
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
                placeholder="e.g., T-shirt, Jeans"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Primary Color *
              </label>
              <input
                type="text"
                name="color_primary"
                required
                value={formData.color_primary}
                onChange={handleChange}
                placeholder="e.g., Navy Blue"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Secondary Color
              </label>
              <input
                type="text"
                name="color_secondary"
                value={formData.color_secondary}
                onChange={handleChange}
                placeholder="e.g., White"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Pattern and Fabric */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Pattern
              </label>
              <select
                name="pattern"
                value={formData.pattern}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer capitalize"
              >
                {PATTERN_ENUM.map((pattern) => (
                  <option key={pattern} value={pattern} className="bg-slate-800 capitalize">
                    {pattern}
                  </option>
                ))}
              </select>
            </div>

            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Fabric
              </label>
              <input
                type="text"
                name="fabric"
                value={formData.fabric}
                onChange={handleChange}
                placeholder="e.g., Cotton, Wool"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Season Selection */}
          <div className="group relative">
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
              Suitable Seasons
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEASON_OPTIONS.map((season) => (
                <label
                  key={season}
                  className={`flex items-center justify-center gap-2 border rounded-xl px-4 py-3 text-sm cursor-pointer transition-all ${
                    formData.season?.includes(season as SeasonOption)
                      ? "bg-white/20 border-white/40 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.season?.includes(season as SeasonOption)}
                    onChange={() => handleSeasonToggle(season)}
                    className="sr-only"
                  />
                  <span className="capitalize">{season}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Formality and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Formality
              </label>
              <select
                name="formality"
                value={formData.formality}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all cursor-pointer capitalize"
              >
                {FORMALITY_ENUM.map((formal) => (
                  <option key={formal} value={formal} className="bg-slate-800 capitalize">
                    {formal}
                  </option>
                ))}
              </select>
            </div>

            <div className="group relative">
              <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Nike, Zara"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Purchase Date */}
          <div className="group relative">
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Tags */}
          <div className="group relative">
            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (press Enter)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-white/10 border border-white/20 text-white px-4 rounded-xl hover:bg-white/15 transition"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add to Wardrobe"}
          </button>
        </form>
      </div>
    </div>
  );
}
