import { motion } from 'framer-motion';
import { FileCode, Workflow, Zap } from 'lucide-react';

const Step = ({
    icon: Icon,
    title,
    description,
    codeSnippet,
    align = 'left',
    index
}: {
    icon: any,
    title: string,
    description: string,
    codeSnippet?: React.ReactNode,
    align?: 'left' | 'right',
    index: number
}) => (
    <div className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 py-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>

        {/* Text Side */}
        <motion.div
            initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-6"
        >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-indigo-400">
                <Icon size={24} />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-zinc-500 text-lg font-mono block mb-2">0{index} — {title}</span>
                {description}
            </h3>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                Bronn doesn't hide the complexity—it just gives you better handles for it.
                Write standard TypeScript, then lift it into a visual workflow when you need to orchestrate.
            </p>
        </motion.div>

        {/* Visual Side */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full"
        >
            <div className="rounded-xl bg-[#0E0E10] border border-white/10 overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                {/* Window controls */}
                <div className="h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>

                <div className="p-6 overflow-x-auto">
                    {codeSnippet ? (
                        <div className="font-mono text-sm leading-relaxed">
                            {codeSnippet}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-zinc-600 font-mono text-sm">
                            [ Visual Workflow Representation ]
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    </div>
);

export const WorkflowStory = () => {
    return (
        <section className="bg-black text-white py-32 px-6">
            <div className="max-w-7xl mx-auto">

                <Step
                    index={1}
                    icon={FileCode}
                    title="The Logic"
                    description="It starts with code, not a text box."
                    align="left"
                    codeSnippet={
                        <>
                            <div className="text-purple-400">import</div> <div className="text-white inline">{'{'} z {'}'}</div> <div className="text-purple-400 inline">from</div> <div className="text-green-400 inline">'zod'</div>;
                            <br /><br />
                            <div className="text-purple-400">export const</div> <div className="text-blue-400 inline">schema</div> = z.object({'{'}
                            <div className="pl-4">email: z.string().email(),</div>
                            <div className="pl-4">plan: z.enum([<div className="text-green-400 inline">'pro'</div>, <div className="text-green-400 inline">'enterprise'</div>])</div>
                            {'}'});
                        </>
                    }
                />

                <Step
                    index={2}
                    icon={Workflow}
                    title="The Flow"
                    description="Drag, drop, and connect. No glue code required."
                    align="right"
                    codeSnippet={
                        <div className="relative h-60 w-full flex items-center justify-center">
                            {/* Simulated Nodes */}
                            <div className="absolute left-10 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-xs">
                                POST /checkout
                            </div>
                            <div className="absolute p-3 rounded-lg bg-indigo-500/20 border border-indigo-500 text-xs text-indigo-200">
                                Agent: Risk Check
                            </div>
                            <div className="absolute right-10 p-3 rounded-lg bg-green-900/20 border border-green-700 text-xs text-green-200">
                                DB: Insert
                            </div>
                            {/* Connecting Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <line x1="20%" y1="50%" x2="40%" y2="50%" stroke="#333" strokeWidth="2" />
                                <line x1="60%" y1="50%" x2="80%" y2="50%" stroke="#333" strokeWidth="2" />
                            </svg>
                        </div>
                    }
                />

                <Step
                    index={3}
                    icon={Zap}
                    title="The Scale"
                    description="Deploy to edge in one click. No cold starts."
                    align="left"
                    codeSnippet={
                        <div className="space-y-2 font-mono text-zinc-400">
                            <div>$ bronn deploy --prod</div>
                            <div className="text-yellow-400">→ Building...</div>
                            <div className="text-zinc-500">  └ dist/index.js (24kb)</div>
                            <div className="text-green-400">✔ Deployed to edge (32ms)</div>
                            <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-300 text-xs">
                                https://api.bronn.dev/v1/checkout
                            </div>
                        </div>
                    }
                />

            </div>
        </section>
    );
};
