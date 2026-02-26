import { useEffect, useState } from "react";
import { OrderService } from "@/api/services/orderService";
import NotificationService from "@/api/services/notificationSerivce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  CreditCard,
  Clock,
  User,
  Settings,
  ShoppingBag,
  LogOut,
  Bell,
  Trash2,
  MailOpen,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BuyerProfileSection from "@/components/dashboard/buyer/UpdateProfile";
import { toast } from "sonner";
import AccountSettingsSection from "@/components/dashboard/buyer/AccountSettings";

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeSection, setActiveSection] = useState("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const { logout } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orderData, notifData] = await Promise.all([
          OrderService.getUserOrders(),
          NotificationService.getMyNotifications(),
        ]);
        setOrders(orderData);
        setNotifications(notifData.data || notifData);
      } catch (err) {
        toast.error("Failed to load dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out", {
      description: "You have been successfully logged out.",
    });
  };

  // Notification Handlers
  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const navItems = [
    { id: "orders", label: "My Collections", icon: <ShoppingBag size={18} /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      count: unreadCount,
    },
    { id: "profile", label: "Personal Info", icon: <User size={18} /> },
    { id: "settings", label: "Account Settings", icon: <Settings size={18} /> },
  ];

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    return true;
  });

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
              className={`w-full flex items-center justify-between px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all ${
                activeSection === item.id
                  ? "bg-slate-900 text-white"
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
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest font-bold text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto text-slate-900">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* COLLECTIONS SECTION */}
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
                                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
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

          {/* NOTIFICATIONS SECTION */}
          {activeSection === "notifications" && (
            <div className="space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-slate-900">
                    Notifications
                  </h1>
                  <p className="text-slate-500 font-sans tracking-wide">
                    Stay updated on your activity.
                  </p>
                </div>
                <div className="flex gap-4 border-b border-slate-100 pb-1">
                  {["ALL", "UNREAD"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-[10px] font-mono tracking-widest transition-all ${filter === f ? "text-slate-900 border-b border-slate-900 pb-1" : "text-slate-400"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </header>

              <div className="border-t border-slate-100">
                {isLoading ? (
                  <p className="py-10 text-center font-mono text-[10px] text-slate-400 uppercase">
                    Synchronizing...
                  </p>
                ) : filteredNotifs.length === 0 ? (
                  <p className="py-20 text-center font-mono text-[10px] text-slate-400 uppercase">
                    No records found.
                  </p>
                ) : (
                  filteredNotifs.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`flex items-center justify-between py-6 border-b border-slate-50 group ${!notif.is_read ? "bg-slate-50/50 -mx-4 px-4" : ""}`}
                    >
                      <div className="flex gap-4 items-start">
                        {notif.priority === "high" ? (
                          <AlertTriangle
                            size={16}
                            className="text-rose-500 mt-1"
                          />
                        ) : (
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-2 ${notif.is_read ? "bg-slate-200" : "bg-slate-900"}`}
                          />
                        )}
                        <div>
                          <h3
                            className={`text-sm tracking-tight ${!notif.is_read ? "font-bold" : "text-slate-600"}`}
                          >
                            {notif.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-serif mt-1">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={() =>
                              handleMarkAsRead(notif.notification_id)
                            }
                            className="text-slate-400 hover:text-slate-900"
                          >
                            <MailOpen size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotif(notif.notification_id)
                          }
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === "profile" && <BuyerProfileSection />}
          {activeSection === "settings" && <AccountSettingsSection />}
        </div>
      </main>
    </div>
  );
}

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
  };
  return (
    <Badge variant="outline" className={`rounded-none px-3 ${styles[status]}`}>
      {status}
    </Badge>
  );
}
