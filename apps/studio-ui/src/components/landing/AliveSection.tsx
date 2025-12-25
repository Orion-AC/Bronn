import { motion } from 'framer-motion';

export const AliveSection = () => {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
                        Engineered for <span className="text-indigo-500">Flow</span>.
                    </h2>
                    <p className="text-2xl text-zinc-400 font-light leading-relaxed mb-16">
                        Local-first interactions. Zero latency. <br />
                        It feels like a native app, because it should.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 text-left">
                    {[
                        { title: "Instant", desc: "State updates in <16ms. Animation frame perfect.", delay: 0 },
                        { title: "Type-Safe", desc: "End-to-end typescript inference from DB to UI.", delay: 0.2 },
                        { title: "Local", desc: "Works offline. Syncs when you're back.", delay: 0.4 },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: item.delay }}
                            className="p-6 border border-white/5 bg-zinc-900/50 rounded-xl"
                        >
                            <div className="text-indigo-400 font-mono text-xs mb-4">0{i + 1}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-zinc-500">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
