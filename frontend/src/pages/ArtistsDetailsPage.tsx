import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Instagram, Globe, Loader2, MapPin } from "lucide-react";
import ArtistService, { type User } from "@/api/services/artistService";
import { toast } from "sonner";

// Aligned with your Sequelize include structure
interface GalleryMedia {
  file_path: string;
  media_type: string;
  is_primary: boolean;
}

interface Artwork {
  artwork_id: number;
  title: string;
  technique: string;
  year_created: string;
  main_image: string;
  gallery?: GalleryMedia[];
}

export default function ArtistDetailPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";
  const placeholder =
    "https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    const fetchArtisanHistory = async () => {
      try {
        if (!id) return;

        // This now calls the getArtisanHistory controller via your service
        const response = await ArtistService.getArtist(Number(id));

        // Handling the { success: true, data: artisanData } structure
        const artisanData = response.data || response;
        setArtist(artisanData);
      } catch (error) {
        console.error("Archive retrieval error:", error);
        toast.error("Failed to retrieve artisan history.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-slate-200" size={40} />
        <span className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">
          Accessing Kigali Archives
        </span>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <p className="font-serif italic text-2xl">Artisan record not found.</p>
        <Link
          to="/artists"
          className="text-[10px] font-bold uppercase border-b border-black"
        >
          Return to Directory
        </Link>
      </div>
    );
  }

  // Resolve Profile Picture
  const profileImg = artist.profile?.profile_picture
    ? `${baseUrl}${artist.profile.profile_picture}`
    : placeholder;

  return (
    <div className="pt-32 px-8 md:px-16 pb-24 max-w-screen-2xl mx-auto">
      <Link
        to="/artists"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black mb-12 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back to Directory
      </Link>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* LEFT COLUMN: Profile info mapped to your new Controller attributes */}
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-white border border-slate-100 mb-10 overflow-hidden">
            <img
              src={profileImg}
              alt={artist.name}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-serif tracking-tighter leading-none">
              {artist.name}
            </h1>

            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-3 h-3" />{" "}
                {artist.profile?.location || "Kigali, Rwanda"}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                Specialty: {artist.profile?.specialty || "General Artisan"} •{" "}
                {artist.profile?.years_experience || 0} Yrs Exp
              </p>
            </div>

            <p className="text-slate-500 leading-relaxed font-light text-lg border-l border-slate-100 pl-6 italic">
              {artist.profile?.bio ||
                "No biography documented in the archive yet."}
            </p>

            <div className="flex gap-4 pt-4 border-t border-slate-100 mt-8">
              <Instagram className="w-4 h-4 cursor-pointer hover:text-slate-400 transition-colors" />
              <Globe className="w-4 h-4 cursor-pointer hover:text-slate-400 transition-colors" />
              <span className="text-[10px] uppercase tracking-widest text-slate-300 ml-auto font-bold">
                ID: CF-A{String(artist.user_id).padStart(3, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Nested Artworks from the "artworks" include */}
        <div className="lg:col-span-7">
          <div className="border-b border-slate-200 pb-4 mb-10 flex justify-between items-end">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">
              Archived Works ({artist.artworks?.length || 0})
            </h2>
            <span className="text-slate-400 font-serif italic text-[11px]">
              Chronological History
            </span>
          </div>

          {artist.artworks && artist.artworks.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-10">
              {artist.artworks.map((work: any) => {
                const primaryMedia = work.gallery?.find(
                  (m: any) => m.is_primary,
                );
                const displayImg = primaryMedia
                  ? `${baseUrl}${primaryMedia.file_path}`
                  : work.main_image
                    ? `${baseUrl}${work.main_image}`
                    : placeholder;

                // 2. Determine Navigation Path based on status
                const targetPath =
                  work.status === "ARCHIVED"
                    ? `/archives/${work.artwork_id}`
                    : `/shop`;

                return (
                  <Link
                    to={targetPath}
                    key={work.artwork_id}
                    className="group block"
                  >
                    <div className="relative aspect-square bg-slate-50 border border-slate-100 mb-6 overflow-hidden">
                      <img
                        src={displayImg}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Optional: Add a subtle status badge for visual clarity */}
                      {work.status === "ARCHIVED" && (
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-2 py-1">
                          <span className="text-[8px] uppercase tracking-tighter font-bold">
                            Archive
                          </span>
                        </div>
                      )}
                    </div>

                    <h4 className="font-serif text-xl group-hover:text-slate-500 transition-colors leading-none mb-2">
                      {work.title}
                    </h4>

                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                      {work.technique} • {work.year_created || "Original"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center border border-dashed border-slate-200">
              <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                No history documented yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
