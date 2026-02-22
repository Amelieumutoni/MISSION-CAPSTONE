import { Search, Bell, Sun, Moon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

export function Header({ darkMode, setDarkMode }: any) {
  const { user, loading } = useAuth();

  return (
    <header className="h-16 lg:h-20 border-b border-slate-200 dark:border-white/[0.12] flex items-center justify-between px-6 lg:px-10 bg-white dark:bg-[#050508] z-30 sticky top-0">
      {/* Search Section */}
      <div className="flex items-center gap-6 flex-1">
        <MobileNav />

        {/* Search Container: Subtle background to define the area in Dark Mode */}
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

      {/* Actions Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
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

        {/* Notifications */}
        <button className="relative p-3 border border-transparent hover:border-slate-200 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all group">
          <Bell size={18} strokeWidth={2} />
          {/* Violet notification dot for clear visibility */}
          <span className="absolute top-3.5 right-3.5 rounded-full w-2 h-2 bg-violet-500 dark:bg-violet-400 border-2 border-white dark:border-[#050508]" />
        </button>

        {!loading && user?.role === "AUTHOR" && (
          <>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/20 mx-2 hidden sm:block" />

            {/* High-Contrast Action Button */}
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
