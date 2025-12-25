import { motion } from 'framer-motion';
import { Bot, Layers, Zap, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ComparisonContext = () => {
    return (
        <section className="py-32 bg-zinc-950 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <span className="text-indigo-500 font-mono text-sm tracking-wider uppercase">The Middle Ground is Missing</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">Why everything feels broken</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Over-automated AI (Chaos) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="group relative p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-red-500/30 transition-colors"
                    >
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-red-500/50 group-hover:text-red-500">
                                <Bot className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-zinc-100">Too Extreme</h3>
                            <ul className="space-y-4 text-zinc-400">
                                <li className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                                    <span>Black-box agents doing random things</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                                    <span>"Trust the model" (Good luck debugging)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                                    <span>Zero transparency</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right: Static Builders (Stone Age) -- SWAPPED VISUALLY IN CODE ORDER FOR MOBILE, BUT GRID PLACEMENT CAN FIX OR JUST ORDER LOGICALLY */}
                    {/* Actually let's put Center last in DOM for stacking or first if we want it highlighted. 
              The prompt said Left: Chaos, Right: Stone Age, Center: Bronn. 
              Usually Center is the hero. Let's put Chaos Left, Stone Age Right, Bronn Center.
              Wait, 3 columns: [Chaos] [Bronn] [Stone Age]?
              User said: "Left... Right... Center...".
              Usually this implies a comparison.
              I'll do: [Chaos (Left)]  [Bronn (Center)]  [Stone Age (Right)] 
              But visual hierarchy often dictates Bronn is the "Middle Ground".
              Let's stick to that order: Chaos -> Bronn -> Stone Age.
          */}

                    {/* Middle: Bronn (Precision) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative p-8 rounded-2xl bg-zinc-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 md:-translate-y-8"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/50 text-indigo-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">The Power Layer</h3>
                            <ul className="space-y-4 text-zinc-300">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>You drive. AI amplifies.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>See & override every step</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>Power tools, not autopilot</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right: Static Builders (Stone Age) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="group relative p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-amber-500/30 transition-colors"
                    >
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 group-hover:border-amber-500/50 group-hover:text-amber-500">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-zinc-100">Too Dumb</h3>
                            <ul className="space-y-4 text-zinc-400">
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
                                    <span>Dead UIs & Static Builders</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
                                    <span>Webhook spaghetti logic</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-amber-500/70 shrink-0 mt-0.5" />
                                    <span>10 different tools for 1 task</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};
