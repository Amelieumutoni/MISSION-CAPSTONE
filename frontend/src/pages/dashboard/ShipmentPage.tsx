import React, { useEffect, useState } from "react";
import {
  getArtistShipments,
  fulfillOrder,
} from "@/api/services/shipmentService";
import { toast, Toaster } from "sonner";
import {
  Truck,
  Search,
  PackageCheck,
  PackageSearch,
  Box,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Shipment {
  shipment_id: number;
  order_id: number;
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  carrier: string | null;
  tracking_number: string | null;
  createdAt: string;
  Order: {
    buyer: {
      user_id: number;
      name: string;
      email: string;
    };
    shipping_address: string;
    items: {
      artwork: {
        artwork_id: number;
        title: string;
        main_image: string;
        price: number;
      };
      quantity: number;
      price_at_purchase: number;
    }[];
  };
}

export default function ArtistShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fulfillment form state
  const [carrierInput, setCarrierInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await getArtistShipments();
      setShipments(res?.data || []);
    } catch (err) {
      toast.error("Failed to load shipments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setCarrierInput(shipment.carrier || "");
    setTrackingInput(shipment.tracking_number || "");
    setIsDrawerOpen(true);
  };

  const handleFulfillment = async () => {
    if (!selectedShipment) return;
    if (!carrierInput.trim() || !trackingInput.trim()) {
      toast.warning("Carrier and tracking number are required.");
      return;
    }

    setSubmitting(true);
    try {
      await fulfillOrder(selectedShipment.order_id, {
        carrier: carrierInput,
        tracking_number: trackingInput,
      });
      toast.success("Shipment fulfilled. Buyer notified.");
      await fetchShipments(); // refresh list
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error("Failed to update shipment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter shipments based on search term
  const filteredShipments = shipments.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.order_id.toString().includes(term) ||
      s.Order.buyer.name.toLowerCase().includes(term) ||
      s.status.toLowerCase().includes(term) ||
      s.Order.items.some((item) =>
        item.artwork.title.toLowerCase().includes(term),
      )
    );
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans uppercase tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white">
            Logistics Manifest
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            Fulfillment & Distribution Node
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by order, buyer, artwork..."
            className="pl-10 rounded-none border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-xs font-sans focus-visible:ring-0 focus-visible:border-slate-900 dark:focus-visible:border-white h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Units"
          value={shipments.length}
          icon={<Box className="w-4 h-4" />}
        />
        <StatCard
          label="In Transit"
          value={shipments.filter((s) => s.status === "SHIPPED").length}
          icon={<Truck className="w-4 h-4" />}
          valueClassName="text-blue-500"
        />
        <StatCard
          label="Pending Action"
          value={shipments.filter((s) => s.status === "PENDING").length}
          icon={<PackageSearch className="w-4 h-4" />}
          valueClassName="text-amber-500"
        />
        <StatCard
          label="Delivered"
          value={shipments.filter((s) => s.status === "DELIVERED").length}
          icon={<PackageCheck className="w-4 h-4" />}
          valueClassName="text-green-500"
        />
      </div>

      {/* Shipments Table */}
      <div className="border border-slate-200 dark:border-white/10 overflow-x-auto bg-transparent">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              {["Order Ref", "Collector", "Carrier", "Status", "Date", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 md:px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-20 text-center animate-pulse font-mono text-xs uppercase"
                >
                  Loading manifest...
                </td>
              </tr>
            ) : paginatedShipments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-20 text-center font-mono text-xs text-slate-400 uppercase"
                >
                  No shipments found.
                </td>
              </tr>
            ) : (
              paginatedShipments.map((s) => (
                <tr
                  key={s.shipment_id}
                  className="hover:bg-slate-500/5 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #ORD-{s.order_id}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                      {s.Order.buyer.name}
                    </p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">
                      {s.Order.buyer.email}
                    </p>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs font-mono uppercase text-slate-600 dark:text-slate-400">
                    {s.carrier || "—"}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs font-mono text-slate-400 uppercase">
                    {format(new Date(s.createdAt), "dd.MM.yy")}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenDrawer(s)}
                      className="px-4 py-1.5 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all whitespace-nowrap"
                    >
                      Action Center
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-none border-slate-200 dark:border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-none border-slate-200 dark:border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Shipment Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/10 w-full sm:max-w-md p-0 rounded-none overflow-y-auto">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-zinc-600 mb-2">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase">
                  Route Optimization
                </span>
              </div>
              <SheetTitle className="text-xl font-black uppercase tracking-tighter">
                Shipment #{selectedShipment?.order_id}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Destination */}
              <LogSection title="Destination Log">
                <DetailRow
                  label="Shipping Address"
                  value={
                    selectedShipment?.Order.shipping_address || "Not provided"
                  }
                />
              </LogSection>

              {/* Items Sold */}
              <LogSection title="Items Sold">
                {selectedShipment?.Order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-transparent border-b border-zinc-100 dark:border-white/5 last:border-0"
                  >
                    <div className="flex gap-3">
                      {item.artwork.main_image && (
                        <img
                          src={`/image${item.artwork.main_image}`}
                          alt={item.artwork.title}
                          className="w-12 h-12 object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase truncate">
                          {item.artwork.title}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500">
                          Qty: {item.quantity} × ${item.price_at_purchase}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </LogSection>

              {/* Tracking Information */}
              <LogSection title="Tracking Data">
                {selectedShipment?.status === "PENDING" ? (
                  // Editable form for pending shipments
                  <div className="space-y-3 p-4 bg-white dark:bg-transparent">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                        Carrier
                      </label>
                      <Input
                        placeholder="e.g., DHL, FedEx"
                        value={carrierInput}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="rounded-none border-slate-200 dark:border-white/10 text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">
                        Tracking Number
                      </label>
                      <Input
                        placeholder="Enter tracking number"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="rounded-none border-slate-200 dark:border-white/10 text-xs h-9"
                      />
                    </div>
                  </div>
                ) : (
                  // Read-only display for shipped/delivered
                  <>
                    <DetailRow
                      label="Carrier"
                      value={selectedShipment?.carrier || "—"}
                    />
                    <DetailRow
                      label="Tracking ID"
                      value={selectedShipment?.tracking_number || "—"}
                    />
                  </>
                )}
              </LogSection>
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
              {selectedShipment?.status === "PENDING" ? (
                <Button
                  onClick={handleFulfillment}
                  disabled={submitting}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-none"
                >
                  {submitting ? "Processing..." : "Confirm Fulfillment"}
                </Button>
              ) : (
                <div className="text-center text-xs font-mono text-slate-400 uppercase py-2">
                  Shipment {selectedShipment?.status.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ===== Helper Components =====

const StatCard = ({
  label,
  value,
  icon,
  valueClassName = "text-slate-900 dark:text-white",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="bg-white/80 border border-slate-200 dark:border-white/10 dark:bg-white/5 p-4 md:p-6 flex items-center justify-between group transition-colors hover:bg-white dark:hover:bg-white/[0.08]">
    <div>
      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`text-base md:text-xl font-black tracking-tighter ${valueClassName}`}
      >
        {value}
      </p>
    </div>
    <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
      {icon}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    SHIPPED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    DELIVERED: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  const s = status?.toUpperCase();
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[9px] font-black font-mono uppercase border tracking-tighter ${
        styles[s] || "border-slate-200 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
};

const LogSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
      {title}
    </h4>
    <div className="space-y-px bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
      {children}
    </div>
  </section>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center p-4 bg-white dark:bg-transparent">
    <span className="text-[9px] font-mono text-slate-400 uppercase">
      {label}
    </span>
    <span className="text-[10px] font-bold uppercase text-slate-900 dark:text-white text-right max-w-[200px] break-words">
      {value}
    </span>
  </div>
);
