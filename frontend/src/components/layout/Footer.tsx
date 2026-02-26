import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="px-8 py-24 border-t border-slate-100 grid md:grid-cols-12 gap-16">
        {/* BRAND COLUMN - Expanded for visual weight */}
        <div className="md:col-span-6 lg:col-span-4">
          <h5 className="font-serif text-3xl mb-6 tracking-tighter font-bold">
            CRAFTFOLIO.
          </h5>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest leading-loose max-w-xs mb-8">
            A digital sanctuary for Rwandan craftsmanship. Powered by heritage,
            documented for the future.
          </p>
          <div className="flex gap-3">
            <SocialIcon Icon={Instagram} href="#" />
            <SocialIcon Icon={Twitter} href="#" />
            <SocialIcon Icon={Facebook} href="#" />
            <SocialIcon Icon={Youtube} href="#" />
          </div>
        </div>

        {/* NAVIGATION COLUMNS - Pushed to the right */}
        <div className="md:col-span-3 lg:col-start-8 lg:col-span-2 flex flex-col gap-4">
          <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Explore
          </h6>
          <nav className="flex flex-col gap-3">
            {["Artists", "Shop", "Archives", "Collections", "Exhibitions"].map(
              (item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:pl-2 transition-all duration-300"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>

        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-4">
          <h6 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Company
          </h6>
          <nav className="flex flex-col gap-3">
            {["About Us", "Contact", "Privacy", "Terms", "Copyright"].map(
              (item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:pl-2 transition-all duration-300"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="px-8 py-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[9px] uppercase tracking-[0.4em] text-slate-400">
          © 2026 CraftFolio • Preservation Through Innovation
        </p>
      </div>
    </footer>
  );
}

function SocialIcon({
  Icon,
  href,
}: {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 border border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300"
    >
      <Icon className="w-3.5 h-3.5" />
    </a>
  );
}
