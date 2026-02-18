import React, { useEffect, useState } from "react";
import ArtworkService from "@/api/services/artworkService";
import { toast } from "sonner";
import {
  Package,
  Activity,
  DollarSign,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function ArtistFinancialsPage() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await ArtworkService.getMyArtworks();
        const list = Array.isArray(data) ? data : data?.data || [];
        setArtworks(list);
      } catch (err) {
        toast.error("PROTOCOL_ERROR: Financial sync failed.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- ANALYSIS LOGIC ---
  const soldItems = artworks.filter(
    (item) => item.order_id || item.status === "SOLD",
  );
  const unsoldItems = artworks.filter(
    (item) => !item.order_id && item.status !== "SOLD",
  );

  const totalRevenue = soldItems.reduce(
    (acc, curr) => acc + Number(curr.price || 0),
    0,
  );
  const potentialRevenue = unsoldItems.reduce(
    (acc, curr) => acc + Number(curr.price || 0),
    0,
  );

  // Data for Charts
  const chartData = [
    {
      name: "Liquidated",
      value: totalRevenue,
      count: soldItems.length,
      fill: "#22c55e",
    },
    {
      name: "Inventory",
      value: potentialRevenue,
      count: unsoldItems.length,
      fill: "#f59e0b",
    },
  ];

  const distributionData = [
    { name: "Sold", value: soldItems.length },
    { name: "Unsold", value: unsoldItems.length },
  ];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 bg-transparent text-slate-900 dark:text-white">
      {/* 1. TOP TIER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-white/10 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 dark:bg-white">
              <Activity className="w-3 h-3 text-white dark:text-black" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Finance
            </h1>
          </div>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
            Financial Asset Monitoring
          </p>
        </div>

        <div className="flex items-center gap-12 font-mono">
          <div className="relative">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">
              Conversion_Efficiency
            </p>
            <p className="text-3xl font-black tracking-tighter">
              {artworks.length > 0
                ? ((soldItems.length / artworks.length) * 100).toFixed(1)
                : "0.0"}
              %
            </p>
            <div className="absolute -right-4 top-0">
              <TrendingUp className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUAL INTELLIGENCE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Comparison Bar Chart */}
        <div className="lg:col-span-2 p-8 border border-slate-200 dark:border-white/10 bg-white/5 backdrop-blur-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-slate-500 flex items-center gap-2">
            <BarChart3Icon className="w-3 h-3" /> Capital_Allocation_USD
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#88888820"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontFamily: "monospace" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "none",
                    fontSize: "10px",
                    color: "#fff",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="p-8 border border-slate-200 dark:border-white/10 bg-white/5 flex flex-col items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest self-start mb-8 text-slate-500 flex items-center gap-2">
            <PieIcon className="w-3 h-3" /> Asset_Status_Mix
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" stroke="none" />
                  <Cell fill="#334155" stroke="none" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-2 mt-4 font-mono text-[10px]">
            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
              <span className="text-slate-500 uppercase">Settled_Units</span>
              <span className="font-bold">{soldItems.length}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-1">
              <span className="text-slate-500 uppercase">Active_Inventory</span>
              <span className="font-bold">{unsoldItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRANSACTIONAL LEDGER (The lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* SUCCESSFUL SALES */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b-2 border-green-500 pb-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">
              Verified_Liquidations
            </h3>
            <span className="text-[10px] font-mono text-green-600 font-bold">
              REVENUE: ${totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {soldItems.map((item) => (
              <div
                key={item.id}
                className="py-4 flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono text-slate-400">
                    0{item.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-[9px] font-mono text-slate-500">
                      LIQUIDITY_DATE:{" "}
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black font-mono text-green-500">
                    +${item.price}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-green-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MARKET INVENTORY */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b-2 border-slate-900 dark:border-white pb-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">
              Active_Market_Stock
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              VALUATION: ${potentialRevenue.toLocaleString()}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {unsoldItems.map((item) => (
              <div
                key={item.id}
                className="py-4 flex justify-between items-center group opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                      Awaiting_Counterparty
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    ${item.price}
                  </p>
                  <button className="text-[8px] font-black uppercase underline tracking-tighter hover:text-amber-500 transition-colors">
                    Adjust_Pricing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper for Lucide bar chart icon
function BarChart3Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
