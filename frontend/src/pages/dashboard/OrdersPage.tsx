import React, { useEffect, useState } from "react";
import AdminService, { type Order } from "@/api/services/adminServices";
import { toast, Toaster } from "sonner";
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Terminal,
  ReceiptText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getAllOrders();
      setOrders(res?.data || []);
    } catch (err) {
      toast.error("LEDGER_SYNC_FAILURE: UNAUTHORIZED_OR_NETWORK_ERR");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.order_id.toString().includes(search) ||
      order.buyer.name.toLowerCase().includes(search) ||
      order.buyer.email.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalRevenue = orders.reduce(
    (acc, o) => acc + Number(o.total_price || 0),
    0,
  );

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8 bg-transparent transition-colors duration-300">
      <Toaster richColors theme="dark" />

      {/* 1. ARCHITECTURAL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-white/10 pb-8">
        <div>
          <h1 className="text-3xl font-sans uppercase tracking-tighter flex items-center gap-3 text-slate-900 dark:text-white">
            Order Ledger
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-2">
            Transaction analysis
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="search by email / name..."
            className="pl-10 rounded-none border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-[11px] font-sans focus-visible:ring-0 focus-visible:border-slate-900 dark:focus-visible:border-white h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* 2. TRANSACTION SUMMARY GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6  gap-[1px]">
        <OrderStatBox
          label="Volume"
          value={orders.length}
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <OrderStatBox
          label="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          color="text-blue-500"
        />
        <OrderStatBox
          label="Paid"
          value={orders.filter((o) => o.status === "PAID").length}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <OrderStatBox
          label="Pending"
          value={orders.filter((o) => o.status === "PENDING").length}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* 3. CORE TABLE LEDGER */}
      <div className="border border-slate-200 dark:border-white/10 rounded-none overflow-hidden bg-transparent backdrop-blur-[2px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                {[
                  "Ref_ID",
                  "Collector",
                  "Value",
                  "Status",
                  "Timestamp",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 animate-pulse font-mono text-xs uppercase tracking-tighter"
                  >
                    Fetching_Transaction_Data...
                  </td>
                </tr>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-slate-500/5 dark:hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      #ID-{order.order_id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-bold uppercase text-slate-900 dark:text-white">
                        {order.buyer.name}
                      </p>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">
                        {order.buyer.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-black text-[12px] text-slate-900 dark:text-white">
                      ${Number(order.total_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-slate-400 uppercase">
                      {order.created_at
                        ? format(new Date(order.created_at), "dd.MM.yyyy")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDrawerOpen(true);
                        }}
                        className="px-4 py-1.5 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center font-mono text-[10px] text-slate-400 uppercase italic"
                  >
                    ZERO_TRANSACTIONS_LOGGED
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. FOOTER / PAGINATION */}
      {!loading && (
        <div className="flex items-center justify-between px-1 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            ENTRY {startIndex + 1}—
            {Math.min(startIndex + itemsPerPage, filteredOrders.length)} /{" "}
            {filteredOrders.length}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase hover:bg-slate-900 hover:text-white dark:hover:bg-white/10 disabled:opacity-20 transition-all text-slate-900 dark:text-white flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 5. SIDE DETAIL DRAWER */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/10 rounded-none w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-8 border-b border-slate-200 dark:border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-zinc-600 mb-2">
                <Terminal className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
                  Transaction_Report
                </span>
              </div>
              <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                Details_{selectedOrder?.order_id}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Client_Identity
                </h4>
                <div className="space-y-px bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <DetailRow label="Name" value={selectedOrder?.buyer.name} />
                  <DetailRow label="Email" value={selectedOrder?.buyer.email} />
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Fiscal_Summary
                </h4>
                <div className="space-y-px bg-zinc-100 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <DetailRow
                    label="Amount"
                    value={`$${Number(selectedOrder?.total_price).toLocaleString()}`}
                  />
                  <DetailRow
                    label="Status"
                    value={
                      <OrderStatusBadge status={selectedOrder?.status || ""} />
                    }
                  />
                  <DetailRow
                    label="Logged_At"
                    value={
                      selectedOrder?.created_at
                        ? format(
                            new Date(selectedOrder.created_at),
                            "HH:mm dd.MM.yyyy",
                          )
                        : "—"
                    }
                  />
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] transition-transform active:scale-[0.98]"
              >
                Close_Report
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Sub-components
function OrderStatBox({
  label,
  value,
  icon,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div className="bg-white/80 border border-slate-200 dark:border-white/10 dark:bg-white/5 p-6 flex items-center justify-between group transition-colors hover:bg-white dark:hover:bg-white/[0.08]">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className={`text-xl font-black tracking-tighter ${color}`}>
          {value}
        </p>
      </div>
      <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors">
        {icon}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  let style = "border-slate-200 dark:border-white/10 text-slate-400";

  if (s === "PAID")
    style =
      "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400";
  if (s === "PENDING")
    style =
      "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500";

  return (
    <span
      className={`inline-block px-2 py-0.5 text-[9px] font-black font-mono uppercase border rounded-none tracking-tighter ${style}`}
    >
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-transparent">
      <span className="text-[9px] font-mono text-slate-400 uppercase">
        {label}
      </span>
      <span className="text-[10px] font-bold uppercase text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}
