"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null; 
  avatar_url: string | null;
}

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
    });

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }
                setUser(user);

                const { data: profileData, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error(error);
                    return;
                }

                setProfile(profileData);
                setFormData({
                    username: profileData.username || "",
                    full_name: profileData.full_name || "",
                });

                if (profileData.avatar_url) {
                    const { data } = await supabase.storage
                    .from("profiles")
                    .createSignedUrl(profileData.avatar_url, 3600);

                    setAvatarUrl(data?.signedUrl || null);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);



    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setSaving(true);
        setMessage(null);

        try {
            const updates = {
                id: user.id,
                email: user.email,
                username: formData.username,
                full_name: formData.full_name,
            };

            const { error } = await supabase.from("profiles").upsert(updates);
            

            if (error) throw error;
        
            setProfile((prev: any) => ({ ...prev, ...updates }));
            setEditing(false);
            setMessage({ type: 'success', text: "Profile updated successfully!" });

            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: error.message || "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !user) return;

        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        setSaving(true);

        try {
            await supabase.storage
            .from("profiles")
            .upload(filePath, file, { upsert: true });

            await supabase
            .from("profiles")
            .update({ avatar_url: filePath })
            .eq("id", user.id);

            const { data } = await supabase.storage
            .from("profiles")
            .createSignedUrl(filePath, 3600);

            setAvatarUrl(data?.signedUrl || null);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };


    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
            Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] text-gray-200 font-sans selection:bg-white/10 p-6 md:p-12">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                    <h1 className="text-3xl font-light tracking-wide text-white">Profile</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your personal information</p>
                    </div>
                    {!editing && (
                        <button 
                            onClick={() => setEditing(true)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2 rounded-xl transition-all text-sm font-medium"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="relative group">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 shadow-2xl mx-auto md:mx-0">
                                {avatarUrl ? (
                                    <Image 
                                        src={avatarUrl} 
                                        alt="Avatar" 
                                        fill 
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => console.error("Error loading avatar image:", e)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600 font-light select-none">
                                        {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                
                                <div 
                                    onClick={triggerFileInput}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                >
                                    <span className="text-xs text-white font-medium">Change Photo</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        <div className="text-center md:text-left space-y-1">
                            <h2 className="text-xl text-white font-medium">{formData.full_name || "User"}</h2>
                            <p className="text-sm text-gray-500">@{formData.username || "username"}</p>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
                            
                            {message && (
                                <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-200 border border-green-500/20' : 'bg-red-500/10 text-red-200 border border-red-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-6">
                            
                            <div className="space-y-2 opacity-60">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Email</label>
                                <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-300">
                                    {user?.email} 
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Full Name</label>
                                {editing ? (
                                    <input 
                                        type="text" 
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="w-full px-4 py-3 text-sm text-white border border-transparent">
                                        {formData.full_name || <span className="text-gray-600 italic">Not set</span>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Username</label>
                                {editing ? (
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all"
                                    />
                                ) : (
                                    <div className="w-full px-4 py-3 text-sm text-white border border-transparent">
                                        {formData.username || <span className="text-gray-600 italic">Not set</span>}
                                    </div>
                                )}
                            </div>


                            {editing && (
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            if (profile) {
                                                setFormData({
                                                        username: profile.username || "",
                                                        full_name: profile.full_name || "",
                                                    });
                                            }
                                        }}
                                        className="flex-1 bg-transparent border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
