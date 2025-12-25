import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Layers,
    Zap,
    CreditCard,
    Users,
    Database,
    Puzzle,
    MousePointer2,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModuleCard = ({ icon: Icon, title, color, delay }: { icon: any, title: string, color: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.05, x: 5 }}
        className="flex items-center gap-3 p-3 bg-zinc-900 border border-white/5 rounded-lg cursor-grab hover:bg-zinc-800 hover:border-white/10 group mb-2"
    >
        <div className={`w-8 h-8 rounded flex items-center justify-center ${color} bg-opacity-20 text-white`}>
            <Icon size={16} />
        </div>
        <div className="flex actions">
            <div className="text-sm font-medium text-zinc-300 group-hover:text-white">{title}</div>
            <div className="text-[10px] text-zinc-500">v1.2.0</div>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
    </motion.div>
);

export const ModularHero = () => {
    const navigate = useNavigate();
    const [animationStep, setAnimationStep] = useState(0);

    // Coordinate system: 1600x900
    // Center: 800, 450
    // Auth Module Target: Left (-350px) -> Center - 350 = 450
    // Billing Module Target: Right (+350px) -> Center + 350 = 1150

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationStep(prev => (prev + 1) % 3);
        }, 5000); // Slower cycle to see drag
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4 md:px-8 flex flex-col items-center">

            {/* Header Text */}
            <div className="text-center max-w-3xl mx-auto mb-16 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 mb-6">
                        <Puzzle size={12} />
                        <span>Everything is a Module</span>
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-600">
                        Stop coding boilerplate.<br />Start composing.
                    </h1>
                    <p className="text-xl text-zinc-400 font-light mb-8 max-w-2xl mx-auto">
                        A modularity-first studio. Drag pre-built capabilities, <br className="hidden md:block" />
                        configure them visually, and ship in record time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="h-12 px-8 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            Start Composing
                        </button>
                        <button className="h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                            Explore Registry
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* The Modular Studio Interface */}
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, type: "spring" }}
                className="w-full max-w-6xl aspect-[16/9] bg-[#0E0E10] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex relative z-20 group"
            >
                {/* Left Sidebar: Module Registry */}
                <div className="w-72 border-r border-white/5 bg-[#0E0E10] flex flex-col z-20 relative">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="font-medium text-white flex items-center gap-2">
                            <Box size={16} className="text-indigo-400" />
                            Registry
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-white/5">Beta</div>
                    </div>
                    <div className="p-4 overflow-y-auto">
                        <div className="text-xs font-bold text-zinc-500 uppercase mb-3">Core Modules</div>
                        <ModuleCard icon={Users} title="Auth Service" color="bg-blue-500" delay={0.4} />
                        <ModuleCard icon={CreditCard} title="Stripe Billing" color="bg-green-500" delay={0.5} />
                        <ModuleCard icon={Database} title="Postgres DB" color="bg-orange-500" delay={0.6} />
                        <ModuleCard icon={Zap} title="AI Agent" color="bg-purple-500" delay={0.7} />
                    </div>
                </div>

                {/* Main Composition Canvas */}
                <div className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center">
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

                    {/* Connection Lines & Cursor Animation Container */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
                                </marker>
                                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="1" />
                                </linearGradient>
                            </defs>

                            {/* Line 1: Auth (Left) -> App Node */}
                            {animationStep >= 1 && (
                                <motion.path
                                    d="M 550 450 C 650 450, 650 450, 715 450"
                                    fill="none"
                                    stroke="url(#line-gradient)"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            )}

                            {/* Line 2: Billing (Right) -> App Node */}
                            {animationStep >= 2 && (
                                <motion.path
                                    d="M 1050 450 C 950 450, 950 450, 885 450"
                                    fill="none"
                                    stroke="url(#line-gradient)"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                />
                            )}
                        </svg>
                    </div>

                    {/* Central App Node */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-indigo-500/30 bg-[#0E0E10] flex flex-col items-center justify-center p-4 text-center z-10 shadow-[0_0_50px_rgba(79,70,229,0.1)]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                            <Layers size={28} />
                        </div>
                        <div className="font-bold text-base">My App</div>
                        <div className="text-[10px] text-indigo-300 mt-1">Ready</div>
                    </motion.div>

                    {/* Dropping Modules */}

                    {/* Module 1: Auth (Drops Left) */}
                    <motion.div
                        initial={{ x: -600, y: 0, opacity: 0, scale: 0.5 }}
                        animate={animationStep >= 1 ? { x: -350, y: 0, opacity: 1, scale: 1 } : { x: -600, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 p-3 bg-zinc-900 border border-blue-500/30 rounded-xl shadow-xl flex items-center gap-3 z-20"
                    >
                        <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Auth</div>
                            <div className="text-[10px] text-green-400">Connected</div>
                        </div>
                    </motion.div>

                    {/* Cursor Animation for Auth */}
                    {animationStep === 0 && (
                        <motion.div
                            initial={{ x: -600, y: 200, opacity: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                x: [-600, -350, -350],
                                y: [200, 0, 0]
                            }}
                            transition={{ duration: 1.5, delay: 0.5, times: [0, 0.2, 0.8, 1] }}
                            className="absolute left-1/2 top-1/2 z-50 pointer-events-none"
                        >
                            <MousePointer2 className="text-white fill-black drop-shadow-xl" size={24} />
                        </motion.div>
                    )}

                    {/* Module 2: Billing (Drops Right) */}
                    <motion.div
                        initial={{ x: 600, y: 0, opacity: 0, scale: 0.5 }}
                        animate={animationStep >= 2 ? { x: 350, y: 0, opacity: 1, scale: 1 } : { x: 600, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 p-3 bg-zinc-900 border border-green-500/30 rounded-xl shadow-xl flex items-center gap-3 z-20"
                    >
                        <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Billing</div>
                            <div className="text-[10px] text-green-400">Active</div>
                        </div>
                    </motion.div>

                </div>

                {/* Right Sidebar: Config */}
                <div className="w-80 border-l border-white/5 bg-[#0E0E10] flex flex-col z-20 relative">
                    <div className="p-4 border-b border-white/5 font-medium text-white">
                        Configuration
                    </div>
                    {animationStep >= 1 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Provider</label>
                                <div className="p-2 rounded bg-zinc-900 border border-white/10 text-sm flex items-center justify-between">
                                    Auth0
                                    <ArrowRight size={12} className="text-zinc-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Redirect URLs</label>
                                <div className="space-y-1">
                                    <div className="p-2 rounded bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400">/callback</div>
                                    <div className="p-2 rounded bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400">/login</div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Module Healthy
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="p-8 text-center text-zinc-600 text-sm flex flex-col items-center gap-4">
                            <Puzzle size={32} className="opacity-20" />
                            <span>Select a module to configure</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        </section>
    );
};
