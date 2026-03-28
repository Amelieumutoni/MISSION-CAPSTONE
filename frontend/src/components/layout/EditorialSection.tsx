import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const steps = [
  {
    id: "01",
    title: "Artist Documentation",
    description:
      "Artists capture and upload high-fidelity media, materials, and metadata. Each piece is structured into a permanent digital record.",
    image:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80",
    overlay: "Uploading • Metadata Sync",
  },
  {
    id: "02",
    title: "System Validation",
    description:
      "Submissions go through identity and quality verification. Approved works receive a trusted status within the ecosystem.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80",
    overlay: "Verified ✓",
  },
  {
    id: "03",
    title: "Collector Discovery",
    description:
      "Collectors explore verified works, attend live sessions, and acquire pieces directly from authenticated sources.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80",
    overlay: "Live • Available",
  },
];

export default function HowItWorksSection() {
  const navigate = useNavigate();

  return (
    <section className="px-8 py-24 bg-slate-900 text-white border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-500 mb-3 font-bold">
              The Ecosystem
            </h3>
            <h4 className="text-5xl font-serif tracking-tight">How It Works</h4>
          </div>

          <button
            onClick={() => navigate("/register")}
            className="text-[10px] uppercase tracking-widest font-black border-b border-slate-700 pb-1 hover:border-white hover:text-white text-slate-400 transition-all"
          >
            Join As An Artist
          </button>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.id} className="group cursor-pointer">
              {/* IMAGE */}
              <div className="aspect-[16/10] bg-slate-800 mb-8 overflow-hidden relative border border-white/5">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.2s] ease-out opacity-80 group-hover:opacity-100"
                />

                {/* DARK OVERLAY */}
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-transparent transition-colors duration-500" />

                {/* SYSTEM OVERLAY (KEY IMPROVEMENT) */}
                <div className="absolute top-4 left-4 text-[10px] bg-black/60 px-3 py-1 uppercase tracking-widest font-bold backdrop-blur-sm">
                  {step.overlay}
                </div>
              </div>

              {/* TEXT */}
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold flex items-center gap-3">
                  <span className="w-6 h-px bg-slate-700 group-hover:w-10 group-hover:bg-white transition-all duration-500" />
                  Step {step.id}
                </p>

                <h5 className="font-serif text-3xl mb-4 group-hover:text-slate-300 transition-colors tracking-tight">
                  {step.title}
                </h5>

                <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 pt-12 border-t border-white/5 flex justify-center">
          <button
            onClick={() => navigate("/archives")}
            className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white"
          >
            Explore the archives
            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-blue-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
