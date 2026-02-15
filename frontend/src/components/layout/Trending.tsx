import { TRENDING_WORKS } from "@/utils/consts";
import { Heart, ChevronRight, ArrowUpRight } from "lucide-react";

export default function TrendingSection() {
  return (
    <section className="px-8 py-20 bg-white">
      <div className="flex items-end justify-between mb-12 border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
            Curated Selection
          </h3>
          <h4 className="text-4xl font-serif leading-none">Trending Now</h4>
        </div>
        <a
          href="/market"
          className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 group hover:text-slate-500 transition-colors"
        >
          Explore Marketplace{" "}
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {TRENDING_WORKS.map((work) => (
          <TrendingArtCard key={work.id} work={work} />
        ))}
      </div>
    </section>
  );
}

function TrendingArtCard({ work }: { work: (typeof TRENDING_WORKS)[0] }) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-3/4 bg-slate-50 mb-4 overflow-hidden relative">
        {/* Real Image */}
        <img
          src={work.image}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-20 group-hover:grayscale-0"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Interaction Buttons */}
        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-900 hover:text-white transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button className="w-full bg-white/90 backdrop-blur-sm py-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            Quick View <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Text Info */}
      <div className="space-y-1">
        <h5 className="font-serif text-[15px] group-hover:text-slate-600 transition-colors">
          {work.title}
        </h5>
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
          <p className="text-slate-400">{work.artist}</p>
          <p className="font-bold text-slate-900">{work.price}</p>
        </div>
      </div>
    </div>
  );
}
