import { COLLECTIONS } from "@/utils/consts";
import { ChevronRight } from "lucide-react";

export default function CollectionsSection() {
  return (
    <section className="px-8 pt-24  bg-white">
      <div className="mb-20 text-center">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
          Curated By Experts
        </h3>
        <h4 className="text-6xl font-serif tracking-tight">Collections</h4>
      </div>

      {/* Large Featured Collections */}
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {COLLECTIONS.slice(0, 2).map((col) => (
          <CollectionCard key={col.title} {...col} />
        ))}
      </div>

      {/* Compact Secondary Collections */}
      <div className="grid md:grid-cols-3 gap-12">
        {COLLECTIONS.slice(2).map((col) => (
          <CollectionCard key={col.title} {...col} compact />
        ))}
      </div>
    </section>
  );
}

function CollectionCard({
  title,
  curator,
  pieces,
  description,
  image,
  compact = false,
}: {
  title: string;
  curator: string;
  pieces: number;
  description: string;
  image: string;
  compact?: boolean;
}) {
  return (
    <div className="group cursor-pointer">
      <div
        className={`${
          compact ? "aspect-4/3" : "aspect-16/10"
        } bg-slate-100 mb-8 overflow-hidden relative shadow-sm`}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover grayscale-30 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
        />

        {/* Overlay Badge */}
        <div className="absolute top-6 left-6">
          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-slate-900 text-[8px] font-black tracking-[0.3em] uppercase shadow-sm">
            {pieces} Pieces
          </span>
        </div>

        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="max-w-md">
        <h5
          className={`${compact ? "text-xl" : "text-3xl"} font-serif mb-3 tracking-tight`}
        >
          {title}
        </h5>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 font-medium">
          Curated by <span className="text-slate-900">{curator}</span>
        </p>

        {!compact && (
          <p className="text-sm text-slate-500 leading-relaxed mb-6 italic">
            "{description}"
          </p>
        )}

        <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1 group-hover:gap-4 transition-all">
          Explore <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
