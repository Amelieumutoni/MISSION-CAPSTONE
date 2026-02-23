import { useEffect, useState } from "react";
import { OrderService } from "@/api/services/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CreditCard,
  Clock,
  User,
  Settings,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BuyerProfileSection from "@/components/dashboard/buyer/UpdateProfile";
import { toast } from "sonner"; // Added toast import
import AccountSettingsSection from "@/components/dashboard/buyer/AccountSettings";

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState("orders");
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await OrderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        // Error toast for data fetching
        toast.error("Failed to load collections", {
          description: "We couldn't retrieve your orders at this time.",
        });
        console.error("Failed to fetch orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out", {
      description: "You have been successfully logged out.",
    });
  };

  const navItems = [
    { id: "orders", label: "My Collections", icon: <ShoppingBag size={18} /> },
    { id: "profile", label: "Personal Info", icon: <User size={18} /> },
    { id: "settings", label: "Account Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* --- SIDE NAVIGATION --- */}
      <aside className="w-64 border-r border-slate-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400">
            Buyer Portal
          </p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all ${
                activeSection === item.id
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={handleLogout} // Updated to use local handler with toast
            className="w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest font-bold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          {activeSection === "orders" && (
            <>
              <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-serif font-bold text-slate-900">
                  My Collections
                </h1>
                <p className="text-slate-500 font-sans tracking-wide">
                  Manage your orders and art acquisitions.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<Package className="w-5 h-5" />}
                  title="Total Orders"
                  value={orders.length}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  title="Pending"
                  value={orders.filter((o) => o.status === "PENDING").length}
                />
                <StatCard
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Paid"
                  value={orders.filter((o) => o.status === "PAID").length}
                />
              </div>

              {/* Order Table... same as before */}
              <Card className="rounded-none border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-xl font-serif">
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    {isLoading ? (
                      <div className="p-10 text-center text-slate-400 text-sm">
                        Loading orders...
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Artworks</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {orders.map((order) => (
                            <tr
                              key={order.order_id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 font-mono text-xs">
                                #{order.order_id}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex -space-x-3">
                                  {order.items?.map((item, i) => (
                                    <img
                                      key={i}
                                      src={"/image" + item.artwork.main_image}
                                      className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                                      title={item.artwork.title}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-700">
                                ${order.total_price}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === "profile" && <BuyerProfileSection />}
          {activeSection === "settings" && <AccountSettingsSection />}
        </div>
      </main>
    </div>
  );
}

// Sub-components for cleaner code
function StatCard({ icon, title, value }) {
  return (
    <Card className="rounded-none border-slate-200">
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="p-3 bg-slate-100 rounded-none text-slate-900">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-tighter text-slate-500">
            {title}
          </p>
          <p className="text-2xl font-bold font-serif">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-100 text-rose-700 border-rose-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <Badge variant="outline" className={`rounded-none px-3 ${styles[status]}`}>
      {status}
    </Badge>
  );
}
