import { Instagram } from "lucide-react";

const COMMUNITY_IMAGES = [
  "https://images.unsplash.com/photo-1590736961141-72ec0b982941?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1616486788371-62d930495c44?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1536631980191-22588c368f87?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=600",
];

export default function CommunityHighlights() {
  return (
    <section className="px-8 py-24 bg-white">
      <div className="mb-16 text-center">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
          Follow @craftfolio
        </h3>
        <h4 className="text-4xl font-serif tracking-tight">
          Community Highlights
        </h4>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {COMMUNITY_IMAGES.map((src, i) => (
          <div
            key={i}
            className="aspect-square bg-slate-100 overflow-hidden group relative cursor-pointer"
          >
            {/* Real Image */}
            <img
              src={src}
              alt={`Community highlight ${i + 1}`}
              className="w-full h-full object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
            />

            {/* Instagram Style Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Instagram className="text-white w-6 h-6 stroke-[1.5px]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-200 pb-1 hover:border-black transition-colors">
          View Gallery
        </button>
      </div>
    </section>
  );
}
