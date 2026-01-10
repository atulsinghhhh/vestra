"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const { scrollY } = useScroll();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Parallax & Scroll Effects
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX - window.innerWidth / 2) / 50,
                y: (e.clientY - window.innerHeight / 2) / 50,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-purple-500/30">
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-50" />
                <motion.div 
                    className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px]"
                    animate={{ x: mousePosition.x * 2, y: mousePosition.y * 2 }}
                />
                <motion.div 
                    className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"
                    animate={{ x: mousePosition.x * -2, y: mousePosition.y * -2 }}
                />
                <motion.div 
                    style={{ y: y1, opacity: opacityHero }}
                    className="relative z-10 text-center px-6 max-w-5xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
                            <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
                                Your style.
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 animate-pulse">
                                Digitized.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        The AI-powered wardrobe manager that curates your outfits based on weather, occasion, and your unique taste.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/signup" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-transform hover:scale-105">
                            <span className="relative z-10">Get Started Free</span>
                            <div className="absolute inset-0 bg-linear-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                        </Link>
                        <Link href="#features" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
                            Explore Features
                        </Link>
                    </motion.div>
                </motion.div>
                <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none">
                     <motion.div 
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="absolute top-[20%] right-[10%] w-64 h-80 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl -rotate-12 hidden lg:block"
                     />
                     <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="absolute bottom-[20%] left-[10%] w-56 h-64 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl rotate-12 hidden lg:block"
                     />
                </motion.div>
            </section>

            {/* FEATURES - Minimal Cards */}
            <section id="features" className="py-20 px-6 bg-black relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Build your wardrobe",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                )
                            },
                            {
                                title: "Weather & Occasions",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                                )
                            },
                            {
                                title: "Generate Outfits",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                )
                            },
                            {
                                title: "Plan Trips & Packing",
                                icon: (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )
                            }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors cursor-default"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-medium text-gray-200">{item.title}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-b from-black to-indigo-950/20" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10 max-w-3xl mx-auto"
                >
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready to <span className="text-indigo-400 italic">curate?</span></h2>
                    <Link href="/signup" className="inline-block px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl shadow-white/20">
                        Join Vestra Now
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
