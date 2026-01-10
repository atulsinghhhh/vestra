"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Measurement from "@/components/Measurement";
import SkinToneQuiz from "@/components/SkinToneQuiz";
import LocationForm from "@/components/LocationForm";

export default function OnboardingPage() {
    const supabase = createClient();
    const router = useRouter();

    const [userId, setUserId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Track completion status
    const [measurementsSaved, setMeasurementsSaved] = useState(false);
    const [skinToneSaved, setSkinToneSaved] = useState(false);
    const [locationSaved, setLocationSaved] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                checkExistingData(user.id);
            } else {
                router.push("/login");
            }
        };
        fetchUser();
    }, []);

    const checkExistingData = async (uid: string) => {
        try {
        // Check measurements
            const { data: measurements } = await supabase
                .from("user_measurements")
                .select("id")
                .eq("user_id", uid)
                .maybeSingle();

            // Check skin profile
            const { data: skinProfile } = await supabase
                .from("user_skin_profile")
                .select("user_id")
                .eq("user_id", uid)
                .maybeSingle();

            // Check location
            const { data: location } = await supabase
                .from("user_location")
                .select("user_id")
                .eq("user_id", uid)
                .maybeSingle();

            if (measurements) setMeasurementsSaved(true);
            if (skinProfile) setSkinToneSaved(true);
            if (location) setLocationSaved(true);

            // If all data exists, redirect to outfit page
            if (measurements && skinProfile && location) {
                router.push("/outfit");
            }
        } catch (err) {
            console.error("Error checking existing data:", err);
        }
    };

    const handleMeasurementsSaved = () => {
        setMeasurementsSaved(true);
        setCurrentStep(2);
    };

    const handleSkinToneSaved = () => {
        setSkinToneSaved(true);
        setCurrentStep(3);
    };

    const handleLocationSaved = () => {
        setLocationSaved(true);
        // All steps complete, redirect to outfit page
        router.push("/outfit");
    };

    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                Step {currentStep} of 3
                </span>
                <span className="text-xs text-gray-400">
                {Math.round((currentStep / 3) * 100)}% Complete
                </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                className="h-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center pt-24 pb-12 relative overflow-hidden text-gray-200 font-sans selection:bg-white/10">
        {/* Background effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[800px] h-[800px] rounded-full bg-white/1 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[800px] px-8 mx-4">
            {renderProgressBar()}

            {/* Step 1: Measurements */}
            {currentStep === 1 && (
            <Measurement 
                onSaveSuccess={handleMeasurementsSaved} 
                hideQuizButton={true}
                showAsStep={true}
            />
            )}

            {/* Step 2: Skin Tone Quiz */}
            {currentStep === 2 && (
            <div className="space-y-4">
                <SkinToneQuiz userId={userId} onSaveSuccess={handleSkinToneSaved} />
                <button
                onClick={handleSkinToneSaved}
                className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                Continue to Location
                </button>
            </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && userId && (
            <div className="relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" />
                <div className="relative z-20 p-8 flex flex-col gap-6">
                <div className="text-center space-y-2 mb-2">
                    <h1 className="text-3xl font-light tracking-widest text-white">LOCATION</h1>
                    <p className="text-sm text-gray-400 font-light tracking-wide uppercase">
                    Set your location for weather-based recommendations
                    </p>
                </div>

                <LocationForm userId={userId} onSaveSuccess={handleLocationSaved} />

                <button
                    onClick={handleLocationSaved}
                    className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    View My Outfits
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}
