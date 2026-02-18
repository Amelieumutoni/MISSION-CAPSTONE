import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Image as ImageIcon,
  BarChart3,
  TrendingUp,
  Globe,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Services
import ArtworkService from "@/api/services/artworkService";
import { ExhibitionService } from "@/api/services/exhibitionService";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ArtistDashboardOverview() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalSalesCount: 0,
    totalRevenue: 0,
    artworksCount: 0,
    activeExhibitions: 0,
    potentialRevenue: 0,
  });
  const [recentArtworks, setRecentArtworks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          ArtworkService.getMyArtworks(),
          ExhibitionService.getPublicExhibitions(),
        ]);

        const artworksRes =
          results[0].status === "fulfilled" ? results[0].value : [];
        const exhibitionsRes =
          results[1].status === "fulfilled" ? results[1].value : [];

        const artworkList = Array.isArray(artworksRes)
          ? artworksRes
          : (artworksRes as any)?.data || [];

        const soldItems = artworkList.filter(
          (item: any) => item.status === "SOLD" || item.order_id,
        );
        const unsoldItems = artworkList.filter(
          (item: any) => item.status !== "SOLD" && !item.order_id,
        );

        const totalRev = soldItems.reduce(
          (acc: number, curr: any) => acc + Number(curr.price || 0),
          0,
        );
        const potentialRev = unsoldItems.reduce(
          (acc: number, curr: any) => acc + Number(curr.price || 0),
          0,
        );

        setMetrics({
          totalSalesCount: soldItems.length,
          totalRevenue: totalRev,
          artworksCount: artworkList.length,
          activeExhibitions: Array.isArray(exhibitionsRes)
            ? exhibitionsRes.filter((e: any) => e.is_published).length
            : 0,
          potentialRevenue: potentialRev,
        });

        const monthNames = [
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEP",
          "OCT",
          "NOV",
          "DEC",
        ];
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          last6Months.push(monthNames[d.getMonth()]);
        }

        const monthMap: { [key: string]: number } = {};
        artworkList.forEach((art: any) => {
          const date = new Date(art.createdAt || art.created_at || Date.now());
          const month = monthNames[date.getMonth()];
          monthMap[month] = (monthMap[month] || 0) + Number(art.price || 0);
        });

        const formattedChartData = last6Months.map((month) => ({
          name: month,
          value: monthMap[month] || 0,
        }));

        setChartData(formattedChartData);
        setRecentArtworks(artworkList.slice(0, 3));
      } catch (err) {
        console.error("Dashboard Error:", err);
        toast.error("Protocol Sync Failure: Check system logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-20 text-center font-mono">SYNCING_PROTOCOL...</div>
    );

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif uppercase tracking-tighter flex items-center gap-3">
            Artist Overview
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mt-1">
            Status: Data Stream
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-sans uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          System online
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Liquidated_Value"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
          onClick={() => navigate("/dashboard/finance")}
        />
        <StatCard
          label="Active_Inventory"
          value={metrics.artworksCount}
          icon={<ImageIcon className="w-4 h-4" />}
          onClick={() => navigate("/dashboard/artworks")}
        />
        <StatCard
          label="Exhibition_Reach"
          value={metrics.activeExhibitions}
          icon={<Globe className="w-4 h-4" />}
          onClick={() => navigate("/dashboard/exhibitions")}
        />
        <StatCard
          label="Inventory_Valuation"
          value={`$${metrics.potentialRevenue.toLocaleString()}`}
          icon={<BarChart3 className="w-4 h-4" />}
          color="text-amber-500"
          onClick={() => navigate("/dashboard/finance")}
        />
      </div>

      {/* PERFORMANCE CHART */}
      <div className="p-8 border border-slate-200 dark:border-white/10 bg-white/5 backdrop-blur-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-10">
          <TrendingUp className="w-3 h-3" /> Portfolio_Value_Trend
        </h3>
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#88888815"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  fill: "#64748b",
                }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "none",
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#64748b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ARTWORKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              Latest_Portfolio_Entries
            </h3>
            <button
              onClick={() => navigate("/dashboard/artworks")}
              className="text-[9px] font-bold uppercase text-slate-400 hover:text-slate-900"
            >
              View_Full_Inventory
            </button>
          </div>

          <div className="border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5">
            {recentArtworks.length === 0 ? (
              <div className="p-10 text-center text-[10px] font-mono text-slate-400 uppercase">
                No_Data_Found
              </div>
            ) : (
              recentArtworks.map((artwork) => (
                <div
                  key={artwork.artwork_id || artwork.id}
                  className="w-full p-4 flex justify-between items-center hover:bg-slate-500/5 group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10">
                      <img
                        src={
                          artwork.main_image
                            ? `${BACKEND_URL}${artwork.main_image}`
                            : "/placeholder.jpg"
                        }
                        alt={artwork.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                        onError={(e: any) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=No+Image";
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">
                        {artwork.title}
                      </p>
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.5 border ${artwork.status === "SOLD" ? "border-green-500 text-green-500" : "border-slate-500 text-slate-500"}`}
                      >
                        {artwork.status === "SOLD" ? "LIQUIDATED" : "AVAILABLE"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black">
                      ${Number(artwork.price).toLocaleString()}
                    </p>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 ml-auto mt-1 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Quick_Protocols
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <ProtocolButton
              label="Manage_Artworks"
              icon={<ImageIcon className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/artworks")}
            />
            <ProtocolButton
              label="Exhibition_Portal"
              icon={<Globe className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/exhibitions")}
            />
            <ProtocolButton
              label="Financial_Ledger"
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/finance")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  onClick,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div
      onClick={onClick}
      className="p-6 border border-zinc-200 dark:border-white/10 bg-white/5 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-900 group"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-500">
          {label}
        </span>
        <div className="text-slate-400">{icon}</div>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}

function ProtocolButton({ label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white group"
    >
      <span className="flex items-center gap-3">
        {icon} {label}
      </span>
      <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100" />
    </button>
  );
}
