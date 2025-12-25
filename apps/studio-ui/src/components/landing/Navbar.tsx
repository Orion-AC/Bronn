import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                style={{
                    backgroundColor: `rgba(5, 5, 5, ${isScrolled ? 0.8 : 0})`,
                    backdropFilter: `blur(${isScrolled ? 12 : 0}px)`,
                    borderColor: `rgba(255, 255, 255, ${isScrolled ? 0.1 : 0})`,
                }}
                className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-transparent transition-all duration-300"
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="font-bold text-white">B</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white hidden sm:block">Bronn Studio</span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Pricing', 'Docs', 'Blog'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:scale-105 transition-transform"
                        >
                            Start Building
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-zinc-400 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black pt-20 px-6 md:hidden">
                    <div className="flex flex-col gap-6 text-xl font-medium text-zinc-400">
                        {['Features', 'Pricing', 'Docs', 'Blog'].map((item) => (
                            <a key={item} href="#" className="hover:text-white">{item}</a>
                        ))}
                        <div className="h-px bg-white/10 my-4" />
                        <button onClick={() => navigate('/login')} className="text-left hover:text-white">Sign In</button>
                        <button onClick={() => navigate('/register')} className="text-left text-white font-bold">Start Building</button>
                    </div>
                </div>
            )}
        </>
    );
};
