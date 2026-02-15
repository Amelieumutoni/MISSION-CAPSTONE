import { ArrowRight } from "lucide-react";

export default function EditorialSection() {
  return (
    <section className="bg-slate-900 text-white py-24 px-8">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <img
            src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-10-1920w.JPG"
            className="w-full aspect-square object-cover"
            alt="Artisan story"
          />
        </div>
        <div className="lg:w-1/2">
          <h3 className="text-4xl font-serif mb-8 italic">
            "Every stitch tells a story of survival and rebirth."
          </h3>
          <p className="text-slate-400 font-sans text-sm leading-loose uppercase tracking-widest mb-8">
            Craftfolio documentation project aims to digitize the unseen process
            of Rwandan artisans, ensuring that the 'how' is never lost to time.
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] group"
          >
            Read the Journal{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
