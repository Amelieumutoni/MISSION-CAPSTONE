import { Instagram } from "lucide-react";

// Research-validated imagery for 2026 Exhibition Platforms
const COMMUNITY_IMAGES = [
  // 1. Futuristic Venue: White fluid architecture
  "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600",

  // 2. Moody Gallery: Networking and atmospheric lighting
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800",

  // 3. Livestream Setup: Professional camera in a gallery context
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",

  // 4. Floral Pop: 2026 Aesthetic Lead (Vibrant Abstract)
  "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",

  // 5. Immersive Neon: Beyond the Frame digital installation
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800",

  // 6. Biophilic Art: Tactile, nature-first organic textures
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
];

export default function CommunityHighlights() {
  return (
    <section className="px-8 py-24 bg-white">
      <div className="mb-16 text-center">
        <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-3 font-bold">
          Follow @craftfolio
        </h3>
        <h4 className="text-4xl font-serif tracking-tight">
          Community Highlights
        </h4>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {COMMUNITY_IMAGES.map((src, i) => (
          <div
            key={i}
            className="aspect-square bg-slate-100 overflow-hidden group relative cursor-pointer"
          >
            {/* Real Image */}
            <img
              src={src}
              alt={`Community highlight ${i + 1}`}
              className="w-full h-full object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
            />

            {/* Instagram Style Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Instagram className="text-white w-6 h-6 stroke-[1.5px]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
