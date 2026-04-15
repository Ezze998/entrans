export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Concert Hero"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1470229722913-7c090b332da8?q=80&w=2000"
                />
                <div className="absolute inset-0 bg-black/50 hero-gradient"></div>
            </div>
            <div className="relative z-10 max-w-screen-2xl mx-auto px-8 w-full">
                <div className="max-w-4xl">
                    <h1 className="font-headline text-6xl md:text-8xl font-extrabold tracking-tighter leading-none mb-6">
                        Your Gateway to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#FFB77D] font-extrabold">
                            Unforgettable
                        </span> <br />
                        Experiences
                    </h1>
                    <p className="text-neutral-400 text-xl md:text-2xl max-w-2xl font-light mb-10 leading-relaxed">
                        Discover, book, and experience the world's most pulsating live events. From underground beats to stadium anthems.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="action-gradient text-on-primary font-bold uppercase text-sm tracking-widest px-10 py-5 rounded-lg hover:scale-95 transition-all">
                            Browse Events
                        </button>
                        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold uppercase text-sm tracking-widest px-10 py-5 rounded-lg hover:bg-white/20 transition-all">
                            View Schedule
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}