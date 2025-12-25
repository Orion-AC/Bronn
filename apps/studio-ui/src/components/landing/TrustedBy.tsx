export const TrustedBy = () => {
    return (
        <section className="py-12 border-y border-white/5 bg-black">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                <p className="text-zinc-500 text-sm font-medium whitespace-nowrap">
                    TRUSTED BY BUILDERS AT
                </p>
                <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder Logos showing names for now */}
                    <span className="text-lg font-bold text-zinc-300">Acme Corp</span>
                    <span className="text-lg font-bold text-zinc-300">Stripe</span>
                    <span className="text-lg font-bold text-zinc-300">Vercel</span>
                    <span className="text-lg font-bold text-zinc-300">Linear</span>
                    <span className="text-lg font-bold text-zinc-300">Raycast</span>
                </div>
            </div>
        </section>
    );
};
