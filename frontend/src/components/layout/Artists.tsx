import { useEffect, useState } from "react";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARTISANS } from "@/utils/consts";
import ArtistService, { type User } from "@/api/services/artistService";
import { useNavigate } from "react-router";

export default function ArtistsSection() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        const response = await ArtistService.getAllArtists();
        // Assuming the response structure is { data: [...] } or just [...]
        const data = Array.isArray(response) ? response : response.data || [];

        const activeArtists = data
          .filter((user: User) => user.status === "ACTIVE")
          .map((user: User) => ({
            id: user.user_id,
            name: user.name,
            specialty: user.profile?.bio || "Craft Master", // Using bio as specialty if no specific field
            location: user.profile?.location || "Rwanda",
            works: 0, // Admin endpoint might not include count; default to 0
            image:
              "/image" + user.profile?.profile_picture ||
              import.meta.env.BACKEND_IMAGE_URL + user.profile?.profile_picture, // Placeholder or real image
          }));
        console.log(data);
        setArtists(activeArtists);
      } catch (error) {
        console.error("Error fetching real artists:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  // Determine display data: Use real artists if they exist, otherwise fallback
  const hasRealData = artists.length > 0;
  const displayArtists = hasRealData
    ? artists.slice(0, 3)
    : ARTISANS.slice(0, 3);

  return (
    <section className="px-8 py-24 bg-white border-t border-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-4 font-bold">
            Masters of Craft
          </h3>
          <h4 className="text-5xl font-serif mb-4 tracking-tight">
            Featured Artists
          </h4>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Discover the visionaries behind Rwanda's most celebrated traditional
            crafts. Each artist is part of our live documentation initiative.
          </p>
        </div>
        <a
          href="/artists"
          className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1"
        >
          View All Artisans{" "}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
          </div>
        ) : (
          displayArtists.map((artisan, index) => (
            <ArtisanCard key={artisan.id || index} {...artisan} />
          ))
        )}
      </div>
    </section>
  );
}

function ArtisanCard({
  name,
  specialty,
  location,
  works,
  image,
  id,
}: {
  name: string;
  specialty: string;
  location: string;
  works: number | string;
  image: string;
  id: number;
}) {
  const navigate = useNavigate();

  return (
    <div className="group cursor-pointer">
      <div className="aspect-4/5 bg-slate-100 mb-6 overflow-hidden relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={() => navigate(`/artists/${id}`)}
            className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 rounded-none bg-white text-slate-900 px-8 py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white border-none shadow-xl"
          >
            View Profile
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-serif text-2xl mb-1 tracking-tight group-hover:text-slate-600 transition-colors">
            {name}
          </h5>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 font-medium max-w-[200px] truncate">
            {specialty}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-300 font-serif italic font-medium">
          {works} Works
        </div>
      </div>

      <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase tracking-widest pt-4 border-t border-slate-50">
        <MapPin className="w-3 h-3 text-slate-300" /> {location}, Rwanda
      </div>
    </div>
  );
}
