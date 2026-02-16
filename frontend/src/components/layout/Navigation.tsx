import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Search,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  ChevronDown,
  User,
  LucideLayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
import AuthService from "@/api/services/authService";

export const Navbar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { user } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Exhibitions", path: "/exhibitions" },
    { name: "Artists", path: "/artists" },
    { name: "Collections", path: "/collections" },
    { name: "Archives", path: "/archives" },
    { name: "Shop", path: "/shop" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-50">
      <div className="flex justify-between items-center px-8 py-6">
        {/* LEFT: LOGO */}
        <h1
          className="text-2xl font-serif font-bold tracking-tighter cursor-pointer"
          onClick={() => navigate("/")}
        >
          CRAFTFOLIO
        </h1>

        {/* CENTER: DESKTOP LINKS */}
        <div className="hidden md:flex space-x-12 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-black transition-colors ${pathname === link.path ? "text-slate-800" : ""}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT: ACTIONS & USER PROFILE */}
        <div className="flex items-center gap-6">
          <button className="hidden sm:block text-slate-400 hover:text-black">
            <Search className="w-4 h-4" strokeWidth={1.5} />
          </button>

          {user ? (
            /* LOGGED IN STATE */
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none group border border-transparent hover:border-slate-200 p-1 transition-all">
                <div className="w-8 h-8 bg-slate-100 rounded-full border border-slate-200 overflow-hidden flex-shrink-0">
                  {user.profile.profile_picture ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${user.profile.profile_picture}`}
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
                    Authenticated As
                  </p>
                  <p className="text-sm font-serif font-bold text-slate-900 truncate">
                    {user.name}
                  </p>
                </div>

                {user.role === "BUYER" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/shop")}
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
                )}

                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      `${user.role === "BUYER" ? "/buyer/dashboard" : "/dashboard"}`,
                    )
                  }
                  className="rounded-none cursor-pointer flex items-center gap-2 px-4 py-3 text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                >
                  <LucideLayoutDashboard size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Dashboard
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={AuthService.logout}
                  className="rounded-none cursor-pointer flex items-center gap-2 px-4 py-3 text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <LogOut size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* LOGGED OUT STATE */
            <>
              <button
                onClick={() => navigate("/login")}
                className="hidden cursor-pointer md:block text-[10px] uppercase font-bold tracking-[0.2em] text-slate-900"
              >
                Login
              </button>
              <Button
                onClick={() => navigate("/register")}
                className="hidden md:flex rounded-none h-9 text-[9px] font-bold uppercase tracking-widest px-6 bg-slate-900"
              >
                Join
              </Button>
            </>
          )}

          {/* MOBILE DRAWER */}
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

                  <div className="flex flex-col flex-1 px-8 py-12 space-y-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className="text-4xl font-serif italic text-slate-900 hover:pl-4 transition-all duration-300"
                        onClick={() => setOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}

                    {!user && (
                      <div className="pt-8 space-y-6">
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate("/login");
                          }}
                          className="block text-[11px] uppercase font-bold tracking-[0.4em] text-slate-900 cursor-pointer"
                        >
                          Enter Gallery
                        </button>
                        <Button
                          onClick={() => {
                            setOpen(false);
                            navigate("/register");
                          }}
                          className="w-full rounded-none py-8 text-[10px] font-bold uppercase tracking-[0.3em] bg-slate-900"
                        >
                          Join as Artist
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                    <p className="text-[8px] uppercase tracking-[0.5em] text-slate-400">
                      Kigali • Rwanda • Digital Archive
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
