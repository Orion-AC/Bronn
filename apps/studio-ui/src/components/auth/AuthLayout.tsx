import React from 'react';
import { motion } from 'framer-motion';
import { Puzzle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-[#050505] text-white overflow-hidden">
            {/* Left Side: Brand & Visuals (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-zinc-900 items-center justify-center p-12 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111_0%,#000_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                {/* Floating Elements Animation */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"
                    />
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"
                    />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                            <Puzzle className="text-white" size={24} />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            Build software like you<br />
                            compose music.
                        </h2>
                        <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                            "Bronn Studio changed how we ship. It's not just faster; it's a completely new way to think about system architecture."
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 z-${10 - i}`}>
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-zinc-500">
                                Trusted by <span className="text-white font-medium">10,000+</span> builders
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative">
                <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    Back to Website
                </Link>

                <div className="w-full max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                            <p className="text-zinc-400">{subtitle}</p>
                        </div>
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
