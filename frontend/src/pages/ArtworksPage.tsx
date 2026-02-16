import { Link } from "react-router";
import { ALL_ARTWORKS } from "@/utils/consts";
import { Filter, Grid3X3, Maximize2 } from "lucide-react";

export default function ArtworksPage() {
  return (
    <>
      <header className="px-8 md:px-16 pt-44 pb-12 border-b border-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tighter mb-4">
              The Archive.
            </h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.5em] font-black">
              Cataloging {ALL_ARTWORKS.length} Unique Plates
            </p>
          </div>

          <div className="flex gap-8 pb-2">
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b border-slate-900 pb-1">
              <Filter className="w-3 h-3" /> Filter By Medium
            </button>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
              <Grid3X3 className="w-3 h-3" /> Sort: Newest
            </button>
          </div>
        </div>
      </header>

      {/* ARTWORK MASONRY GRID */}
      <section className="px-8 md:px-16 py-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-20">
          {ALL_ARTWORKS.map((work) => (
            <div
              key={work.id}
              className="break-inside-avoid group cursor-crosshair"
            >
              <Link to={`/artwork/${work.id}`} className="block">
                {/* Image Container */}
                <div className="relative mb-6 overflow-hidden bg-slate-50">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="text-white w-6 h-6" />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex justify-between items-start border-l border-slate-100 pl-6">
                  <div>
                    <h3 className="font-serif text-2xl text-slate-900 mb-1">
                      {work.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold mb-3">
                      {work.artistName}
                    </p>
                    <div className="flex gap-4">
                      <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                        {work.medium}
                      </span>
                      <span className="text-[9px] text-slate-400 font-serif italic">
                        {work.year}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
