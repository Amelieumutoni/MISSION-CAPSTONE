import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate, useSearchParams } from "react-router";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderService } from "@/api/services/orderService";
import { toast, Toaster } from "sonner";

const IMAGE_BASE = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const total = getCartTotal();

  // ── STRIPE RETURN HANDLER ──────────────────────────────────────────────────
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");

    if (!sessionId && !orderId) return;

    const handleStripeReturn = async () => {
      if (sessionId) {
        if (cart.length > 0) {
          clearCart();
          toast.success("Purchase complete!", {
            description: "Your order is confirmed. Redirecting...",
            duration: 3000,
          });
          setTimeout(() => navigate("/buyer", { replace: true }), 2500);
        }
      }

      if (orderId) {
        try {
          await OrderService.cancelOrder(orderId);
          toast.error("Payment Deferred", {
            description: "The transaction was cancelled. Inventory released.",
          });
        } catch (err) {
          console.error("Cancel failed", err);
        } finally {
          navigate("/cart", { replace: true });
        }
      }
    };

    handleStripeReturn();
  }, [searchParams, navigate, cart.length, clearCart]);

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      return "Shipping address is required";
    }
    if (address.trim().length < 5) {
      return "Please enter a valid address";
    }
    return "";
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Validate shipping address
    const error = validateAddress(shippingAddress);
    if (error) {
      setAddressError(error);
      toast.error("Shipping address required", {
        description: "Please enter your shipping address to continue.",
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          artwork_id: item.artwork_id,
          quantity: item.quantity || 1,
        })),
        shipping_address: shippingAddress.trim(),
      };

      const response = await OrderService.createOrder(payload);

      if (response.success && response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Checkout initialization failed",
      );
      setIsCheckingOut(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress(e.target.value);
    if (addressError) {
      setAddressError(validateAddress(e.target.value));
    }
  };

  if (searchParams.get("session_id")) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
        <Toaster position="top-right" richColors />
        <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
        <h1 className="text-2xl font-serif font-bold dark:text-white">
          Payment Verified
        </h1>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">
          Redirecting to your dashboard…
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <Toaster position="top-right" richColors />
        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
          <ShoppingBag size={40} strokeWidth={1} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif italic text-slate-400 dark:text-slate-600">
            Your bag is empty
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Discover unique Rwandan artistry
          </p>
        </div>
        <Button
          onClick={() => navigate("/shop")}
          className="rounded-none bg-slate-900 dark:bg-white dark:text-black px-10 py-6 uppercase tracking-widest text-[10px] font-bold hover:bg-black transition-all"
        >
          Explore Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Gallery
          </button>
          <h1 className="text-5xl font-serif font-bold tracking-tighter dark:text-white">
            Shopping Bag
          </h1>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          {cart.length} {cart.length === 1 ? "Artifact" : "Artifacts"} Selected
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* ── ITEM LIST ── */}
        <div className="lg:col-span-8 space-y-10">
          {cart.map((item) => (
            <div
              key={item.artwork_id}
              className="flex flex-col sm:flex-row gap-8 border-b border-slate-100 dark:border-white/5 pb-10 group"
            >
              <div className="w-full sm:w-40 h-52 bg-slate-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                <img
                  src={`${IMAGE_BASE}${item.main_image}`}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-serif font-bold dark:text-white">
                      {item.title}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.artwork_id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-2 font-mono">
                    ID: {item.artwork_id} // {item.technique}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-8">
                  {/* Quantity control */}
                  <div className="flex items-center border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.artwork_id,
                          Math.max(1, (item.quantity || 1) - 1),
                        )
                      }
                      className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-mono text-sm dark:text-white">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.artwork_id,
                          (item.quantity || 1) + 1,
                        )
                      }
                      className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="font-serif font-bold text-2xl dark:text-white">
                    $
                    {(
                      parseFloat(item.price) * (item.quantity || 1)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="lg:col-span-4">
          <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-10 sticky top-32">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
              Order Summary
            </h2>

            {/* Shipping Address Input */}
            <div className="mb-8 space-y-3">
              <Label
                htmlFor="shipping-address"
                className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2"
              >
                <MapPin size={12} className="text-slate-400" />
                Shipping Address
              </Label>
              <div className="space-y-2">
                <Input
                  id="shipping-address"
                  placeholder="Enter your full address (e.g., Kigali, Rwanda)"
                  value={shippingAddress}
                  onChange={handleAddressChange}
                  className={`rounded-none border ${
                    addressError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-slate-200 dark:border-white/10 focus-visible:ring-slate-500"
                  } bg-white dark:bg-white/5 text-sm py-6`}
                />
                {addressError && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {addressError}
                  </p>
                )}
                <p className="text-[8px] text-slate-400 italic">
                  Your artwork will be shipped to this address upon purchase
                </p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between text-[11px] uppercase tracking-widest">
                <span className="text-slate-500">Subtotal</span>
                <span className="dark:text-white">
                  ${total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-widest">
                <span className="text-slate-500">Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Complimentary
                </span>
              </div>
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex justify-between items-baseline">
                <span className="font-serif font-bold text-xl dark:text-white">
                  Total
                </span>
                <span className="font-serif font-bold text-4xl dark:text-white">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full h-16 rounded-none bg-slate-900 text-white dark:bg-white dark:text-black uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-black dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
            >
              {isCheckingOut ? (
                <span className="animate-pulse">Redirecting to Stripe…</span>
              ) : (
                <>
                  <CreditCard size={16} /> Secure Checkout
                </>
              )}
            </Button>

            <p className="mt-6 text-[9px] text-slate-400 text-center leading-relaxed uppercase tracking-tighter">
              By proceeding, you agree to the{" "}
              <span className="underline cursor-pointer">
                Terms of Artisan Acquisition
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
