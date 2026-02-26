import React, { useState, useEffect } from "react";
import { Search, Bell, Sun, Moon, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import NotificationService from "@/api/services/notificationSerivce"; // Import the service
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ darkMode, setDarkMode }: any) {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Fetch data from database on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getMyNotifications();
      const list = data.data || data;
      setNotifications(list.slice(0, 5)); // Show only latest 5 in dropdown
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notification registry:", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      fetchNotifications(); // Refresh counts
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  return (
    <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-white/[0.12] flex items-center justify-between px-6 lg:px-10 bg-white dark:bg-[#050508] z-30 sticky top-0">
      <div className="flex items-center gap-6 flex-1">
        <MobileNav />
        <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-white/[0.03] px-4 border-b border-slate-200 dark:border-white/20 focus-within:border-slate-900 dark:focus-within:border-white transition-all duration-300 max-w-md w-full group">
          <Search
            size={16}
            className="text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors duration-300"
          />
          <input
            placeholder="Search exhibitions or artists..."
            className="bg-transparent border-none text-[13px] w-full focus:ring-0 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans tracking-tight py-2.5"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          {darkMode ? (
            <Sun size={18} strokeWidth={2} />
          ) : (
            <Moon size={18} strokeWidth={2} />
          )}
        </button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-3 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all group outline-none">
              <Bell size={18} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-3.5 right-3.5 rounded-full w-2 h-2 bg-violet-500 dark:bg-violet-400 border-2 border-white dark:border-[#050508]" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 rounded-none border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0b0f] p-0 shadow-2xl"
          >
            <DropdownMenuLabel className="p-4 flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Registry Alerts
              </span>
              {unreadCount > 0 && (
                <span className="bg-slate-900 dark:bg-white text-white dark:text-black text-[9px] px-2 py-0.5 font-bold">
                  {unreadCount} NEW
                </span>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 m-0" />

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-8 text-center text-[10px] font-mono uppercase text-slate-400">
                  No recent activity
                </p>
              ) : (
                notifications.map((notif: any) => (
                  <DropdownMenuItem
                    key={notif.notification_id}
                    onClick={() => handleMarkAsRead(notif.notification_id)}
                    className={`p-4 cursor-pointer focus:bg-slate-50 dark:focus:bg-white/5 rounded-none flex flex-col items-start gap-1 border-b border-slate-50 dark:border-white/5 last:border-0 ${!notif.is_read ? "bg-slate-50/50 dark:bg-white/[0.02]" : ""}`}
                  >
                    <div className="flex justify-between w-full items-start">
                      <span
                        className={`text-[11px] uppercase tracking-tight ${!notif.is_read ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}`}
                      >
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 font-serif leading-relaxed">
                      {notif.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </div>

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5 m-0" />

            <Link to="/dashboard/notifications" className="block w-full">
              <DropdownMenuItem className="p-4 cursor-pointer justify-center text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all rounded-none">
                View All Activity <ArrowRight size={12} className="ml-2" />
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {!loading && user?.role === "AUTHOR" && (
          <>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/20 mx-2 hidden sm:block" />
            <Button
              onClick={() => (window.location.href = "/dashboard/exhibitions")}
              className="rounded-none bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black shadow-none active:scale-[0.98] transition-all duration-300 font-sans font-bold uppercase tracking-[0.2em] text-[10px] px-6 h-10 border-none ml-2"
            >
              <Plus size={14} className="mr-2 stroke-[3px]" />
              <span className="hidden sm:inline">New Exhibition</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
