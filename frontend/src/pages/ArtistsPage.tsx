import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import ArtistService, { type User } from "@/api/services/artistService";
import { toast } from "sonner";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Disciplines");

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";
  const placeholder =
    "https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await ArtistService.getAllArtists();
        // Backend usually returns { success: true, data: [...] }
        const data = response.data || response;
        setArtists(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Failed to load the artist directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  /**
   * Filter Logic:
   * 1. Hard filter for status === "ACTIVE"
   * 2. Soft filter for Discipline (Specialty or Bio)
   */
  const filteredArtists = useMemo(() => {
    // Stage 1: Security/Classification Layer
    const onlyActive = artists.filter((a) => a.status === "ACTIVE");

    // Stage 2: Selection Layer
    if (activeFilter === "All Disciplines") return onlyActive;

    const term = activeFilter.toLowerCase();
    return onlyActive.filter((a) => {
      const specialty = a.profile?.specialty?.toLowerCase() || "";
      const bio = a.profile?.bio?.toLowerCase() || "";
      return specialty.includes(term) || bio.includes(term);
    });
  }, [activeFilter, artists]);

  const disciplines = [
    "All Disciplines",
    "Weaving",
    "Pottery",
    "Painting",
    "Sculpture",
  ];

  return (
    <>
      <header className="px-8 md:px-16 pt-48 pb-12">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">
              Verified Artisan Directory
            </h2>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif tracking-tighter mb-10 text-slate-900 leading-[0.8]">
            The Artists.
          </h1>

          <div className="w-full h-px bg-slate-100 mb-10" />

          <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            <p className="text-slate-500 text-sm md:text-base max-w-xl font-light leading-relaxed">
              Our roster bridges ancestral knowledge with contemporary visual
              language. Each artisan is a custodian of Rwandan heritage,
              documented through physical form.
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest">
              {disciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveFilter(d)}
                  className={`relative pb-2 transition-all duration-300 ${
                    activeFilter === d
                      ? "text-slate-900"
                      : "text-slate-300 hover:text-slate-500"
                  }`}
                >
                  {d}
                  {activeFilter === d && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="px-8 md:px-16 py-20 max-w-screen-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-slate-200" size={48} />
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-32 gap-x-12">
            {filteredArtists.map((artist, index) => {
              const isWide = index % 3 === 0;
              const gridSpan = isWide ? "md:col-span-7" : "md:col-span-5";
              const aspectClass =
                index % 2 === 0 ? "aspect-[4/5]" : "aspect-square";

              const imageSrc = artist.profile?.profile_picture
                ? `${baseUrl}${artist.profile.profile_picture}`
                : placeholder;

              return (
                <div key={artist.user_id} className={`${gridSpan} group`}>
                  <Link to={`/artists/${artist.user_id}`} className="block">
                    <div
                      className={`relative overflow-hidden bg-slate-50 mb-8 transition-all duration-1000 ${aspectClass}`}
                    >
                      <img
                        src={imageSrc}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-all duration-[1.5s] ease-out grayscale group-hover:grayscale-0 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-700" />

                      <div className="absolute bottom-6 right-6 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="text-white w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-serif text-3xl md:text-4xl text-slate-900 group-hover:text-slate-500 transition-colors duration-500">
                          {artist.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                            {artist.profile?.specialty || "Artisan"}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                            {artist.profile?.location || "Kigali, Rwanda"}
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] font-serif italic text-slate-200 group-hover:text-slate-900 transition-colors duration-500 pt-2">
                        № {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-slate-100">
            <p className="font-serif italic text-slate-400 text-2xl">
              No active artisans currently found in this category.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
