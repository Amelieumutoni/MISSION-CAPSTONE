import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">
          <Menu size={20} />
        </button>
      </SheetTrigger>
      <SheetContent className="h-full">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
