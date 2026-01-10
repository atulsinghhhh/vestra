"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

import { getPublicImageUrl } from "@/lib/supabase/imageUtils";

export default function Navbar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const supabase = createClient();
    const [scrolled, setScrolled] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        
        const fetchAvatar = async () => {
            if (!user) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single();
            
            if (profile?.avatar_url) {
                const url = await getPublicImageUrl(profile.avatar_url, "profiles");
                setAvatarUrl(url);
            }
        };

        fetchAvatar();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [user]);

    if (pathname === "/login" || pathname === "/signup") return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload(); 
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-2xl font-bold text-white tracking-tight">Vestra</Link>
                </div>
                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/wardrobe" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Wardrobe</Link>
                    <Link href="/packing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Packing</Link>
                    <Link href="/occasions" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Occasions</Link>
                    <Link href="/onboarding" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Onboarding</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                         <div className="flex items-center gap-4">
                            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden relative border border-white/10">
                                    <img 
                                        src={avatarUrl || "/404.png"} 
                                        alt="User" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </Link>
                            
                            <button 
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                Logout
                            </button>
                         </div>
                    ) : (
                        <div className="flex items-center gap-4">
                             <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                               Sign In
                             </Link>
                             <Link href="/signup" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors">
                               Get Started
                             </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
