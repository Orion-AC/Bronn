import { motion } from 'framer-motion';
import { LayoutTemplate, Cog, BrainCircuit, Workflow, PlugZap, Move3d, ShieldCheck, Rocket } from 'lucide-react';

const powers = [
    { icon: LayoutTemplate, title: "Layout Power", desc: "Pixel-perfect control with CSS Grid/Flex visually." },
    { icon: Cog, title: "Automation Power", desc: "Backend logic running alongside your frontend." },
    { icon: BrainCircuit, title: "Contextual AI Power", desc: "It knows your codebase, not just generic snippets." },
    { icon: Workflow, title: "Logic Power", desc: "Visual flow builders that compile to real code." },
    { icon: PlugZap, title: "Integration Power", desc: "Connect DBs, APIs, and Auth without glue code." },
    { icon: Move3d, title: "Motion Power", desc: "Framer Motion built-in. Cinematic by default." },
    { icon: ShieldCheck, title: "Control Power", desc: "Eject anytime. It's just React code." },
    { icon: Rocket, title: "Scale Power", desc: "Deploy to edge. Serverless native." },
];

export const PowerCards = () => {
    return (
        <section className="py-32 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 max-w-2xl text-white">
                        The 8 Powers.
                    </h2>
                    <p className="text-xl text-zinc-400">Everything you need. Nothing you don't.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {powers.map((power, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group p-6 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-900 transition-colors"
                        >
                            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center mb-4 text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                                <power.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{power.title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">{power.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
