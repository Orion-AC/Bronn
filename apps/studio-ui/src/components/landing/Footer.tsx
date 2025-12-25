import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-black py-32 border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
                        Start building.<br />Stop stitching.
                    </h2>

                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-white text-black rounded-full text-lg font-medium hover:scale-105 transition-transform"
                    >
                        Enter Studio
                    </button>

                    <div className="mt-12 flex items-center justify-center gap-8 text-zinc-500 text-sm font-mono">
                        <span>OPEN SOURCE</span>
                        <span>•</span>
                        <span>SELF HOSTABLE</span>
                        <span>•</span>
                        <span>ENTERPRISE READY</span>
                    </div>
                </motion.div>

                <div className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-sm">
                    <p>&copy; 2025 Bronn Inc.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Discord</a>
                        <a href="#" className="hover:text-white transition-colors">Docs</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
