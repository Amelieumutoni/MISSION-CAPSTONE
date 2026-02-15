import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Exhibitions", path: "/exhibitions" },
    { name: "Artists", path: "/artists" },
    { name: "Collections", path: "/collections" },
    { name: "Artworks", path: "/artworks" },
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

        {/* RIGHT: ACTIONS & MOBILE DRAWER */}
        <div className="flex items-center gap-6">
          <button className="hidden sm:block text-slate-400 hover:text-black">
            <Search className="w-4 h-4" strokeWidth={1.5} />
          </button>

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

          {/* SHADCN MOBILE DRAWER (SHEET) */}
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
