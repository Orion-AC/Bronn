import { motion } from 'framer-motion';
import { Layout, MousePointer2, Move, Type } from 'lucide-react';

export const VisualBuilderSection = () => {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Design visually.<br />
                        <span className="text-indigo-500">Ship React.</span>
                    </motion.h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        The speed of a site builder. The power of a component library.
                        Drag, drop, and export clean code.
                    </p>
                </div>

                {/* The Builder Interface Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative w-full aspect-[16/9] bg-[#0E0E10] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex"
                >
                    {/* Left Sidebar: Components */}
                    <div className="w-64 border-r border-white/5 bg-[#0E0E10] flex flex-col">
                        <div className="p-4 border-b border-white/5 font-medium text-white flex items-center gap-2">
                            <Layout size={16} className="text-indigo-400" />
                            Components
                        </div>
                        <div className="p-4 space-y-3">
                            {['Container', 'Text Block', 'Button', 'Image', 'Data Grid'].map((item) => (
                                <div key={item} className="flex items-center gap-3 p-3 bg-zinc-900 border border-white/5 rounded cursor-grab hover:border-indigo-500/50 hover:bg-zinc-800 transition-colors group">
                                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white">
                                        {item === 'Text Block' ? <Type size={14} /> : <Move size={14} />}
                                    </div>
                                    <span className="text-sm text-zinc-400 group-hover:text-white">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center Canvas */}
                    <div className="flex-1 bg-[#050505] relative p-8 flex items-center justify-center overflow-hidden">
                        {/* Dot Grid Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

                        {/* The "Page" being built */}
                        <div className="w-[80%] h-full bg-black border border-white/10 rounded-lg shadow-2xl relative">
                            {/* Header Block */}
                            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8">
                                <div className="w-24 h-4 bg-zinc-800 rounded" />
                                <div className="flex gap-4">
                                    <div className="w-16 h-3 bg-zinc-800 rounded" />
                                    <div className="w-16 h-3 bg-zinc-800 rounded" />
                                </div>
                            </div>

                            {/* Hero Block being edited */}
                            <div className="p-12 flex flex-col items-center justify-center text-center relative group border-2 border-transparent hover:border-indigo-500/50 transition-colors">
                                {/* Selection Handles (Visible on hover) */}
                                <div className="absolute top-0 left-0 w-2 h-2 bg-indigo-500 opacity-0 group-hover:opacity-100" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 opacity-0 group-hover:opacity-100" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-indigo-500 opacity-0 group-hover:opacity-100" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-indigo-500 opacity-0 group-hover:opacity-100" />

                                <div className="w-64 h-8 bg-zinc-800 rounded mb-4" />
                                <div className="w-96 h-4 bg-zinc-900 rounded mb-8" />
                                <div className="w-32 h-10 bg-indigo-600 rounded" />
                            </div>

                            {/* Dragged Element Simulation */}
                            <motion.div
                                initial={{ x: -200, y: 100, opacity: 0 }}
                                whileInView={{ x: 100, y: 50, opacity: 1 }}
                                transition={{ duration: 2, delay: 1 }}
                                className="absolute top-1/2 left-1/4 w-48 h-32 bg-zinc-900 border-2 border-indigo-500 rounded-lg shadow-xl flex items-center justify-center z-20 pointer-events-none"
                            >
                                <span className="text-xs text-indigo-400 font-mono">New Section</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Sidebar: Properties */}
                    <div className="w-64 border-l border-white/5 bg-[#0E0E10] hidden lg:flex flex-col">
                        <div className="p-4 border-b border-white/5 font-medium text-white text-sm">
                            Properties
                        </div>
                        <div className="p-4 space-y-6">
                            <div>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase">Layout</div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-8 bg-zinc-900 rounded border border-white/5" />
                                    <div className="h-8 bg-zinc-900 rounded border border-white/5" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase">Spacing</div>
                                <div className="h-24 bg-zinc-900 rounded border border-white/5 flex items-center justify-center">
                                    <div className="w-12 h-12 border border-zinc-700 rounded" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase">Typography</div>
                                <div className="space-y-2">
                                    <div className="h-8 bg-zinc-900 rounded border border-white/5" />
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mouse Cursor Overlay */}
                    <motion.div
                        initial={{ x: 100, y: 400 }}
                        whileInView={{ x: 400, y: 300 }}
                        transition={{ duration: 2, delay: 1 }}
                        className="absolute top-0 left-0 pointer-events-none z-30 ml-4"
                    >
                        <MousePointer2 className="text-white fill-black" size={24} />
                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
};
