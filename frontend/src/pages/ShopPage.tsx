import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart,
  X,
  Search,
  Trash2,
  Plus,
  Minus,
  Lock,
  ChevronDown,
  Check,
  ChevronUp,
} from "lucide-react";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Artwork {
  artwork_id: number | string;
  title: string;
  price: string;
  main_image: string;
  technique: string;
  status: "AVAILABLE" | "SOLD" | "ARCHIVED";
}

// ── Hook: detect mobile (< 1024px) ──────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function ShopPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Mobile bottom-sheet: "peek" shows a compact bar, "open" expands fully
  const [sheetState, setSheetState] = useState<"peek" | "open">("peek");

  const categoryRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();
  const isMobile = useIsMobile();

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  const totalItems = useMemo(
    () =>
      cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0),
    [cart],
  );

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isMobile && cartOpen && sheetState === "open") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, cartOpen, sheetState]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const response = await ArtworkService.getArtworks();
        if (response?.data) {
          const availableOnly = response.data.filter(
            (w: Artwork) => w.status.toUpperCase() === "AVAILABLE",
          );
          setArtworks(availableOnly);
        }
      } catch (error) {
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };
    loadMarketplace();
  }, []);

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to complete your purchase", {
        description: "You need an account to handle shipping and security.",
        action: { label: "Login", onClick: () => navigate("/login") },
      });
      setCartOpen(false);
      navigate("/login");
      return;
    }
    navigate("/cart");
  };

  const categories = useMemo(() => {
    const techs = artworks
      .map((a) => a.technique)
      .filter(Boolean)
      .sort();
    return ["ALL", ...Array.from(new Set(techs))];
  }, [artworks]);

  const filteredArtworks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return artworks.filter((work) => {
      const matchesCategory =
        activeFilter === "ALL" || work.technique === activeFilter;
      const matchesSearch =
        !q ||
        work.title.toLowerCase().includes(q) ||
        work.technique.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [artworks, activeFilter, searchQuery]);

  const handleClearSearch = () => setSearchQuery("");
  const handleClearFilter = () => setActiveFilter("ALL");

  // ── Drag-to-dismiss on mobile sheet ─────────────────────────────────────
  const handleDragStart = (clientY: number) => {
    dragStartY.current = clientY;
  };
  const handleDragEnd = (clientY: number) => {
    if (dragStartY.current === null) return;
    const delta = clientY - dragStartY.current;
    if (delta > 60) {
      // dragged down significantly
      if (sheetState === "open") setSheetState("peek");
      else setCartOpen(false);
    } else if (delta < -40) {
      // dragged up
      setSheetState("open");
    }
    dragStartY.current = null;
  };

  // ── Mobile bottom sheet ──────────────────────────────────────────────────
  const MobileCartSheet = () => {
    if (!cartOpen && totalItems === 0) return null;

    // Show a tiny persistent tab when cart has items but sheet is closed
    if (!cartOpen) {
      return (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <button
            onClick={() => {
              setCartOpen(true);
              setSheetState("peek");
            }}
            className="w-full bg-slate-900 text-white flex items-center justify-between px-6 py-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                View Cart
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-bold">
                ${getCartTotal().toLocaleString()}
              </span>
              <span className="bg-white text-slate-900 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </div>
          </button>
        </div>
      );
    }

    const isOpen = sheetState === "open";

    return (
      <>
        {/* Backdrop — only when fully open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSheetState("peek")}
          />
        )}

        {/* Bottom sheet */}
        <div
          ref={sheetRef}
          className="fixed left-0 right-0 bottom-0 z-50 lg:hidden bg-white shadow-2xl flex flex-col"
          style={{
            height: isOpen ? "85dvh" : "auto",
            maxHeight: "85dvh",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            transition: "height 0.35s cubic-bezier(0.32,0.72,0,1)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          // Touch drag support
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
        >
          {/* Drag handle + header */}
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleDragStart(e.clientY)}
            onMouseUp={(e) => handleDragEnd(e.clientY)}
          >
            {/* Pill handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    isOpen ? setSheetState("peek") : setSheetState("open")
                  }
                  className="p-1.5 hover:bg-slate-100 transition-colors rounded"
                >
                  {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                <div>
                  <h2 className="text-base font-serif font-bold text-slate-900">
                    Your Cart
                  </h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {totalItems} {totalItems === 1 ? "Piece" : "Pieces"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[9px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Peek summary row (visible only in peek mode) */}
            {!isOpen && cart.length > 0 && (
              <div
                className="px-6 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none"
                onClick={() => setSheetState("open")}
              >
                {cart.slice(0, 4).map((item: any) => {
                  const src = item.main_image?.startsWith("http")
                    ? item.main_image
                    : `${baseUrl}${item.main_image}`;
                  return (
                    <div
                      key={item.artwork_id}
                      className="w-12 h-12 flex-shrink-0 border border-slate-200 overflow-hidden bg-slate-50"
                    >
                      <img
                        src={src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
                {cart.length > 4 && (
                  <div className="w-12 h-12 flex-shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-500">
                      +{cart.length - 4}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 ml-2">
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    ${getCartTotal().toLocaleString()}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    Tap to expand
                  </p>
                </div>
              </div>
            )}

            {/* Empty state in peek */}
            {!isOpen && cart.length === 0 && (
              <div className="px-6 py-4 text-center">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  Cart is empty
                </p>
              </div>
            )}
          </div>

          {/* Scrollable cart items — only in open state */}
          {isOpen && (
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 py-16">
                  <ShoppingCart size={40} strokeWidth={1} />
                  <p className="mt-3 text-[10px] uppercase font-bold tracking-widest">
                    Cart is empty
                  </p>
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
          )}

          {/* Checkout footer — always visible when open and cart has items */}
          {isOpen && cart.length > 0 && (
            <div className="flex-shrink-0 px-4 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Total
                </span>
                <span className="text-2xl font-mono font-bold">
                  ${getCartTotal().toLocaleString()}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-slate-900 py-6 rounded-none text-[10px] uppercase tracking-[0.2em] font-bold"
              >
                {!user && <Lock size={12} className="mr-2" />}
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 py-4">
            <div className="relative flex items-center gap-3 bg-slate-50 px-4 py-2.5 flex-1 max-w-md focus-within:ring-1 ring-slate-400 transition-all">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 w-full outline-none"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div ref={categoryRef} className="relative flex-shrink-0">
              <button
                onClick={() => setCategoryOpen((p) => !p)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-[10px] uppercase font-bold tracking-widest hover:bg-slate-50 transition-all min-w-[160px] justify-between"
              >
                <span className="truncate">
                  {activeFilter === "ALL" ? "All Techniques" : activeFilter}
                </span>
                <ChevronDown
                  size={13}
                  className={`flex-shrink-0 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 shadow-lg z-50 max-h-72 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveFilter(cat);
                        setCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold text-left transition-colors ${
                        activeFilter === cat
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">
                        {cat === "ALL" ? "All Techniques" : cat}
                      </span>
                      {activeFilter === cat && (
                        <Check size={11} className="flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(searchQuery || activeFilter !== "ALL") && (
              <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                {searchQuery && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-[9px] uppercase tracking-widest font-bold text-slate-600 max-w-[160px]">
                    <Search size={9} className="flex-shrink-0" />
                    <span className="truncate">{searchQuery}</span>
                    <button
                      onClick={handleClearSearch}
                      className="flex-shrink-0 hover:text-slate-900"
                    >
                      <X size={9} />
                    </button>
                  </span>
                )}
                {activeFilter !== "ALL" && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[9px] uppercase tracking-widest font-bold max-w-[160px]">
                    <span className="truncate">{activeFilter}</span>
                    <button
                      onClick={handleClearFilter}
                      className="flex-shrink-0 hover:text-slate-300"
                    >
                      <X size={9} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content (add bottom padding on mobile so cart bar doesn't overlap) ── */}
      <main
        className="max-w-7xl mx-auto px-4 lg:px-8 py-12"
        style={{
          paddingBottom: isMobile && totalItems > 0 ? "80px" : undefined,
        }}
      >
        <header className="mb-12">
          <h1 className="text-6xl font-serif tracking-tighter text-slate-900">
            Market.
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-4 font-bold">
            {loading
              ? "Loading collection..."
              : `${filteredArtworks.length} available for acquisition`}
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
                isMobile={isMobile}
                onBuy={() => {
                  addToCart(work);
                  toast.success(`${work.title} added to cart`);
                  // Auto-open sheet on mobile when first item added
                  if (isMobile) {
                    setCartOpen(true);
                    setSheetState("peek");
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-slate-200 space-y-4">
            <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              No pieces matching your selection
            </p>
            {(searchQuery || activeFilter !== "ALL") && (
              <button
                onClick={() => {
                  handleClearSearch();
                  handleClearFilter();
                }}
                className="text-[10px] uppercase tracking-widest font-bold text-slate-900 underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Desktop: sidebar cart ── */}
      {!isMobile && cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[450px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="border-b border-slate-100 flex flex-col py-6 gap-y-4">
              <div className="px-8 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif">Your Cart</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {totalItems} {totalItems === 1 ? "Piece" : "Pieces"}
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {cart.length > 0 && (
                <div className="px-8">
                  <button
                    onClick={clearCart}
                    className="text-[9px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <p className="mt-4 text-[10px] uppercase font-bold tracking-widest">
                    Cart is empty
                  </p>
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

            {cart.length > 0 && (
              <div className="p-8 bg-slate-50 border-t border-slate-200">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Total
                  </span>
                  <span className="text-3xl font-mono font-bold">
                    ${getCartTotal().toLocaleString()}
                  </span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-slate-900 py-8 rounded-none text-[10px] uppercase tracking-[0.2em] font-bold"
                >
                  {!user && <Lock size={12} className="mr-2" />}
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Desktop: floating cart button ── */}
      {!isMobile && totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-slate-900 text-white flex items-center gap-4 px-6 py-4 shadow-2xl hover:scale-105 transition-transform"
        >
          <ShoppingCart size={18} />
          <span className="text-xs font-bold font-mono">{totalItems}</span>
        </button>
      )}

      {/* ── Mobile: bottom sheet cart ── */}
      {isMobile && <MobileCartSheet />}
    </>
  );
}

// ── Shared sub-components (unchanged) ───────────────────────────────────────

function ShopCard({
  work,
  baseUrl,
  onBuy,
  isMobile,
}: {
  work: Artwork;
  baseUrl: string;
  onBuy: () => void;
  isMobile: boolean;
}) {
  const isSold = work.status === "SOLD";
  const imageSrc = work.main_image?.startsWith("http")
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
        ) : isMobile ? (
          /* On touch devices: always-visible button pinned to bottom of card */
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="w-full bg-slate-900 text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl active:bg-slate-700 transition-colors"
            >
              Add <ShoppingCart size={14} />
            </button>
          </div>
        ) : (
          /* On desktop: reveal on hover as before */
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
        <div className="space-y-1 min-w-0">
          <h3 className="font-serif text-lg leading-tight text-slate-900 group-hover:text-slate-600 transition-colors truncate">
            {work.title}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold truncate">
            {work.technique}
          </p>
        </div>
        <p className="font-mono text-sm font-bold text-slate-900 flex-shrink-0">
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
  const imageSrc = item.main_image?.startsWith("http")
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
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold truncate">
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
      <div className="h-4 bg-slate-200 w-2/3 animate-pulse" />
      <div className="h-4 bg-slate-100 w-1/4 animate-pulse" />
    </div>
  );
}
