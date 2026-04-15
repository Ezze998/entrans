export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-900/70 backdrop-blur-xl">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-orange-500 uppercase font-headline">Entrans</div>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-orange-500 font-bold border-b-2 border-orange-500 pb-1 font-headline tracking-tight" href="#">Events</a>
          <a className="text-neutral-400 hover:text-white transition-colors font-headline tracking-tight" href="#">Venues</a>
          <a className="text-neutral-400 hover:text-white transition-colors font-headline tracking-tight" href="#">Promoters</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface hover:text-orange-400 transition-all font-bold uppercase text-xs tracking-widest px-4">Sign In</button>
          <button className="action-gradient text-on-primary font-bold uppercase text-xs tracking-widest px-6 py-3 rounded-lg hover:scale-95 transition-all">Create Event</button>
        </div>
      </div>
    </nav>
  );
}