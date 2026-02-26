import { Play } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="px-8 py-12 lg:py-24">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <h2 className="text-6xl lg:text-8xl font-serif font-light leading-[0.85] mb-8">
            Heritage <br /> <span className="italic">Redefined.</span>
          </h2>
          <p className="max-w-sm text-slate-500 text-sm leading-relaxed mb-10">
            An exclusive digital archive and live-streaming platform connecting
            Rwandan master artisans with global collectors.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/collections")}
              className="rounded-none bg-slate-900 text-white px-8 py-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-800"
            >
              Explore Works
            </Button>
            <Button
              onClick={() => navigate("/archives")}
              variant="outline"
              className="rounded-none border-slate-900 px-8 py-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
            >
              The Archive
            </Button>
          </div>
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="aspect-video bg-slate-100 relative group overflow-hidden">
            <img
              src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-12-1920w.JPG"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105"
              alt="Rwandan artisan at work"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-slate-900 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
