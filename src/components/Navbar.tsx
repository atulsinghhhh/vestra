"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/supabase/imageUtils";

export default function Navbar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const supabase = createClient();
    const [scrolled, setScrolled] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    }, [user, supabase]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMobileMenuOpen(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (pathname === "/login" || pathname === "/signup") return null;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload(); 
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2 relative z-50">
                    <Link href="/" className="text-2xl font-bold text-white tracking-tight">Vestra</Link>
                </div>

                {/* Desktop Nav Links - Only for Authenticated Users */}
                {user && (
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/wardrobe" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Wardrobe</Link>
                        <Link href="/packing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Packing</Link>
                        <Link href="/occasions" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Occasions</Link>
                        <Link href="/onboarding" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Onboarding</Link>
                    </div>
                )}

                <div className="flex items-center gap-4 relative z-50">
                    {/* Public/Auth buttons (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden relative border border-white/10">
                                        <Image 
                                            src={avatarUrl || "/404.png"} 
                                            alt="User" 
                                            fill
                                            unoptimized
                                            className="object-cover w-8 h-8 rounded-full" 
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

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-20 bg-black/95 backdrop-blur-xl z-40 p-6 flex flex-col md:hidden animate-in slide-in-from-top-4 duration-300">
                     <div className="flex flex-col gap-6 text-center mt-8">
                        {user && (
                            <>
                                <Link href="/dashboard" className="text-xl font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">Dashboard</Link>
                                <Link href="/wardrobe" className="text-xl font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">Wardrobe</Link>
                                <Link href="/packing" className="text-xl font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">Packing</Link>
                                <Link href="/occasions" className="text-xl font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">Occasions</Link>
                                <Link href="/onboarding" className="text-xl font-medium text-gray-300 hover:text-white transition-colors py-2 border-b border-white/10">Onboarding</Link>
                            </>
                        )}
                        
                        {user ? (
                             <div className="flex flex-col gap-4 mt-4">
                                <Link href="/profile" className="flex items-center justify-center gap-3 text-xl font-medium text-white bg-white/10 py-3 rounded-xl border border-white/10">
                                     <div className="w-8 h-8 rounded-full bg-indigo-500 overflow-hidden relative">
                                        <Image src={avatarUrl || "/404.png"} fill unoptimized className="object-cover" alt="Profile" />
                                     </div>
                                     My Profile
                                </Link>
                                <button onClick={handleLogout} className="text-xl font-medium text-red-400 py-2">Logout</button>
                             </div>
                        ) : (
                             <div className="flex flex-col gap-4 mt-4">
                                <Link href="/login" className="w-full py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10">Sign In</Link>
                                <Link href="/signup" className="w-full py-3 rounded-xl bg-white text-black font-medium">Get Started</Link>
                             </div>
                        )}
                     </div>
                </div>
            )}
        </nav>
    );
}
