import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Share2, Info, Loader2 } from "lucide-react";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";

// Updated Interface to match your Service/Backend
interface Artwork {
  artwork_id: number | string;
  title: string;
  main_image: string;
  technique: string;
  dimensions: string;
  year_created: string;
  description: string;
  status: string;
  createdAt: string;
  author?: {
    name: string;
    user_id: string | number;
    status: string;
  };
}

export default function ArtworkDetailPage() {
  const { id } = useParams();
  const [work, setWork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    const fetchWork = async () => {
      try {
        if (!id) return;

        const response = await ArtworkService.getArtworkById(Number(id));

        const artworkData = response?.data || response;

        if (artworkData) {
          setWork(artworkData);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        // This catches the "Inactive artist" error thrown in your service
        toast.error(error.message || "Plate retrieval failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchWork();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-slate-200" size={40} />
        <span className="text-[10px] uppercase tracking-[0.5em] text-slate-400 font-bold">
          Synchronizing Archive
        </span>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <p className="font-serif text-2xl">Plate Not Found</p>
        <Link
          to="/archives"
          className="text-[10px] uppercase font-bold border-b border-black pb-1"
        >
          Return to Archive
        </Link>
      </div>
    );
  }

  // Handle image path correctly
  const imageSrc = work.main_image?.startsWith("http")
    ? work.main_image
    : `${baseUrl}${work.main_image}`;

  return (
    <div className="pt-32 px-8 md:px-16 lg:px-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">
        <Link to="/archives" className="hover:text-black transition-colors">
          Archives
        </Link>
        <span className="text-slate-200">/</span>
        <Link
          to={`/artists/${work.author?.user_id}`}
          className="hover:text-black transition-colors"
        >
          {work.author?.name || "Unknown Artist"}
        </Link>
        <span className="text-slate-200">/</span>
        <span className="text-slate-900">{work.title}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-20 pb-32">
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-100 p-4 md:p-12">
            <img
              src={imageSrc}
              className="w-full h-auto object-contain max-h-[80vh]"
              alt={work.title}
            />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tighter leading-tight">
              {work.title}
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              {work.description}
            </p>
          </div>

          <div className="space-y-0 border-t border-slate-200">
            <DetailRow
              label="Classification ID"
              value={`CF-${String(work.artwork_id).padStart(4, "0").toUpperCase()}`}
            />
            <DetailRow
              label="Artisan"
              value={work.author?.name || "Unknown"}
              isLink
              href={`/artists/${work.author?.user_id}`}
            />
            <DetailRow label="Technique" value={work.technique} />
            <DetailRow
              label="Dimensions"
              value={work.dimensions || "Dimensions Variable"}
            />
            <DetailRow
              label="Origin Date"
              value={
                work.createdAt ? new Date(work.createdAt).toDateString() : "N/A"
              }
            />
            <DetailRow label="Status" value={work.status} />
          </div>

          <div className="mt-12 flex gap-4">
            <button className="flex-1 bg-slate-900 text-white py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all">
              Request Archival Access
            </button>
            <button className="w-20 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 flex items-start gap-4 p-6 bg-slate-50/50 border border-slate-100">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
              Permanent digital classification. Authenticity verified by
              CraftFolio Rwanda • Kigali Digital Archive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component DetailRow remains the same
function DetailRow({ label, value, isLink, href }: any) {
  return (
    <div className="flex justify-between items-center py-6 border-b border-slate-100">
      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
        {label}
      </span>
      {isLink ? (
        <Link
          to={href as string}
          className="text-[11px] uppercase tracking-widest font-bold border-b border-slate-900 hover:text-red-600 hover:border-red-600 transition-all"
        >
          {value}
        </Link>
      ) : (
        <span className="text-[11px] uppercase tracking-widest font-bold text-slate-900">
          {value}
        </span>
      )}
    </div>
  );
}
