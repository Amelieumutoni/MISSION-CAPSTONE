import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Grid3X3,
  Share2,
  Layers,
  Info,
  History,
} from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ClassificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    const fetchClassification = async () => {
      try {
        if (!id) return;
        const res = await ExhibitionService.getExhibitionById(id);
        setData(res.data);
      } catch (err) {
        toast.error("Classification record not found");
        navigate("/collections");
      } finally {
        setLoading(false);
      }
    };
    fetchClassification();
  }, [id, navigate]);

  if (loading) return <ClassificationSkeleton />;
  if (!data) return null;

  const banner = data.banner_image?.startsWith("http")
    ? data.banner_image
    : `${baseUrl}${data.banner_image}`;

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-slate-900">
      {/* Top Navigation */}
      <nav className="w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Index
        </button>
        <div className="flex items-center gap-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block">
            Archival Ref: {data.exhibition_id}
          </span>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-40">
        {/* Classification Header */}
        <section className="px-8 md:px-20 mb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em]">
                      Systematic Classification
                    </span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-serif tracking-tighter leading-none">
                    {data.title}
                  </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 border-t border-slate-200 pt-10">
                  <Stat
                    label="Curator"
                    value={data.author?.name || "Unknown"}
                  />
                  <Stat
                    label="Records"
                    value={`${data.artworks?.length || 0} Items`}
                  />
                  <Stat
                    label="Established"
                    value={new Date(data.start_date || "")
                      .getFullYear()
                      .toString()}
                  />
                </div>

                <div className="relative pl-8 border-l border-slate-200">
                  <p className="text-xl text-slate-500 font-light leading-relaxed italic">
                    "
                    {data.description ||
                      "No archival description provided for this classification."}
                    "
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-100 overflow-hidden border">
                <img
                  src={banner}
                  alt=""
                  className="w-full h-full object-cover grayscale-[0.2]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* The Catalog Grid */}
        <section className="px-8 md:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Grid3X3 className="w-5 h-5 text-slate-300" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">
                Index of Cataloged Records
              </h2>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {data.artworks && data.artworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">
                {data.artworks.map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#FCFCFC] group">
                    <div className="aspect-square overflow-hidden mb-6 relative">
                      <img
                        src={
                          item.main_image?.startsWith("http")
                            ? item.main_image
                            : `${baseUrl}${item.main_image}`
                        }
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-8 h-8 flex items-center justify-center text-[10px] font-mono shadow-sm">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                        {item.description ||
                          "Inventory record lacking description"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 text-slate-300">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest">
                  Awaiting digital transcription
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Meta */}
      <footer className="border-t border-slate-100 py-20 px-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Info className="w-5 h-5 mx-auto text-slate-200" />
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
            This classification is part of the Rwandan digital archive. All
            records are verified by the primary curator.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="text-sm font-serif italic text-slate-800">{value}</p>
    </div>
  );
}

function ClassificationSkeleton() {
  return (
    <div className="p-20 space-y-20 animate-pulse">
      <div className="flex gap-20">
        <div className="flex-1 space-y-10">
          <div className="h-20 bg-slate-100 w-3/4" />
          <div className="h-40 bg-slate-50 w-full" />
        </div>
        <div className="w-1/3 aspect-[3/4] bg-slate-100" />
      </div>
      <div className="grid grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-slate-50" />
        ))}
      </div>
    </div>
  );
}
