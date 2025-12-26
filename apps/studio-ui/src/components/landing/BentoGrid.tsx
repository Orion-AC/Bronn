import { motion } from 'framer-motion';
import { Database, Lock, Search, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const BentoCard = ({
    title,
    subtitle,
    icon: Icon,
    className = "",
    children
}: {
    title: string,
    subtitle: string,
    icon: LucideIcon,
    className?: string,
    children?: React.ReactNode
}) => (
    <div className={`group relative bg-zinc-900 border border-white/5 overflow-hidden rounded-2xl p-6 hover:border-white/10 transition-colors ${className}`}>
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white group-hover:bg-indigo-500/20 transition-colors">
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-zinc-200 font-semibold">{title}</h3>
                    <p className="text-zinc-500 text-xs">{subtitle}</p>
                </div>
            </div>
            <div className="flex-1 mt-4">
                {children}
            </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
);

export const BentoGrid = () => {
    return (
        <section className="bg-black py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Everything included.</h2>
                <p className="text-zinc-400">Stop stitching 10 SAAS tools together.</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
                {/* Large Card 1: Database */}
                <BentoCard
                    title="Postgres Database"
                    subtitle="Built-in, typed, and real-time."
                    icon={Database}
                    className="md:col-span-2 md:row-span-1 border-indigo-500/20"
                >
                    <div className="bg-[#0E0E10] rounded-lg p-4 font-mono text-xs text-zinc-400 h-full border border-white/5 flex flex-col justify-center">
                        <div className="flex justify-between mb-2 text-zinc-600 border-b border-white/5 pb-2">
                            <span>id</span> <span>email</span> <span>role</span> <span>created_at</span>
                        </div>
                        <motion.div
                            initial={{ opacity: 0.5 }}
                            whileHover={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            className="flex justify-between py-1 cursor-pointer rounded px-1"
                        >
                            <span className="text-indigo-400">uuid-1</span> <span>alex@bronn.dev</span> <span className="text-green-400">admin</span> <span>2m ago</span>
                        </motion.div>
                        <div className="flex justify-between py-1 opacity-50 px-1">
                            <span className="text-indigo-400">uuid-2</span> <span>sarah@demo.com</span> <span>user</span> <span>5m ago</span>
                        </div>
                    </div>
                </BentoCard>

                {/* Tall Card: Vector Store */}
                <BentoCard
                    title="Vector Store"
                    subtitle="Embeddings standard."
                    icon={Search}
                    className="md:col-span-1 md:row-span-2"
                >
                    <div className="h-full flex flex-col items-center justify-center gap-4 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-60"
                        />
                        <div className="relative z-10 text-center space-y-2">
                            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] border border-zinc-700">RAG Ready</div>
                            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] border border-zinc-700">Semantic Search</div>
                            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] border border-zinc-700">Cosine Sim.</div>
                        </div>
                    </div>
                </BentoCard>

                {/* Card 3: Auth */}
                <BentoCard
                    title="Authentication"
                    subtitle="Users, Roles, Permissions."
                    icon={Lock}
                    className="md:col-span-1"
                >
                    <div className="bg-[#0E0E10] rounded border border-white/5 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <div className="h-2 w-20 bg-zinc-800 rounded" />
                        </div>
                        <div className="h-8 bg-indigo-600 rounded w-full opacity-20" />
                    </div>
                </BentoCard>

                {/* Card 4: Edge Functions */}
                <BentoCard
                    title="Edge Functions"
                    subtitle="Typescript running at the edge."
                    icon={Globe}
                    className="md:col-span-1"
                >
                    <div className="flex items-center justify-center h-full">
                        <Globe className="text-zinc-700 w-32 h-32 absolute opacity-10" />
                        <div className="flex gap-4 relative z-10">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                        </div>
                    </div>
                </BentoCard>

            </div>
        </section>
    );
};
