import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Terminal,
    Play,
    GitBranch,
    Search,
    Menu,
    MoreVertical,
    Cpu,
    Database,
    Globe,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CodeLine = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="font-mono text-sm leading-relaxed whitespace-pre"
    >
        {children}
    </motion.div>
);

export const IdeHero = () => {
    const navigate = useNavigate();
    const [typingDone, setTypingDone] = useState(false);

    // Simulate typing completion to trigger next animations
    useEffect(() => {
        const timer = setTimeout(() => setTypingDone(true), 2500);
        return () => clearTimeout(timer);
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
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-6">
                        <Terminal size={12} className="text-indigo-400" />
                        <span>v2.0 Public Beta</span>
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-600">
                        Build at the<br />speed of thought.
                    </h1>
                    <p className="text-xl text-zinc-400 font-light mb-8 max-w-2xl mx-auto">
                        The first IDE where code and AI workflows live together. <br className="hidden md:block" />
                        Write logic. Drag clarity. Deploy power.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="h-12 px-8 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            Start Building
                        </button>
                        <button className="h-12 px-8 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                            Read Manifesto
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* The IDE Interface */}
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 1, type: "spring" }}
                className="w-full max-w-6xl aspect-[16/10] bg-[#0E0E10] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative z-20"
            >
                {/* Window Controls & Toolbar */}
                <div className="h-10 bg-[#0E0E10] border-b border-white/5 flex items-center justify-between px-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="flex gap-1 text-xs text-zinc-500 font-medium bg-black/50 px-3 py-1 rounded border border-white/5">
                        <Search size={12} className="mr-2" />
                        bronn-studio — agent-flow.ts
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-green-500 text-xs px-2 py-1 rounded bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors">
                            <Play size={10} fill="currentColor" />
                            <span>Run</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs cursor-pointer hover:text-white transition-colors">
                            <GitBranch size={12} />
                            <span>main</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Activity Bar */}
                    <div className="w-12 border-r border-white/5 flex flex-col items-center py-4 gap-4 text-zinc-500">
                        <Menu size={20} className="text-white" />
                        <Search size={20} className="hover:text-white transition-colors" />
                        <GitBranch size={20} className="hover:text-white transition-colors" />
                        <Database size={20} className="hover:text-white transition-colors" />
                        <div className="flex-1" />
                        <Cpu size={20} className="text-indigo-400 animate-pulse" />
                    </div>

                    {/* Sidebar / Explorer */}
                    <div className="w-60 border-r border-white/5 bg-[#0E0E10]/50 hidden md:flex flex-col">
                        <div className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider flex justify-between">
                            <span>Explorer</span>
                            <MoreVertical size={12} />
                        </div>
                        <div className="px-2 space-y-1">
                            {['src', 'components', 'agents', 'flows'].map(folder => (
                                <div key={folder} className="flex items-center gap-2 px-2 py-1.5 text-zinc-400 hover:bg-white/5 rounded cursor-pointer text-sm">
                                    <div className="w-0 border-l-[4px] border-transparent border-t-[4px] border-t-zinc-500 border-b-[4px]" />
                                    {folder}
                                </div>
                            ))}
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-indigo-500/10 text-indigo-300 rounded cursor-pointer text-sm border-l-2 border-indigo-500">
                                <span className="text-indigo-500">TS</span>
                                agent-flow.ts
                            </div>
                        </div>
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col md:flex-row bg-[#0B0B0C]">
                        {/* Code Editor */}
                        <div className="flex-1 p-6 font-mono text-sm overflow-hidden relative">
                            {/* Line Numbers */}
                            <div className="absolute left-0 top-6 bottom-0 w-12 text-right pr-4 text-zinc-700 select-none">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="leading-relaxed">{i + 1}</div>
                                ))}
                            </div>

                            <div className="ml-8 z-10 relative">
                                <CodeLine delay={0}>
                                    <span className="text-purple-400">import</span> <span className="text-white">{'{'} Agent, Task {'}'}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'@bronn/sdk'</span>;
                                </CodeLine>
                                <CodeLine delay={0.1}> </CodeLine>
                                <CodeLine delay={0.2}>
                                    <span className="text-purple-400">export const</span> <span className="text-blue-400">financialAnalyst</span> = <span className="text-purple-400">new</span> <span className="text-yellow-300">Agent</span>({'{'}
                                </CodeLine>
                                <CodeLine delay={0.3}>
                                    {'  '}role: <span className="text-green-400">'Analyst'</span>,
                                </CodeLine>
                                <CodeLine delay={0.4}>
                                    {'  '}model: <span className="text-green-400">'gpt-4-turbo'</span>,
                                </CodeLine>
                                <CodeLine delay={0.5}>
                                    {'  '}tools: [<span className="text-blue-300">Calculator</span>, <span className="text-blue-300">WebSearch</span>]
                                </CodeLine>
                                <CodeLine delay={0.6}>
                                    {'}'});
                                </CodeLine>
                                <CodeLine delay={0.7}> </CodeLine>
                                <CodeLine delay={0.8}>
                                    <span className="text-zinc-500">// Define the workflow trigger</span>
                                </CodeLine>
                                <CodeLine delay={0.9}>
                                    <span className="text-purple-400">export const</span> <span className="text-blue-400">onMarketClose</span> = <span className="text-purple-400">async</span> (event) ={'>'} {'{'}
                                </CodeLine>
                                <CodeLine delay={1.4}>
                                    {'  '}<span className="text-purple-400">const</span> <span className="text-red-300">report</span> = <span className="text-purple-400">await</span> <span className="text-blue-400">financialAnalyst</span>.<span className="text-yellow-300">run</span>({'{'}
                                </CodeLine>
                                <CodeLine delay={1.8}>
                                    {'    '}task: <span className="text-green-400">`Analyze AAPL ticker for {'${event.date}'}`</span>
                                </CodeLine>
                                <CodeLine delay={2.2}>
                                    {'  '}{'}'});
                                </CodeLine>
                                <CodeLine delay={2.3}> </CodeLine>
                                <CodeLine delay={2.4}>
                                    {'  '}<span className="text-purple-400">return</span> <span className="text-red-300">report</span>;
                                </CodeLine>
                                <CodeLine delay={2.5}>
                                    {'}'}
                                </CodeLine>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="w-2 h-5 bg-indigo-500 inline-block align-middle ml-1"
                                />
                            </div>
                        </div>

                        {/* Visual Preview / Flow Pane (Simulated) */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: typingDone ? '40%' : 0, opacity: typingDone ? 1 : 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="bg-[#111] border-l border-white/5 relative overflow-hidden hidden md:block group"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-20" />

                            {/* Editor Chrome overlay */}
                            <div className="absolute top-2 left-2 flex gap-2">
                                <div className="px-2 py-1 bg-indigo-500 rounded text-[10px] font-bold text-white shadow-lg">
                                    Visual Mode
                                </div>
                                <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400 border border-white/5">
                                    1240px
                                </div>
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8">
                                {/* Visual Element Selection State */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 2.6 }}
                                    className="relative w-full"
                                >
                                    {/* Selection Box Simulation */}
                                    <div className="absolute -inset-2 border-2 border-indigo-500 rounded-lg opacity-0 animate-[pulse_3s_ease-in-out_infinite] [animation-delay:3s]">
                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500 border border-white" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 border border-white" />
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500 border border-white" />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500 border border-white" />
                                        <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-t">
                                            TriggerCard
                                        </div>
                                    </div>

                                    <div className="w-full bg-zinc-800/80 backdrop-blur rounded-lg p-3 border border-zinc-700 shadow-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe size={14} className="text-indigo-400" />
                                            <span className="text-xs font-bold text-white uppercase">Trigger: Webhook</span>
                                        </div>
                                        <div className="h-1 w-full bg-indigo-500/20 rounded overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-full bg-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="h-8 w-0.5 bg-zinc-700"
                                    initial={{ height: 0 }}
                                    animate={{ height: 32 }}
                                    transition={{ delay: 2.8 }}
                                />

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 3.0 }}
                                    className="w-full bg-zinc-800/80 backdrop-blur-md rounded-lg p-3 border border-white/10"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={14} className="text-yellow-400" />
                                        <span className="text-xs font-bold text-white uppercase">Agent: Analyst</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-3/4 bg-white/10 rounded" />
                                        <div className="h-2 w-1/2 bg-white/10 rounded" />
                                    </div>

                                    {/* AI Thinking animation */}
                                    <div className="mt-3 flex gap-1 justify-end">
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-indigo-500 rounded-full" />
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-indigo-500 rounded-full" />
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-indigo-500 rounded-full" />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Cursor Simulation */}
                            <motion.div
                                initial={{ opacity: 0, x: 100, y: 100 }}
                                animate={{ opacity: [0, 1, 1, 0], x: [100, 50, 50, 120], y: [100, 40, 40, 80] }}
                                transition={{ duration: 4, delay: 3, repeat: Infinity }}
                                className="absolute top-0 left-0 pointer-events-none"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19169L11.7841 12.3673H5.65376Z" fill="#3B82F6" stroke="white" />
                                </svg>
                                <div className="ml-4 mt-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded shadow-lg">
                                    User 1
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* Terminal / Bottom Pane */}
                    <div className="h-8 bg-[#0E0E10] border-t border-white/5 flex items-center px-4 text-xs text-zinc-500 gap-4">
                        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                            <Terminal size={12} />
                            <span>Terminal</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                            <span>Output</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                            <span>Problems</span>
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-2">
                            <span>Ln 24, Col 2</span>
                            <span>UTF-8</span>
                            <span>TypeScript</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
        </section>
    );
};
