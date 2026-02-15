export default function MansorySection() {
  return (
    <section className="px-8 py-20 border-t border-slate-50">
      <div className="mb-16">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-2 text-center">
          Curated Selection
        </h3>
        <h4 className="text-4xl font-serif text-center">
          Spotlight on Mediums
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[450px]">
        {/* Vertical Large */}
        <div className="md:col-span-1 bg-slate-100 relative group cursor-pointer overflow-hidden">
          <img
            src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-15-1920w.jpg"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Urugori Crowns"
          />
          <div className="absolute bottom-6 left-6 text-white z-10">
            <p className="text-[9px] uppercase tracking-widest mb-1">
              Textiles
            </p>
            <p className="font-serif text-xl">Urugori Crowns</p>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>

        {/* Horizontal / Large focus */}
        <div className="md:col-span-2 bg-slate-100 relative group cursor-pointer overflow-hidden">
          <img
            src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-16-1920w.jpg"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Traditional Hut"
          />
          <div className="absolute bottom-6 left-6 text-white z-10">
            <p className="text-[9px] uppercase tracking-widest mb-1">
              Architecture
            </p>
            <p className="font-serif text-xl">Traditional Hut Restoration</p>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>

        {/* Vertical Large */}
        <div className="md:col-span-1 bg-slate-100 relative group cursor-pointer overflow-hidden">
          <img
            src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/timothy-inema-nomad-14-1920w.jpg"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Sacred Geometry"
          />
          <div className="absolute bottom-6 left-6 text-white z-10">
            <p className="text-[9px] uppercase tracking-widest mb-1">Pattern</p>
            <p className="font-serif text-xl">Sacred Geometry</p>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}
