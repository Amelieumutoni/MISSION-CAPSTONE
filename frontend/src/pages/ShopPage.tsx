import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  X,
  ChevronRight,
  Search,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface Artwork {
  artwork_id: number | string;
  title: string;
  price: string;
  main_image: string;
  technique: string;
  status: "AVAILABLE" | "SOLD" | "ARCHIVED";
}

export default function ShopPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();

  const baseUrl =
    import.meta.env.VITE_BACKEND_IMAGE_URL || "http://localhost:5000";

  const totalItems = useMemo(
    () => cart.reduce((sum, item: any) => sum + (item.quantity || 1), 0),
    [cart],
  );

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const response = await ArtworkService.getArtworks();
        if (response?.data) {
          const filtered = response.data.filter(
            (w: Artwork) => w.status !== "ARCHIVED",
          );
          setArtworks(filtered);
        }
      } catch (error) {
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };
    loadMarketplace();
  }, []);

  const categories = useMemo(() => {
    const techs = artworks.map((a) => a.technique);
    return ["ALL", ...Array.from(new Set(techs))];
  }, [artworks]);

  const filteredArtworks = artworks.filter((work) => {
    const matchesCategory =
      activeFilter === "ALL" || work.technique === activeFilter;
    const matchesSearch =
      work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.technique.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <nav className="top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 py-4">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 flex-1 max-w-md group focus-within:ring-2 ring-slate-900 transition-all">
              <Search
                size={16}
                className="text-slate-400 group-focus-within:text-slate-900"
              />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-slate-500 font-medium outline-none"
              />
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 text-[10px] uppercase font-bold tracking-widest whitespace-nowrap transition-all duration-300 ${
                    activeFilter === cat
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16 w-full">
        <header className="mb-12 lg:mb-16">
          <h1 className="text-5xl lg:text-7xl font-serif tracking-tighter text-slate-900">
            Market
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em] mt-4">
            {filteredArtworks.length} authenticated works
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredArtworks.map((work) => (
              <ShopCard
                key={work.artwork_id}
                work={work}
                baseUrl={baseUrl}
                onBuy={() => {
                  addToCart(work);
                  toast.success(`${work.title.toUpperCase()} ADDED`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 lg:py-40 bg-slate-50 border border-slate-200">
            <X className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              No pieces found
            </p>
          </div>
        )}
      </main>

      {/* FLOATING CART BUTTON */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white flex items-center gap-4 px-6 py-4 shadow-2xl hover:scale-105 transition-transform group"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} />
            <span className="font-mono text-sm font-bold">{totalItems}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            View Cart
          </span>
          <ChevronRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      )}

      {cartOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setCartOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="fixed right-0 top-0 h-full w-full lg:w-[480px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* 1. HEADER - Rendered only once */}
            <div className="p-6 lg:p-8 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Your Cart
                </h2>
                <div className="flex items-center gap-4">
                  {/* Clear All Button */}
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        clearCart();
                      }}
                      className="text-[9px] uppercase tracking-[0.2em] text-red-500 font-bold hover:text-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-2 hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </p>
            </div>

            {/* 2. BODY - Scrollable area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <ShoppingCart
                    className="text-slate-200 mb-6"
                    size={64}
                    strokeWidth={1}
                  />
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                    Your cart is empty
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-6 text-slate-900 text-[10px] uppercase tracking-widest font-bold border-b border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-500 transition-all"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                cart.map((item: any) => (
                  <CartItem
                    key={item.artwork_id}
                    item={item}
                    baseUrl={baseUrl}
                    onRemove={() => removeFromCart(item.artwork_id)}
                    onUpdateQuantity={(qty) =>
                      updateQuantity(item.artwork_id, qty)
                    }
                  />
                ))
              )}
            </div>

            {/* 3. FOOTER - Checkout section */}
            {cart.length > 0 && (
              <div className="p-6 lg:p-8 border-t border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                    Subtotal
                  </span>
                  <span className="font-mono text-2xl font-bold text-slate-900">
                    ${getCartTotal().toLocaleString()}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
                  Shipping and taxes calculated at checkout. All works include a
                  certificate of authenticity.
                </p>
                <Button className="w-full bg-slate-900 hover:bg-black text-white py-8 rounded-none text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function ShopCard({
  work,
  baseUrl,
  onBuy,
}: {
  work: Artwork;
  baseUrl: string;
  onBuy: () => void;
}) {
  const isSold = work.status === "SOLD";
  const imageSrc = work.main_image.startsWith("http")
    ? work.main_image
    : `${baseUrl}${work.main_image}`;

  return (
    <div className="group">
      <div className="aspect-[3/4] bg-slate-50 overflow-hidden relative border border-slate-200 mb-6 transition-all duration-700 hover:shadow-xl">
        <img
          src={imageSrc}
          alt={work.title}
          className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isSold ? "opacity-40 grayscale" : ""}`}
        />

        {isSold ? (
          <div className="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
            Sold
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="w-full bg-white text-slate-900 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              Add <ShoppingCart size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-4 px-1">
        <div className="space-y-1">
          <h3 className="font-serif text-lg leading-tight text-slate-900 group-hover:text-slate-600 transition-colors">
            {work.title}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {work.technique}
          </p>
        </div>
        <p className="font-mono text-sm font-bold text-slate-900">
          ${parseFloat(work.price).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function CartItem({
  item,
  baseUrl,
  onRemove,
  onUpdateQuantity,
}: {
  item: any;
  baseUrl: string;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const imageSrc = item.main_image.startsWith("http")
    ? item.main_image
    : `${baseUrl}${item.main_image}`;
  const quantity = item.quantity || 1;

  return (
    <div className="flex gap-4 bg-slate-50 p-4 border border-slate-200">
      <div className="w-24 h-24 bg-white overflow-hidden border border-slate-200 flex-shrink-0">
        <img
          src={imageSrc}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-serif text-sm font-bold text-slate-900 truncate">
              {item.title}
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">
              {item.technique}
            </p>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white border border-slate-200">
            <button
              onClick={() => onUpdateQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 hover:bg-slate-100 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="text-xs font-bold w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="p-1.5 hover:bg-slate-100 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <p className="font-mono text-sm font-bold text-slate-900">
            ${(parseFloat(item.price) * quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-slate-200 animate-pulse" />
      <div className="h-4 bg-slate-200 w-2/3" />
      <div className="h-4 bg-slate-100 w-1/4" />
    </div>
  );
}
