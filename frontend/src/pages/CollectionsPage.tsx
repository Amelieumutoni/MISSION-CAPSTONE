import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Grid3X3, Users, Calendar } from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    import.meta.env.VITE_BACKEND_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await ExhibitionService.getPublicExhibitions();
        // Dynamic logic: Filter for CLASSIFICATIONS that aren't archived
        const filtered = res.data.filter(
          (ex: Exhibition) =>
            ex.type === "CLASSIFICATION" && ex.status !== "ARCHIVED",
        );

        console.log(filtered);
        setCollections(filtered);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        toast.error("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) return <CollectionSkeleton />;

  return (
    <>
      {/* Editorial Header */}
      <header className="px-8 md:px-16 pt-44 pb-20 border-b border-slate-50">
        <div className="max-w-4xl">
          <h1 className="text-7xl md:text-9xl font-serif mb-10 tracking-tighter leading-[0.9]">
            Collections.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-light max-w-2xl border-l-2 border-slate-900 pl-8">
            Digital classifications of the Rwandan archive. Exploring the
            intersection of geometric ancestry and modern artisan craftsmanship.
          </p>
        </div>
      </header>

      {/* Dynamic Grid Section */}
      <section className="px-8 py-24 md:px-16">
        {collections.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-32">
            {collections.map((collection, index) => {
              const itemCount = collection.artworks?.length || 0;
              const banner = collection.banner_image?.startsWith("http")
                ? collection.banner_image
                : `${baseUrl}${collection.banner_image}`;

              return (
                <div
                  key={collection.exhibition_id}
                  className="group cursor-pointer"
                  onClick={() =>
                    navigate(`/exhibitions/${collection.exhibition_id}`)
                  }
                >
                  {/* Portrait-style framing */}
                  <div className="relative aspect-3/4 md:aspect-4/5 bg-slate-100 mb-10 overflow-hidden shadow-sm">
                    <img
                      src={banner}
                      alt={collection.title}
                      className="w-full h-full object-cover grayscale-30 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-in-out"
                    />

                    {/* Item Count Badge */}
                    <div className="absolute top-8 left-8">
                      <span className="bg-white/95 backdrop-blur-md py-3 px-5 text-[9px] font-black tracking-[0.3em] uppercase flex items-center gap-3 shadow-xl">
                        <Grid3X3 className="w-4 h-4 text-slate-400" />
                        {itemCount} {itemCount === 1 ? "Record" : "Records"}
                      </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-8 right-8">
                      <span className="bg-black/60 backdrop-blur-sm text-white py-2 px-4 text-[8px] font-bold tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(collection.start_date || "")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-10">
                    {/* Index Numbering */}
                    <span className="font-serif text-5xl text-slate-100 italic select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1">
                      <h2 className="text-4xl font-serif mb-4 tracking-tight group-hover:text-slate-600 transition-colors">
                        {collection.title}
                      </h2>

                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-6 font-bold flex items-center gap-2">
                        <span>
                          Curated by {collection.author?.name || "Independent"}
                        </span>
                        {itemCount > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {itemCount} pieces
                            </span>
                          </>
                        )}
                      </p>

                      <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-md font-light italic">
                        "
                        {collection.description ||
                          "Archival classification explore through digital medium."}
                        "
                      </p>

                      <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] border-b border-slate-900 pb-2 group-hover:gap-8 transition-all">
                        Open Classification <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </>
  );
}

/* --- Sub-components for Cleanliness --- */

function CollectionSkeleton() {
  return (
    <>
      <header className="px-8 md:px-16 pt-44 pb-20 border-b border-slate-50">
        <div className="max-w-4xl space-y-6">
          <Skeleton className="h-24 w-2/3" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </header>
      <section className="px-8 py-24 md:px-16 grid md:grid-cols-2 gap-32">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-10">
            <Skeleton className="aspect-4/5 w-full" />
            <div className="flex gap-10">
              <Skeleton className="w-16 h-16" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32 border-2 border-dashed border-slate-100 grayscale">
      <Grid3X3 className="w-16 h-16 mx-auto mb-6 text-slate-200" />
      <h2 className="text-2xl font-serif text-slate-300 mb-2">
        Archive Resting
      </h2>
      <p className="text-slate-400 text-sm tracking-widest uppercase text-[10px]">
        No active classifications found.
      </p>
    </div>
  );
}
