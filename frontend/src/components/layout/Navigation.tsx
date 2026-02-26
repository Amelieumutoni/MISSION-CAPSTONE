import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Search,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  ChevronDown,
  LucideLayoutDashboard,
  Package,
  X,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SEARCH_SUGGESTIONS = [
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Artists", href: "/artists" },
  { label: "Collections", href: "/collections" },
  { label: "Archives", href: "/archives" },
  { label: "Shop", href: "/shop" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const dashboardPath = user?.role === "BUYER" ? "/buyer" : "/dashboard";

  const navLinks = [
    { name: "Exhibitions", path: "/exhibitions" },
    { name: "Artists", path: "/artists" },
    { name: "Collections", path: "/collections" },
    { name: "Archives", path: "/archives" },
    { name: "Shop", path: "/shop" },
  ];

  // ── Keyboard shortcut: Ctrl+K / Cmd+K / Win+K ────────────────────────────
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

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close on outside click
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

  const filteredSuggestions = searchQuery.trim()
    ? SEARCH_SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : SEARCH_SUGGESTIONS;

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
    setOpen(false);
  };

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
        <div className="flex justify-between items-center px-8 py-6">
          {/* Logo */}
          <h1
            className="text-2xl font-serif font-bold tracking-tighter cursor-pointer"
            onClick={() => navigate("/")}
          >
            CRAFTFOLIO
          </h1>

          {/* Desktop nav links */}
          <div className="hidden md:flex space-x-12 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`hover:text-black transition-colors ${
                  pathname === link.path ? "text-slate-800" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-6">
            {/* Search trigger with shortcut hint */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors group"
              title={`Search (${isMac ? "⌘" : "Ctrl"}+K)`}
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
              <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 border border-slate-200 text-[8px] text-slate-400 font-mono bg-slate-50 group-hover:border-slate-400 transition-colors">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none group border border-transparent hover:border-slate-200 p-1 transition-all">
                  <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex-shrink-0">
                    {user.profile?.profile_picture ? (
                      <img
                        src={`${import.meta.env.BACKEND_IMAGE_URL || "/image"}${user.profile.profile_picture}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon size={16} />
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-slate-400 group-hover:text-slate-900 transition-colors"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="rounded-none border-slate-200 w-56 mt-1 p-0 shadow-none bg-white"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">
                      {user.role} Account
                    </p>
                    <p className="text-sm font-serif font-bold text-slate-900 truncate">
                      {user.email}
                    </p>
                  </div>

                  {user.role === "BUYER" ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => navigate("/cart")}
                        className="rounded-none cursor-pointer flex items-center justify-between px-4 py-3 focus:bg-slate-50 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={14} />
                          <span className="text-[10px] uppercase font-bold tracking-widest">
                            My Cart
                          </span>
                        </div>
                        <span className="font-mono text-[10px] bg-slate-900 text-white px-1.5 py-0.5">
                          {cart.length}
                        </span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate("/buyer")}
                        className="rounded-none cursor-pointer flex items-center gap-2 px-4 py-3 text-slate-900 focus:bg-slate-50"
                      >
                        <Package size={14} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">
                          Dashboard
                        </span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard")}
                      className="rounded-none cursor-pointer flex items-center gap-2 px-4 py-3 text-slate-900 focus:bg-slate-50"
                    >
                      <LucideLayoutDashboard size={14} />
                      {/* ← Fixed: was user.role.toLowerCase (missing ()) */}
                      <span className="text-[10px] uppercase font-bold tracking-widest">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}{" "}
                        Dashboard
                      </span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-none cursor-pointer flex items-center gap-2 px-4 py-3 text-red-600 focus:bg-red-50 focus:text-red-600 border-t border-slate-100"
                  >
                    <LogOut size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="hidden md:block text-[10px] uppercase font-bold tracking-[0.2em] text-slate-900"
                >
                  Login
                </button>
                <Button
                  onClick={() => navigate("/register")}
                  className="hidden md:flex rounded-none h-9 text-[9px] font-bold uppercase tracking-widest px-6 bg-slate-900"
                >
                  Join
                </Button>
              </div>
            )}

            {/* Mobile drawer */}
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2 text-slate-900">
                    <Menu strokeWidth={1.5} className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:w-100 border-l border-slate-100 p-0"
                >
                  <div className="flex flex-col h-full bg-white">
                    <SheetHeader className="p-8 border-b border-slate-50">
                      <SheetTitle className="text-left font-serif text-2xl tracking-tighter">
                        CRAFTFOLIO
                      </SheetTitle>
                    </SheetHeader>

                    {/* Mobile search button in drawer */}
                    <button
                      onClick={() => {
                        setOpen(false);
                        setSearchOpen(true);
                      }}
                      className="mx-8 mt-8 flex items-center gap-3 border border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:border-slate-400 transition-colors"
                    >
                      <Search size={14} />
                      Search...
                      <kbd className="ml-auto text-[8px] font-mono border border-slate-200 px-1 py-0.5">
                        {isMac ? "⌘" : "Ctrl"} K
                      </kbd>
                    </button>

                    <div className="flex flex-col flex-1 px-8 py-8 space-y-8">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="text-4xl font-serif italic text-slate-900"
                          onClick={() => setOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}

                      {user && (
                        <Link
                          to={dashboardPath}
                          className="text-4xl font-serif italic text-slate-900 border-t border-slate-100 pt-8"
                          onClick={() => setOpen(false)}
                        >
                          {user.role === "BUYER" ? "My Profile" : "Dashboard"}
                        </Link>
                      )}

                      {!user && (
                        <div className="pt-8 space-y-6">
                          <Button
                            onClick={() => {
                              setOpen(false);
                              navigate("/login");
                            }}
                            className="w-full rounded-none py-8 text-[10px] font-bold uppercase tracking-[0.3em] bg-slate-900"
                          >
                            Login
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Search modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            ref={searchContainerRef}
            className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200"
          >
            {/* Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border-b border-slate-100"
            >
              <Search size={16} className="ml-4 text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exhibitions, artists, collections..."
                className="flex-1 px-4 py-4 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 mr-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-3 mr-1 text-slate-400 hover:text-slate-700 transition-colors border-l border-slate-100"
              >
                <kbd className="text-[9px] font-mono">ESC</kbd>
              </button>
            </form>

            {/* Suggestions */}
            <div className="py-2">
              {filteredSuggestions.length > 0 ? (
                <>
                  <p className="px-4 pt-2 pb-1 text-[9px] uppercase tracking-[0.25em] text-slate-400 font-bold font-mono">
                    {searchQuery ? "Matching sections" : "Quick navigate"}
                  </p>
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.href}
                      type="button"
                      onClick={() => handleSuggestionClick(s.href)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <span className="font-medium">{s.label}</span>
                      <ArrowRight
                        size={13}
                        className="text-slate-300 group-hover:text-slate-500 transition-colors"
                      />
                    </button>
                  ))}
                </>
              ) : (
                <p className="px-4 py-6 text-center text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  No results for "{searchQuery}"
                </p>
              )}
            </div>

            {/* Footer hints */}
            <div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-4 text-[9px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <kbd className="border border-slate-200 px-1 py-0.5 bg-slate-50">
                  ↵
                </kbd>
                search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="border border-slate-200 px-1 py-0.5 bg-slate-50">
                  ESC
                </kbd>
                close
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <kbd className="border border-slate-200 px-1 py-0.5 bg-slate-50">
                  {isMac ? "⌘" : "Ctrl"}
                </kbd>
                <kbd className="border border-slate-200 px-1 py-0.5 bg-slate-50">
                  K
                </kbd>
                open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
