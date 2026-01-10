"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

export default function Navbar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const supabase = createClient();
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                    <Link href="/wardrobe" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Wardrobe</Link>
                    <Link href="/packing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Packing</Link>
                    <Link href="/occasions" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Occasions</Link>
                    <Link href="/onboarding" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Onboarding</Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                         <div className="relative">
                            <button 
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/5"
                            >
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium hidden sm:inline-block">{user.email?.split('@')[0]}</span>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <Link href="/profile" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                                        Your Profile
                                    </Link>
                                    <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                                        Settings
                                    </Link>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
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
