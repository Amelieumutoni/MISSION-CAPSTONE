import React from "react";

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900 min-h-screen">
      {/* HERO SECTION */}
      <section className="px-6 py-32 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-3 font-semibold">
            Our Mission
          </h3>
          <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
            Preserving Digital Heritage
          </h1>
          <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Craftfolio bridges the gap between traditional Rwandan craftsmanship
            and the global digital economy. We provide verified documentation
            and archival of artistic works to protect intellectual property,
            promote transparency, and ensure recognition for artisans worldwide.
          </p>
        </div>
      </section>

      {/* CORE PHILOSOPHY */}
      <section className="px-6 py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="aspect-square overflow-hidden rounded-lg shadow-md">
          <img
            src="https://lirp.cdn-website.com/09ed37c1/dms3rep/multi/opt/Nziza%2BArt%2BInitiative-inema-nomad-agency-10-1920w.JPG"
            alt="Artisan at work"
            className="w-full h-full object-cover grayscale transition duration-700 hover:grayscale-0"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold">
            “Documenting Process as Value”
          </h2>
          <p className="text-slate-700 text-base leading-relaxed">
            Craftfolio was founded to protect the creative process and
            intellectual property of local artisans. Every piece is meticulously
            documented — from initial sketches to final craftsmanship — ensuring
            that Rwandan art is not only preserved but fully understood and
            celebrated on a global scale.
          </p>
          <p className="text-slate-700 text-base leading-relaxed">
            By combining traditional mastery with modern digital tools, we
            provide artisans with visibility, collectors with confidence, and
            institutions with a permanent archive of cultural heritage.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
            <div>
              <h4 className="text-blue-600 font-mono text-sm uppercase tracking-wide mb-1">
                Verified Artisans
              </h4>
              <p className="text-2xl font-serif font-semibold">
                100% Manual Verification
              </p>
            </div>
            <div>
              <h4 className="text-blue-600 font-mono text-sm uppercase tracking-wide mb-1">
                Data Retention
              </h4>
              <p className="text-2xl font-serif font-semibold">
                Permanent & Secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADDITIONAL INFO (Optional) */}
      <section className="px-6 py-24 max-w-5xl mx-auto text-center">
        <h3 className="text-sm uppercase tracking-wide text-slate-500 mb-6 font-semibold">
          Our Commitment
        </h3>
        <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
          Craftfolio is committed to building trust between creators and
          collectors by offering verified documentation, permanent digital
          archives, and educational resources. We believe that the value of art
          lies not only in the final piece but also in the skill, process, and
          story behind it.
        </p>
      </section>
    </main>
  );
}
