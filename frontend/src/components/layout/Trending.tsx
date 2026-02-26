import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Filter,
  SlidersHorizontal,
  ShoppingCart,
  Plus,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";

const TRENDING_WORKS = [
  {
    id: 1,
    title: "Heritage Agaseke",
    artist: "Marie Uwase",
    price: "120",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
    technique: "Traditional Craft",
  },
  {
    id: 2,
    title: "Modern Imigongo Panel",
    artist: "Samuel Bakame",
    price: "350",
    image:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
    technique: "Painting",
  },
  {
    id: 3,
    title: "Volcanic Clay Pot",
    artist: "Nyanza Collective",
    price: "210",
    image:
      "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=800",
    technique: "Ceramics",
  },
  {
    id: 4,
    title: "Hand-Woven Peace Basket",
    artist: "Divine Ineza",
    price: "85",
    image:
      "https://images.unsplash.com/photo-1616486788371-62d930495c44?auto=format&fit=crop&q=80&w=800",
    technique: "Weaving",
  },
  {
    id: 5,
    title: "Intore Shield Sculpture",
    artist: "Eric Kwizera",
    price: "520",
    image:
      "https://images.unsplash.com/photo-1513519247388-4e28265dd2bf?auto=format&fit=crop&q=80&w=800",
    technique: "Sculpture",
  },
];

interface Artwork {
  artwork_id: number | string;
  title: string;
  price: string;
  main_image: string;
  technique: string;
  status: "AVAILABLE" | "SOLD" | "ARCHIVED";
}

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "title-desc";
type StatusFilter = "ALL" | "AVAILABLE" | "SOLD";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Default",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "title-asc": "Title: A–Z",
  "title-desc": "Title: Z–A",
};

export default function MarketplacePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const response = await ArtworkService.getArtworks();
        if (response?.data && response.data.length > 0) {
          const activeWorks = response.data.filter(
            (w: Artwork) => w.status !== "ARCHIVED",
          );
          setArtworks(activeWorks.slice(0, 8));
        } else {
          const fallbacks = TRENDING_WORKS.map((w) => ({
            artwork_id: w.id,
            title: w.title,
            price: w.price,
            main_image: w.image,
            technique: w.technique,
            status: "AVAILABLE" as const,
          }));
          setArtworks(fallbacks);
        }
      } catch (error) {
        toast.error("ERROR CONNECTING TO ARCHIVE");
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  // All unique techniques from loaded artworks
  const allTechniques = useMemo(() => {
    const set = new Set(artworks.map((a) => a.technique).filter(Boolean));
    return Array.from(set).sort();
  }, [artworks]);

  // Toggle a technique filter
  const toggleTechnique = (t: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  // Derived: filtered + sorted artworks
  const displayed = useMemo(() => {
    let result = [...artworks];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // Technique filter
    if (selectedTechniques.length > 0) {
      result = result.filter((a) => selectedTechniques.includes(a.technique));
    }

    // Price range filter
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    if (min !== null) result = result.filter((a) => parseFloat(a.price) >= min);
    if (max !== null) result = result.filter((a) => parseFloat(a.price) <= max);

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [artworks, statusFilter, selectedTechniques, priceMin, priceMax, sortBy]);

  // Count active filters
  const activeFilterCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    selectedTechniques.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setSelectedTechniques([]);
    setPriceMin("");
    setPriceMax("");
  };

  const handleAddToCart = (work: Artwork) => {
    toast.success(`ADDED TO COLLECTION: ${work.title.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-8 pt-24 pb-12 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">
              Registry / Shop
            </p>
            <h1 className="text-5xl font-serif tracking-tight">Marketplace</h1>
          </div>

          <div className="flex gap-4 relative">
            {/* ── Filter dropdown ── */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => {
                  setFilterOpen((p) => !p);
                  setSortOpen(false);
                }}
                className="relative flex items-center gap-2 px-6 py-3 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all"
              >
                <Filter size={14} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 text-white text-[8px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-lg z-50 p-5 space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">
                      Status
                    </p>
                    <div className="flex gap-2">
                      {(["ALL", "AVAILABLE", "SOLD"] as StatusFilter[]).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all ${
                              statusFilter === s
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-slate-200 text-slate-500 hover:border-slate-400"
                            }`}
                          >
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">
                      Price Range ($)
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                      />
                      <span className="text-slate-300 text-xs">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Techniques */}
                  {allTechniques.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">
                        Technique
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {allTechniques.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleTechnique(t)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border transition-all ${
                              selectedTechniques.includes(t)
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-slate-200 text-slate-500 hover:border-slate-400"
                            }`}
                          >
                            {selectedTechniques.includes(t) && (
                              <Check size={9} />
                            )}
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-[9px] uppercase tracking-widest font-bold text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all"
                    >
                      <X size={11} /> Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Sort dropdown ── */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => {
                  setSortOpen((p) => !p);
                  setFilterOpen(false);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-all"
              >
                <SlidersHorizontal size={14} />
                Sort
                <ChevronDown
                  size={12}
                  className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 shadow-lg z-50 overflow-hidden">
                  {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setSortBy(value);
                          setSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-left transition-colors ${
                          sortBy === value
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                        {sortBy === value && <Check size={11} />}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
              Active:
            </span>
            {statusFilter !== "ALL" && (
              <FilterPill
                label={statusFilter}
                onRemove={() => setStatusFilter("ALL")}
              />
            )}
            {selectedTechniques.map((t) => (
              <FilterPill
                key={t}
                label={t}
                onRemove={() => toggleTechnique(t)}
              />
            ))}
            {priceMin && (
              <FilterPill
                label={`Min $${priceMin}`}
                onRemove={() => setPriceMin("")}
              />
            )}
            {priceMax && (
              <FilterPill
                label={`Max $${priceMax}`}
                onRemove={() => setPriceMax("")}
              />
            )}
            {sortBy !== "default" && (
              <FilterPill
                label={SORT_LABELS[sortBy]}
                onRemove={() => setSortBy("default")}
              />
            )}
          </div>
        )}
      </header>

      <main className="px-8 py-12">
        {/* Results count */}
        {!loading && (
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-8">
            {displayed.length} {displayed.length === 1 ? "work" : "works"} found
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : displayed.length > 0 ? (
            displayed.map((work) => (
              <ArtworkCard
                key={work.artwork_id}
                work={work}
                baseUrl={baseUrl}
                onBuy={() => handleAddToCart(work)}
              />
            ))
          ) : (
            <div className="col-span-full py-24 flex flex-col items-center gap-4 text-slate-400">
              <p className="text-4xl">🎨</p>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold">
                No works match your filters
              </p>
              <button
                onClick={clearFilters}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-900 underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {!loading && (
          <div className="mt-24 flex justify-center">
            <button
              onClick={() => navigate("/shop")}
              className="group flex flex-col items-center gap-4 hover:text-slate-500 transition-all"
            >
              <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                <Plus size={24} />
              </div>
              <span className="text-[11px] uppercase tracking-[0.4em] font-bold">
                Explore Full Collection
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 border border-slate-200 text-[9px] uppercase tracking-widest font-bold text-slate-600">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-slate-900 transition-colors"
      >
        <X size={9} />
      </button>
    </span>
  );
}

function ArtworkCard({
  work,
  baseUrl,
  onBuy,
}: {
  work: Artwork;
  baseUrl: string;
  onBuy: () => void;
}) {
  const imageSrc = work.main_image.startsWith("http")
    ? work.main_image
    : `${baseUrl}${work.main_image}`;
  const isSold = work.status === "SOLD";

  return (
    <div className="group cursor-pointer">
      <div className="aspect-[3/4] bg-slate-50 mb-6 overflow-hidden relative border border-slate-100">
        <img
          src={imageSrc}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        {isSold && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-tighter z-10">
            SOLD
          </div>
        )}
        {!isSold && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="w-full bg-white py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-900 hover:text-white transition-colors"
            >
              Buy Now <ShoppingCart size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-serif text-lg tracking-tight">{work.title}</h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            {work.technique}
          </p>
        </div>
        <p className="font-mono text-xs font-bold text-slate-900">
          ${parseFloat(work.price).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-slate-50 animate-pulse border border-slate-100" />
      <div className="h-4 bg-slate-50 animate-pulse w-3/4" />
    </div>
  );
}
