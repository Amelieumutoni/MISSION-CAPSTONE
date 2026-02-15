import { useParams, Link } from "react-router";
import { ARTISTS } from "@/utils/consts";
import { ArrowLeft, Instagram, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export default function ArtistDetailPage() {
  const { id } = useParams();

  // 2. Find the artist in your data that matches that ID
  const artist = ARTISTS.find((a) => a.id === id);

  // 3. Handle the case where the artist doesn't exist
  if (!artist) {
    return (
      <div className="h-screen flex items-center justify-center font-serif italic">
        Artist archive not found.
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      <div className="pt-32 px-8 md:px-16 pb-24">
        {/* Navigation Back */}
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black mb-12 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Artists
        </Link>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* LEFT COLUMN: The Visual & Bio */}
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] bg-slate-100 mb-10 overflow-hidden">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl font-serif tracking-tighter">
                {artist.name}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-red-600">
                {artist.specialty}
              </p>
              <p className="text-slate-500 leading-relaxed font-light text-lg">
                {artist.bio}
              </p>

              <div className="flex gap-4 pt-4">
                <Instagram className="w-4 h-4 cursor-pointer hover:text-red-600 transition-colors" />
                <Globe className="w-4 h-4 cursor-pointer hover:text-red-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Works (Collections) */}
          <div className="lg:col-span-7">
            <div className="border-b border-slate-100 pb-4 mb-10 flex justify-between items-end">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">
                Documented Works
              </h2>
              <span className="text-slate-300 font-serif italic text-sm">
                {artist.artworks.length} Pieces
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
              {artist.artworks.map((work) => (
                <Link
                  to={`/artwork/${work.id}`}
                  key={work.id}
                  className="group"
                >
                  <div className="aspect-square bg-slate-50 mb-6 overflow-hidden">
                    <img
                      src={work.image}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h4 className="font-serif text-xl group-hover:text-slate-500 transition-colors">
                    {work.title}
                  </h4>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">
                    {work.medium} • {work.year}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
