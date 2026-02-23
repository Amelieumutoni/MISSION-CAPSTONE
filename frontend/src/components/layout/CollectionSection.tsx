import { useEffect, useState } from "react";
import {
  ChevronRight,
  Archive,
  Calendar,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function CollectionsSection() {
  const navigate = useNavigate();
  const [archivedExhibitions, setArchivedExhibitions] = useState<Exhibition[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    fetchArchivedExhibitions();
  }, []);

  const fetchArchivedExhibitions = async () => {
    try {
      const res = await ExhibitionService.getPublicExhibitions({
        type: "CLASSIFICATION",
      });

      console.log(res.data);
      setArchivedExhibitions(res.data.slice(0, 5)); // Show only first 5 archived exhibitions
    } catch (err) {
      console.error("Failed to fetch archived exhibitions:", err);
      toast.error("Failed to load archived exhibitions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="px-8 py-24 bg-white">
        <div className="mb-20 text-center">
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
            Curated By Experts
          </h3>
          <h4 className="text-6xl font-serif tracking-tight">Collections</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-16/10 bg-slate-200 mb-8" />
              <div className="h-8 bg-slate-200 w-3/4 mb-3" />
              <div className="h-4 bg-slate-200 w-1/2 mb-4" />
              <div className="h-12 bg-slate-200 w-full mb-6" />
              <div className="h-4 bg-slate-200 w-24" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-24 bg-white">
      <div className="mb-20 text-center">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
          Curated By Experts
        </h3>
        <h4 className="text-6xl font-serif tracking-tight">Collections</h4>
        {archivedExhibitions.length > 0 && (
          <p className="text-sm text-slate-500 mt-4">
            Explore {archivedExhibitions.length} archived exhibitions
          </p>
        )}
      </div>

      {/* Large Featured Archived Exhibitions */}
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        {archivedExhibitions.slice(0, 2).map((exhibition) => (
          <ArchivedExhibitionCard
            key={exhibition.exhibition_id}
            exhibition={exhibition}
            baseUrl={baseUrl}
          />
        ))}
      </div>

      {/* Compact Secondary Archived Exhibitions */}
      {archivedExhibitions.length > 2 && (
        <div className="grid md:grid-cols-3 gap-12">
          {archivedExhibitions.slice(2, 5).map((exhibition) => (
            <ArchivedExhibitionCard
              key={exhibition.exhibition_id}
              exhibition={exhibition}
              baseUrl={baseUrl}
              compact
            />
          ))}
        </div>
      )}

      {archivedExhibitions.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-slate-100">
          <Archive className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400 text-sm">
            No archived exhibitions available
          </p>
        </div>
      )}
    </section>
  );
}

function ArchivedExhibitionCard({
  exhibition,
  baseUrl,
  compact = false,
}: {
  exhibition: Exhibition;
  baseUrl: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();

  const bannerImage = exhibition.banner_image
    ? exhibition.banner_image.startsWith("http")
      ? exhibition.banner_image
      : `${baseUrl}${exhibition.banner_image}`
    : "https://via.placeholder.com/1280x720?text=Archived+Exhibition";

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/exhibitions/${exhibition.exhibition_id}`)}
    >
      <div
        className={`${
          compact ? "aspect-4/3" : "aspect-16/10"
        } bg-slate-100 mb-8 overflow-hidden relative shadow-sm`}
      >
        <img
          src={bannerImage}
          alt={exhibition.title}
          className="w-full h-full object-cover grayscale-30 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
        />

        {/* Overlay Badges */}
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-slate-900 text-[8px] font-black tracking-[0.3em] uppercase shadow-sm flex items-center gap-1">
            <Archive className="w-3 h-3" />
            ARCHIVED
          </span>
          {exhibition.type === "LIVE" && (
            <span className="px-4 py-2 bg-indigo-600/95 backdrop-blur-sm text-white text-[8px] font-black tracking-[0.3em] uppercase shadow-sm">
              {exhibition.type}
            </span>
          )}
        </div>

        {/* Stats Badge */}
        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-[8px] font-black tracking-[0.3em] uppercase shadow-sm flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(exhibition.end_date).toLocaleDateString()}
          </span>
        </div>

        {/* Hover Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="max-w-md">
        <h5
          className={`${compact ? "text-xl" : "text-3xl"} font-serif mb-3 tracking-tight`}
        >
          {exhibition.title}
        </h5>

        <div className="flex items-center gap-4 mb-4">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
            Curated by{" "}
            <span className="text-slate-900">
              {exhibition.author?.name || "Unknown Artist"}
            </span>
          </p>
          {exhibition.artworks && (
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              {exhibition.artworks.length} pieces
            </p>
          )}
        </div>

        {!compact && (
          <p className="text-sm text-slate-500 leading-relaxed mb-6 italic">
            "{exhibition.description || "No description available"}"
          </p>
        )}

        <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest border-b border-black pb-1 group-hover:gap-4 transition-all">
          View Archive <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
