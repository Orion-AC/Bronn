import { motion } from 'framer-motion';
import { MousePointer2, Settings2, Sparkles, ArrowRightLeft } from 'lucide-react';

export const FeatureScenes = () => {
    return (
        <section className="bg-black py-24">
            <div className="max-w-7xl mx-auto px-6 space-y-32">

                {/* Scene 1: Design without friction */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                            <MousePointer2 className="w-5 h-5" />
                            <span className="text-sm font-mono uppercase tracking-wider">Design</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Design without friction</h2>
                        <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                            Drag. Resize. Modify JSX visually.<br />
                            Zero reloads. No builder lock-in.
                        </p>
                        <p className="text-white font-medium border-l-2 border-indigo-500 pl-4">
                            "Design like a designer. Think like a developer."
                        </p>
                    </motion.div>

                    <div className="relative aspect-video bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden group">
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                        {/* Animated Cursor and Element */}
                        <motion.div
                            animate={{
                                x: [20, 150, 150, 20],
                                width: [100, 100, 200, 100]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/4 -translate-y-1/2 h-32 bg-indigo-500/20 border border-indigo-500 rounded-lg flex items-center justify-center"
                        >
                            <div className="w-2 h-2 absolute -bottom-1 -right-1 bg-white border border-indigo-500" />
                        </motion.div>
                        <motion.div
                            animate={{ x: [30, 160, 160, 30], y: [140, 140, 160, 140] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute z-10"
                        >
                            <MousePointer2 className="w-6 h-6 text-white drop-shadow-lg fill-black" />
                        </motion.div>
                    </div>
                </div>

                {/* Scene 2: Automation */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative aspect-video bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                        {/* Base App Interface */}
                        <div className="absolute inset-0 flex">
                            <div className="w-1/4 border-r border-zinc-800 bg-zinc-900/50" />
                            <div className="flex-1 bg-zinc-950" />
                        </div>
                        {/* Slide-in Automation Panel */}
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-zinc-900 border-l border-zinc-800 p-4 transform translate-x-0 transition-transform">
                            <div className="flex items-center gap-2 mb-4 text-indigo-400">
                                <ArrowRightLeft className="w-4 h-4" />
                                <span className="text-xs font-bold">FLOW</span>
                            </div>
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-2 bg-zinc-800 rounded border border-zinc-700 text-xs text-zinc-300"
                                >
                                    On Form Submit
                                </motion.div>
                                <div className="h-4 border-l-2 border-zinc-700 ml-4 border-dashed" />
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-2 bg-indigo-500/20 rounded border border-indigo-500/30 text-xs text-indigo-200"
                                >
                                    Send to Slack
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        className="order-1 md:order-2"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                            <Settings2 className="w-5 h-5" />
                            <span className="text-sm font-mono uppercase tracking-wider">Automation</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Lives with the product</h2>
                        <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                            Automation panel slides from the side.<br />
                            Same app. Same context. No Zapier tab-hopping.
                        </p>
                        <p className="text-white font-medium border-l-2 border-indigo-500 pl-4">
                            "If your site can think, it shouldn't live elsewhere."
                        </p>
                    </motion.div>
                </div>

                {/* Scene 3: AI */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-mono uppercase tracking-wider">Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">AI that knows its place</h2>
                        <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                            AI suggests. You approve. You edit. You disable.<br />
                            It's not magic. It's leverage.
                        </p>
                        <p className="text-white font-medium border-l-2 border-indigo-500 pl-4">
                            "AI assists. You decide."
                        </p>
                    </motion.div>

                    <div className="relative aspect-video bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center">
                        {/* Code Block Metaphor */}
                        <div className="w-2/3 bg-black rounded p-4 border border-zinc-800 font-mono text-sm">
                            <div className="text-purple-400">function calculateGrowth() {'{'}</div>
                            <motion.div
                                initial={{ opacity: 0.3 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                                className="pl-4 text-zinc-500"
                            >
                                <span className="text-indigo-400">// AI Suggestion: Memoize this</span>
                                <br />
                                return useMemo(() =&gt; data.reduce..., [data]);
                            </motion.div>
                            <div className="text-purple-400">{'}'}</div>

                            {/* Approve/Reject UI */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-8 right-8 flex gap-2"
                            >
                                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded cursor-pointer border border-green-500/30">Approve</div>
                                <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded cursor-pointer border border-red-500/30">Reject</div>
                            </motion.div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
