import Footer from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navigation";
import { EXHIBITIONS } from "@/utils/consts";
import { ArrowRight, Grid3X3 } from "lucide-react";

export default function CollectionsPage() {
  const collections = EXHIBITIONS.filter((ex) => ex.type === "CLASSIFICATION");

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* Header Section */}
      <header className="px-8 md:px-16 pt-44 pb-20 border-b border-slate-50">
        <div className="max-w-4xl">
          <h1 className="text-7xl md:text-9xl font-serif mb-10 tracking-tighter leading-[0.9]">
            Collections.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-light max-w-2xl border-l-2 border-slate-900 pl-8">
            Digital classifications of the Rwandan archive. Exploring the
            intersection of geometric ancestry and modern artisan craftsmanship.
          </p>
        </div>
      </header>

      {/* Grid Section */}
      <section className="px-8 py-24 md:px-16">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-32">
          {collections.map((col, index) => (
            <div key={col.id} className="group cursor-pointer">
              {/* Portrait-style framing for a "curated" feel */}
              <div className="relative aspect-3/4 md:aspect-4/5 bg-slate-100 mb-10 overflow-hidden shadow-sm">
                <img
                  src={col.banner}
                  alt={col.title}
                  className="w-full h-full object-cover grayscale-30 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-in-out"
                />
                <div className="absolute top-8 left-8">
                  <span className="bg-white/95 backdrop-blur-md py-3 px-5 text-[9px] font-black tracking-[0.3em] uppercase flex items-center gap-3 shadow-xl">
                    <Grid3X3 className="w-4 h-4 text-slate-400" />{" "}
                    {col.itemCount || 0} Records
                  </span>
                </div>
              </div>

              <div className="flex gap-10">
                <span className="font-serif text-5xl text-slate-100 italic select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h2 className="text-4xl font-serif mb-4 tracking-tight group-hover:text-slate-600 transition-colors">
                    {col.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-6 font-bold">
                    Curated by {col.curator}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-md font-light italic">
                    "{col.description}"
                  </p>
                  <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] border-b border-slate-900 pb-2 group-hover:gap-8 transition-all">
                    Open Classification <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
