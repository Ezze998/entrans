interface EventProps {
  title: string;
  price: number;
  date: string;
  location: string;
  image: string;
}

export default function EventCard({ title, price, date, location, image }: EventProps) {
  return (
    <div className="group bg-surface-container-low rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300">
      <div className="aspect-[4/5] relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-headline text-2xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{title}</h3>
          <span className="text-orange-500 font-black text-xl">${price}</span>
        </div>
        <div className="space-y-2 mb-6 text-neutral-400 text-sm">
          <p>📅 {date}</p>
          <p>📍 {location}</p>
        </div>
        <button className="w-full py-4 bg-neutral-800 text-white font-bold uppercase text-xs tracking-widest rounded hover:bg-orange-500 transition-all">
          Get Tickets
        </button>
      </div>
    </div>
  );
}