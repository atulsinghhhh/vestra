"use client";

import { createClient } from "@/lib/supabase/client";
import { BodyClassifyType, MeasurementUnitEnum } from "@/lib/bodyType";
import { generateOutfit } from "@/lib/huggingface/generateOutfit";
import { useState, useEffect } from "react";
import SkinToneQuiz from "@/components/SkinToneQuiz";

type MeasurementProps = {
    onSaveSuccess?: () => void;
    hideQuizButton?: boolean;
    showAsStep?: boolean;
};

function Measurement({ onSaveSuccess, hideQuizButton = false, showAsStep = false }: MeasurementProps = {}){
    const supabase = createClient();

    const [formData, setFormData] = useState({
        height: "",
        weight: "",
        waist: "",
        shoulder_width: "",
        hips: "",
        chest: "",
        inseam: "",
        measurement_unit: MeasurementUnitEnum.METRIC,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [outfitSuggestion, setOutfitSuggestion] = useState<string | null>(null);
    const [generatingOutfit, setGeneratingOutfit] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [quizOpen, setQuizOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const measurements = {
                height: parseFloat(formData.height),
                weight: parseFloat(formData.weight),
                waist: parseFloat(formData.waist),
                shoulder_width: parseFloat(formData.shoulder_width),
                hips: parseFloat(formData.hips),
                chest: parseFloat(formData.chest),
                inseam: parseFloat(formData.inseam),
                measurement_unit: formData.measurement_unit,
            };

            const bodyType = BodyClassifyType({
                shoulderWidth: measurements.shoulder_width,
                waist: measurements.waist,
                hips: measurements.hips,
            });

            const dataToInsert = {
                user_id: userId!,
                ...measurements,
                body_type: bodyType,
            };

            const { error: dbError } = await supabase.from('user_measurements').insert([dataToInsert]);

            if (dbError) {
                setError(dbError.message);
                return;
            }

            setSuccess(true);
            onSaveSuccess?.();

            setGeneratingOutfit(true);
            try {
                const outfit = await generateOutfit(userId!);
                if (outfit && outfit.generated_text) {
                    setOutfitSuggestion(outfit.generated_text);
                } else {
                    setError('Measurements saved but failed to generate outfit suggestion.');
                }
            } catch (outfitError) {
                console.error('Error generating outfit:', outfitError);
                setError('Measurements saved but failed to generate outfit suggestion.');
            } finally {
                setGeneratingOutfit(false);
            }
        } catch (error) {
            console.error('Error submitting measurements:', error);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNewOutfit = async () => {
        if (!userId) return;

        setGeneratingOutfit(true);
        setError(null);
        try {
            const outfit = await generateOutfit(userId);
            if (outfit && outfit.generated_text) {
                setOutfitSuggestion(outfit.generated_text);
            } else {
                setError('Failed to generate outfit suggestion.');
            }
        } catch (outfitError) {
            console.error('Error generating outfit:', outfitError);
            setError('Failed to generate outfit suggestion.');
        } finally {
            setGeneratingOutfit(false);
        }
    };

    const formSection = (
        <div className="relative">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" />
            <div className="relative z-20 p-8 flex flex-col gap-6">
                <div className="text-center space-y-2 mb-2">
                    <h1 className="text-3xl font-light tracking-widest text-white">MEASUREMENTS</h1>
                    <p className="text-sm text-gray-400 font-light tracking-wide uppercase">Enter your body measurements</p>
                </div>

                {!hideQuizButton && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setQuizOpen(true)}
                            className="bg-white/10 border border-white/20 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        >
                            Skin Tone & Palette
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs text-center">
                            {error}
                        </div>
                    )}

                    {success && !outfitSuggestion && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-xs text-center">
                            Measurements saved successfully!
                        </div>
                    )}

                    {/* Unit Selection */}
                    <div className="group relative">
                        <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">Measurement Unit</label>
                        <select
                            name="measurement_unit"
                            value={formData.measurement_unit}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 cursor-pointer"
                        >
                            <option value={MeasurementUnitEnum.METRIC} className="bg-slate-800 text-white">Metric (cm, kg)</option>
                            <option value={MeasurementUnitEnum.IMPERIAL} className="bg-slate-800 text-white">Imperial (in, lbs)</option>
                        </select>
                    </div>

                    {/* Measurements Grid */}
                    <div className="space-y-4">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Height {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    required
                                    step="0.1"
                                    value={formData.height}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Weight {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(kg)" : "(lbs)"}
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    required
                                    step="0.1"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Chest {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                                </label>
                                <input
                                    type="number"
                                    name="chest"
                                    required
                                    step="0.1"
                                    value={formData.chest}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Shoulder Width {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                                </label>
                                <input
                                    type="number"
                                    name="shoulder_width"
                                    required
                                    step="0.1"
                                    value={formData.shoulder_width}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Waist {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                                </label>
                                <input
                                    type="number"
                                    name="waist"
                                    required
                                    step="0.1"
                                    value={formData.waist}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            <div className="group relative">
                                <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                    Hips {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                                </label>
                                <input
                                    type="number"
                                    name="hips"
                                    required
                                    step="0.1"
                                    value={formData.hips}
                                    onChange={handleChange}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Inseam */}
                        <div className="group relative">
                            <label className="text-xs text-gray-400 uppercase tracking-wide font-medium block mb-2">
                                Inseam {formData.measurement_unit === MeasurementUnitEnum.METRIC ? "(cm)" : "(in)"}
                            </label>
                            <input
                                type="number"
                                name="inseam"
                                required
                                step="0.1"
                                value={formData.inseam}
                                onChange={handleChange}
                                placeholder="0.0"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving measurements...
                            </span>
                        ) : (
                            showAsStep ? "Continue to Skin Tone" : "Save & Generate Outfit"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );

    if (showAsStep) {
        return (
            <div className="relative w-full">{formSection}</div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center py-12 relative overflow-hidden text-gray-200 font-sans selection:bg-white/10">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[800px] h-[800px] rounded-full bg-white/1 blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[1200px] px-8 mx-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Measurement Form */}
                    {formSection}
                </div>
            </div>
        </div>
    );
}
export default Measurement;