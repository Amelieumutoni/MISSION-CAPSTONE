import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ArrowRight,
  X,
  MailOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import NotificationService from "@/api/services/notificationSerivce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define role-based suggestions
const SEARCH_SUGGESTIONS = [
  {
    label: "Exhibitions",
    href: "/dashboard/exhibitions",
    roles: ["AUTHOR"],
  },
  {
    label: "Exhibitions",
    href: "/dashboard/exhibitions/all",
    roles: ["ADMIN"],
  },
  { label: "Artists", href: "/dashboard/artists", roles: ["ADMIN"] },
  { label: "My Artworks", href: "/dashboard/artworks", roles: ["AUTHOR"] },
  { label: "Finace", href: "/dashboard/finance", roles: ["AUTHOR"] },
  { label: "Orders", href: "/dashboard/orders", roles: ["ADMIN"] },
  { label: "Archives", href: "/dashboard/archives", roles: ["ADMIN"] },
];

export function Header({ darkMode, setDarkMode }: any) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ── Role-Based Filtering Logic ──────────────────────────────────────────

  // Filter search suggestions based on current user role
  const roleBasedSuggestions = SEARCH_SUGGESTIONS.filter(
    (suggestion) => user?.role && suggestion.roles.includes(user.role),
  );

  const filteredSuggestions = searchQuery.trim()
    ? roleBasedSuggestions.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : roleBasedSuggestions;

  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    if (searchOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleSuggestionClick = (href: string) => {
    navigate(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getMyNotifications();
      const list = data.data || data;
      setNotifications(list.slice(0, 5));
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notification registry:", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-white/[0.12] flex items-center justify-between px-6 lg:px-10 bg-white dark:bg-[#050508] z-30 sticky top-0">
        <div className="flex items-center gap-6 flex-1">
          <MobileNav />

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-white/[0.03] px-4 border-b border-slate-200 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 transition-all duration-300 max-w-md w-full group text-left"
          >
            <Search
              size={16}
              className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300 flex-shrink-0"
            />
            <span className="text-[13px] text-slate-400 dark:text-slate-500 py-2.5 flex-1 font-sans tracking-tight">
              {user?.role === "ADMIN"
                ? "Search management & registry..."
                : "Search exhibitions or artists..."}
            </span>
            <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-slate-200 dark:border-white/10 text-[9px] text-slate-400 dark:text-slate-500 font-mono bg-white dark:bg-white/5 flex-shrink-0">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
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

          {/* Quick Actions - Role Based */}
          {!loading && user?.role === "AUTHOR" && (
            <Button
              onClick={() => navigate("/dashboard/exhibitions/new")}
              className="rounded-none bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-black shadow-none active:scale-[0.98] transition-all duration-300 font-sans font-bold uppercase tracking-[0.2em] text-[10px] px-6 h-10 border-none ml-2"
            >
              <Plus size={14} className="mr-2 stroke-[3px]" />
              <span className="hidden sm:inline">New Exhibition</span>
            </Button>
          )}

          {user?.role === "ADMIN" && (
            <Button
              onClick={() => navigate("/dashboard/admin/approvals")}
              className="rounded-none bg-violet-600 hover:bg-violet-700 text-white shadow-none active:scale-[0.98] transition-all duration-300 font-sans font-bold uppercase tracking-[0.2em] text-[10px] px-6 h-10 border-none ml-2"
            >
              <ArrowRight size={14} className="mr-2 stroke-[3px]" />
              <span className="hidden sm:inline">Review Approvals</span>
            </Button>
          )}
        </div>
      </header>

      {/* ── Role-Filtered Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
          <div
            ref={searchContainerRef}
            className="relative w-full max-w-lg bg-white dark:bg-[#0b0b0f] border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border-b border-slate-100 dark:border-white/10"
            >
              <Search size={16} className="ml-4 text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  user?.role === "ADMIN"
                    ? "Search registry, users, logs..."
                    : "Search exhibitions, artworks..."
                }
                className="flex-1 px-4 py-4 text-sm bg-transparent outline-none text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-3 text-slate-400 border-l border-slate-100 dark:border-white/10"
              >
                <kbd className="text-[9px] font-mono">ESC</kbd>
              </button>
            </form>

            <div className="py-2">
              {filteredSuggestions.length > 0 ? (
                <>
                  <p className="px-4 pt-2 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 font-bold font-mono">
                    {searchQuery ? "Matching sections" : "Role shortcuts"}
                  </p>
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.href}
                      onClick={() => handleSuggestionClick(s.href)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="font-medium">{s.label}</span>
                      <ArrowRight size={13} className="text-slate-300" />
                    </button>
                  ))}
                </>
              ) : (
                <p className="px-4 py-6 text-center text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  No results for "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
