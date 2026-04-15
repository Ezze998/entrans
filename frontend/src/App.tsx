import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EventCard from './components/EventCard';

function App() {
  const events = [
    { id: 1, title: "Neon Nights Music Fest", price: 89, date: "June 24, 2026", location: "Miami", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500" },
    { id: 2, title: "Indie Rock Rising", price: 45, date: "July 02, 2026", location: "Brooklyn", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500" },
    { id: 3, title: "Future Tech Summit", price: 299, date: "Nov 15, 2026", location: "Skyline Center", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500" },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />
      <Hero />
      
      {/* Event Grid Section */}
      <section className="py-24 px-8 max-w-screen-2xl mx-auto">
        <h2 className="font-headline text-5xl font-extrabold mb-12">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;