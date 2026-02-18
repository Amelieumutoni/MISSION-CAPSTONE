import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  UserCheck,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  DollarSign,
  ShieldCheck,
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

import AdminService, {
  type UserProfile,
  type Order,
} from "@/api/services/adminServices";

export default function AdminDashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingArtists: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userComposition, setUserComposition] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [artistsRes, usersRes, ordersRes] = await Promise.all([
          AdminService.getAllArtists(),
          AdminService.getAllUsers(),
          AdminService.getAllOrders(),
        ]);

        const allArtists = artistsRes?.data || [];
        const allUsers = usersRes?.data || [];
        const allOrders = ordersRes?.data || [];

        // 1. Calculate Metrics
        const revenue = allOrders.reduce(
          (acc, curr) => acc + Number(curr.total_amount || 0),
          0,
        );
        const pending = allArtists.filter((a) => a.status === "PENDING");

        setMetrics({
          totalUsers: allUsers.length,
          totalArtists: allArtists.length,
          totalOrders: allOrders.length,
          totalRevenue: revenue,
          pendingArtists: pending.length,
        });

        const currentMonthIndex = new Date().getMonth();
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const groupedRevenue = allOrders.reduce((acc: any, order) => {
          // 1. Only include PAID orders for actual revenue
          if (order.status !== "PAID") return acc;

          const date = new Date(order.createdAt);
          const month = monthNames[date.getMonth()];

          // 2. Use "total_price" to match your JSON keys
          acc[month] = (acc[month] || 0) + Number(order.total_price || 0);

          return acc;
        }, {});

        // Create the 6-month timeline for Recharts
        const timelineData = [];
        for (let i = 5; i >= 0; i--) {
          const targetIndex = (currentMonthIndex - i + 12) % 12;
          const mName = monthNames[targetIndex];
          timelineData.push({
            name: mName,
            val: groupedRevenue[mName] || 0,
          });
        }

        setRevenueData(timelineData);
        // 3. Process User Composition Data
        setUserComposition([
          { name: "Artists", value: allArtists.length, color: "#6366f1" },
          {
            name: "Users",
            value: allUsers.length - allArtists.length,
            color: "#94a3b8",
          },
        ]);

        setRecentOrders(allOrders.slice(0, 5));
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans bg-slate-50 dark:bg-[#0a0a0a]">
        <div className="text-[10px] uppercase tracking-[0.4em] animate-pulse text-slate-500">
          Syncing_System_Data...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8 dark:bg-transparent">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System_Overview
          </h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            Real-time administrative ledger
          </p>
        </div>

        <div className="flex items-center gap-3 px-2 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
          <div className="flex items-center gap-1.5 border-r border-emerald-500/20 pr-2">
            <div className="relative flex h-2 w-2">
              <div className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
              <div className="relative rounded-full h-2 w-2 bg-emerald-500"></div>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase">
            <span>Stream Public</span>
            <span className="opacity-30">|</span>
            <span className="tabular-nums">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="Active Users"
          value={metrics.totalUsers}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Artist Nodes"
          value={metrics.totalArtists}
          icon={<UserCheck className="w-4 h-4" />}
        />
        <StatCard
          label="Pending Validation"
          value={metrics.pendingArtists}
          icon={<ShieldCheck className="w-4 h-4" />}
          color={
            metrics.pendingArtists > 0 ? "text-amber-500" : "text-slate-400"
          }
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 p-6 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Monthly Revenue Flow
            </h3>
          </div>
          {/* Ensure revenueData exists and has length, otherwise Recharts might render a 0x0 box */}
          <div className="h-[280px] w-full mt-4">
            {revenueData.length > 0 ? (
              /* The 'key' prop forces a refresh when data arrives, solving the invisible chart bug */
              <ResponsiveContainer
                width="100%"
                height="100%"
                key={revenueData.length}
              >
                <BarChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#88888815"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                    contentStyle={{
                      backgroundColor: "var(--tw-content-bg, #1e293b)", // Fallback to dark
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#818cf8", fontWeight: "bold" }}
                    labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                  />
                  <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={35}>
                    {revenueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === revenueData.length - 1
                            ? "#6366f1"
                            : "#6366f160"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10 rounded">
                <span className="text-[10px] font-mono text-slate-400 animate-pulse">
                  INIT_DATA_STREAM...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Composition Donut Chart */}
        <div className="p-6 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-sm flex flex-col">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-8">
            User_Distribution
          </h3>
          <div className="flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userComposition}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userComposition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {userComposition.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center text-[10px] uppercase font-mono"
              >
                <span className="text-slate-400 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-sans">
            Recent_Transactions
          </h3>
          <div className="border border-slate-200 dark:border-white/5 bg-white dark:bg-transparent rounded-sm overflow-hidden">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <span className="font-mono text-[10px] text-indigo-500 font-bold">
                    #{order.order_id}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {order.buyer.name}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold dark:text-white">
                    ${Number(order.total_amount || 0).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Navigation_Protocols
          </h3>
          <div className="flex flex-col gap-2">
            <ProtocolButton
              label="User Registry"
              icon={<Users className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/users/all")}
            />
            <ProtocolButton
              label="Artist Verification"
              icon={<UserCheck className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/artists")}
            />
            <ProtocolButton
              label="Global Ledger"
              icon={<ShoppingBag className="w-3.5 h-3.5" />}
              onClick={() => navigate("/dashboard/orders")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */

function StatCard({
  label,
  value,
  icon,
  color = "text-slate-900 dark:text-white",
}: any) {
  return (
    <div className="p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 rounded-sm">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="text-slate-300 dark:text-slate-600">{icon}</div>
      </div>
      <p className={`text-xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

function ProtocolButton({ label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3.5 flex items-center justify-between border border-slate-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
    >
      <span className="flex items-center gap-3">
        {icon} {label}
      </span>
      <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPaid =
    status?.toLowerCase() === "completed" || status?.toLowerCase() === "paid";
  return (
    <span
      className={`text-[8px] font-bold px-1.5 py-0.5 border uppercase ${
        isPaid
          ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
          : "border-slate-200 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}
