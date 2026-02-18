import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { Filter, Grid3X3, Maximize2, Loader2, ChevronDown } from "lucide-react";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Artwork {
  artwork_id: number | string;
  title: string;
  main_image: string;
  technique: string;
  year_created: string;
  artist?: { name: string };
  status: string;
}

export default function ArtworksPage() {
  const [allWorks, setAllWorks] = useState<Artwork[]>([]);
  const [activeMedium, setActiveMedium] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const baseUrl =
    import.meta.env.VITE_BACKEND_IMAGE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const response = await ArtworkService.getArtworks();
        if (response?.data) {
          const archived = response.data.filter(
            (work: Artwork) => work.status === "ARCHIVED",
          );
          setAllWorks(archived);
        }
      } catch (error) {
        toast.error("Could not synchronize with the archive.");
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, []);

  // 1. EXTRACT UNIQUE MEDIUMS FOR FILTER
  const categories = useMemo(() => {
    const types = allWorks.map((w) => w.technique);
    return ["All", ...Array.from(new Set(types))];
  }, [allWorks]);

  // 2. FILTERED DATA
  const filteredWorks = useMemo(() => {
    if (activeMedium === "All") return allWorks;
    return allWorks.filter((w) => w.technique === activeMedium);
  }, [activeMedium, allWorks]);

  return (
    <>
      <header className="px-8 md:px-16 pt-44 pb-12 border-b border-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-serif tracking-tighter mb-4">
              The Archive.
            </h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.5em] font-black">
              Cataloging {filteredWorks.length} Historically Authenticated
              Plates
            </p>
          </div>

          <div className="flex gap-8 pb-2">
            {/* FILTER DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b border-slate-900 pb-1 outline-none">
                <Filter className="w-3 h-3" />{" "}
                {activeMedium === "All" ? "Filter By Medium" : activeMedium}
                <ChevronDown size={10} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-none border-slate-200 min-w-[200px]"
              >
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => setActiveMedium(cat)}
                    className="text-[10px] uppercase tracking-widest font-bold py-3 cursor-pointer"
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-not-allowed">
              <Grid3X3 className="w-3 h-3" /> Sort: Chronological
            </button>
          </div>
        </div>
      </header>

      <section className="px-8 md:px-16 py-20">
        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-slate-200" size={40} />
          </div>
        ) : filteredWorks.length > 0 ? (
          /* FIXED GRID - 3 columns, same height */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredWorks.map((work) => {
              const imageSrc = work.main_image.startsWith("http")
                ? work.main_image
                : `${baseUrl}${work.main_image}`;

              return (
                <div key={work.artwork_id} className="group cursor-crosshair">
                  <Link to={`/archives/${work.artwork_id}`} className="block">
                    {/* Image Container with Fixed Aspect Ratio */}
                    <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={imageSrc}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white w-6 h-6" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="border-l border-slate-200 pl-6">
                      <h3 className="font-serif text-2xl text-slate-900 mb-1 leading-none">
                        {work.title}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                        {work.author?.name || "Unknown Artist"}
                      </p>
                      <div className="flex gap-4">
                        <span className="text-[9px] text-slate-400 uppercase tracking-tighter">
                          {work.technique}
                        </span>
                        <span className="text-[9px] text-slate-400 font-serif italic">
                          {work.year_created}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-slate-200">
            <p className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              No results found for "{activeMedium}"
            </p>
            <button
              onClick={() => setActiveMedium("All")}
              className="mt-4 text-[9px] uppercase font-bold border-b border-slate-900"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}
