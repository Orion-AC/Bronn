import { motion } from 'framer-motion';
import { ArrowRight, Zap, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-indigo-500/30">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)] pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                >
                    <span className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-widest text-indigo-400 uppercase border border-indigo-500/20 rounded-full bg-indigo-500/5">
                        The Power Layer
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        More power to you.
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mt-6">
                        Build stunning products. Automate everything.<br className="hidden md:block" />
                        Use AI only where it matters.
                    </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-4 bg-white text-black text-lg font-medium rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start building powerfully
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-indigo-50 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-500">
                        <span>Not no-code.</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                        <span>Not AI-only.</span>
                    </div>
                </motion.div>

                {/* Visual Metaphor - The "Live Canvas" */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="relative w-full aspect-[16/9] max-w-4xl mx-auto bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm shadow-2xl overflow-hidden group"
                >
                    {/* UI Chrome */}
                    <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="ml-4 h-1.5 w-24 rounded-full bg-white/10" />
                    </div>

                    {/* Animated Interface Elements */}
                    <div className="absolute inset-0 pt-10 flex">
                        {/* Sidebar Motion */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="w-48 border-r border-white/5 bg-white/2 p-4 flex flex-col gap-3"
                        >
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 rounded bg-white/5 w-full" />
                            ))}
                        </motion.div>

                        {/* Canvas Area */}
                        <div className="flex-1 p-8 relative">
                            {/* Draggable Card Metaphor */}
                            <motion.div
                                drag
                                dragConstraints={{ left: 0, right: 200, top: 0, bottom: 100 }}
                                whileHover={{ scale: 1.02, cursor: "grab" }}
                                whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                                initial={{ x: 50, y: 50 }}
                                animate={{ x: 0, y: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="absolute shadow-2xl p-6 bg-zinc-900 rounded-xl border border-white/10 w-64 backdrop-blur-md"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Trigger</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-1/2 bg-white/10 rounded" />
                                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                                </div>
                            </motion.div>

                            {/* Connecting Lines (SVG) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                <motion.path
                                    d="M150 100 C 250 100, 250 200, 350 200"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Code/AI Suggestion Popover */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                transition={{ delay: 1.5 }}
                                className="absolute top-20 right-20 p-4 bg-zinc-800/90 rounded-lg border border-indigo-500/30 shadow-xl max-w-xs"
                            >
                                <div className="flex gap-2 items-start">
                                    <Cpu className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-xs text-indigo-100 font-mono mb-1">AI Suggestion</p>
                                        <p className="text-xs text-zinc-400">Optimized database query detected. Auto-indexing applied for 10x performance.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </motion.div>
            </div>
        </section>
    );
};
