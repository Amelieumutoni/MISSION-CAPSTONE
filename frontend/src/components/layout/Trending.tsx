import React, { useEffect, useState } from "react";
import { Filter, SlidersHorizontal, ShoppingCart, Plus } from "lucide-react";
import { useNavigate } from "react-router"; // Assuming you use react-router
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";

// Static Fallback Data
const TRENDING_WORKS = [
  {
    id: 1,
    title: "Heritage Agaseke",
    artist: "Marie Uwase",
    price: "120",
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Modern Imigongo Panel",
    artist: "Samuel Bakame",
    price: "350",
    image:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Volcanic Clay Pot",
    artist: "Nyanza Collective",
    price: "210",
    image:
      "https://images.unsplash.com/photo-1565193998946-247f1ecb9ca9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Hand-Woven Peace Basket",
    artist: "Divine Ineza",
    price: "85",
    image:
      "https://images.unsplash.com/photo-1616486788371-62d930495c44?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Intore Shield Sculpture",
    artist: "Eric Kwizera",
    price: "520",
    image:
      "https://images.unsplash.com/photo-1513519247388-4e28265dd2bf?auto=format&fit=crop&q=80&w=800",
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

export default function MarketplacePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const response = await ArtworkService.getArtworks();

        if (response?.data && response.data.length > 0) {
          // FILTER: Remove ARCHIVED items immediately
          const activeWorks = response.data.filter(
            (w: Artwork) => w.status !== "ARCHIVED",
          );
          setArtworks(activeWorks.slice(0, 8)); // Limit to 8 for the preview
        } else {
          // Fallback to static data
          const fallbacks = TRENDING_WORKS.map((w) => ({
            artwork_id: w.id,
            title: w.title,
            price: w.price,
            main_image: w.image,
            technique: "Traditional Craft",
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
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-all">
              <SlidersHorizontal size={14} /> Sort
            </button>
          </div>
        </div>
      </header>

      <main className="px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {loading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : artworks.map((work) => (
                <ArtworkCard
                  key={work.artwork_id}
                  work={work}
                  baseUrl={baseUrl}
                  onBuy={() => handleAddToCart(work)}
                />
              ))}
        </div>

        {/* DIRECT TO MARKET BUTTON */}
        {!loading && (
          <div className="mt-24 flex justify-center">
            <button
              onClick={() => navigate("/shop")} // Change to your actual buying route
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
