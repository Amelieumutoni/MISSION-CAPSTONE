import { Link } from "react-router";
import { ARTISTS } from "@/utils/consts";

export default function ArtistsPage() {
  return (
    <>
      <header className="px-8 md:px-16 pt-48 pb-12">
        <div className="max-w-screen-2xl mx-auto">
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-6 font-bold">
            Directory
          </h2>
          <h1 className="text-6xl md:text-8xl font-serif tracking-tighter mb-10 text-slate-900 leading-[0.8]">
            The Artists.
          </h1>
          <div className="w-full h-px bg-slate-100 mb-10" />
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <p className="text-slate-500 text-sm md:text-base max-w-xl font-light leading-relaxed">
              A curated roster of Rwanda's most significant creative voices. Our
              artists bridge the gap between ancestral knowledge and
              contemporary visual language, documenting heritage through
              physical form.
            </p>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-900 underline underline-offset-8">
                All Disciplines
              </span>
              <span className="text-slate-300">Weaving</span>
              <span className="text-slate-300">Pottery</span>
              <span className="text-slate-300">Painting</span>
            </div>
          </div>
        </div>
      </header>

      {/* ASYMMETRICAL ARTIST GRID */}
      <section className="px-8 md:px-16 py-20 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-32 gap-x-8">
          {ARTISTS.map((artist, index) => {
            // This logic creates an asymmetrical "staggered" feel
            const isWide = index % 3 === 0;
            const gridSpan = isWide ? "md:col-span-7" : "md:col-span-5";
            const aspectClass =
              index % 2 === 0 ? "aspect-[4/5]" : "aspect-square";

            return (
              <div
                key={artist.id}
                className={`${gridSpan} group cursor-pointer`}
              >
                <Link to={`/artists/${artist.id}`} className="block">
                  <div
                    className={`relative overflow-hidden bg-slate-50 mb-8 transition-all duration-700 ${aspectClass}`}
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    />
                    {/* Minimal Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>

                  <div className="flex justify-between items-start border-b border-transparent group-hover:border-slate-100 pb-4 transition-all">
                    <div>
                      <h3 className="font-serif text-3xl text-slate-900 group-hover:text-slate-600 transition-colors">
                        {artist.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-2 font-bold">
                        {artist.specialty}
                      </p>
                    </div>
                    <div className="text-[10px] font-serif italic text-slate-300 group-hover:text-slate-900 transition-colors pt-2">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
