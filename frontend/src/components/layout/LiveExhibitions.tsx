import { LIVE_EVENTS } from "@/utils/consts";
import { Play, Radio } from "lucide-react";

export default function LiveExhibitsSection() {
  return (
    <section className="px-8 py-24 bg-slate-50/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-slate-300" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
            Live Streaming Now
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest">
            Global Broadcast
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {LIVE_EVENTS.map((event) => (
          <LiveEventCard key={event.title} {...event} />
        ))}
      </div>
    </section>
  );
}

function LiveEventCard({
  title,
  artist,
  status,
  viewers,
  date,
  image,
}: {
  title: string;
  artist: string;
  status: string;
  viewers?: number | string;
  date?: string;
  image: string;
}) {
  const isLive = status === "LIVE";

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video bg-slate-200 mb-6 overflow-hidden">
        {/* Background Image */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span
            className={`px-3 py-1 text-[8px] font-black tracking-[0.2em] text-white flex items-center gap-2 ${
              isLive
                ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                : "bg-slate-900"
            }`}
          >
            {isLive && <Radio className="w-3 h-3 animate-pulse" />}
            {status}
          </span>
          {viewers && (
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em]">
              {viewers} VIEWERS
            </span>
          )}
        </div>

        {/* Play Overlay (Appears on Hover) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
            <Play className="w-6 h-6 text-slate-900 fill-slate-900 ml-1" />
          </div>
        </div>

        {/* Bottom Progress Bar (Visual decoration for "Recorded" or "Live") */}
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-1000 w-0 group-hover:w-full opacity-70" />
      </div>

      {/* Info */}
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-serif text-xl mb-1 group-hover:underline decoration-1 underline-offset-8">
            {title}
          </h5>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium">
            {artist} {date && `• ${date}`}
          </p>
        </div>
        {isLive && (
          <div className="flex gap-1 pt-2">
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_0ms]" />
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_200ms]" />
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_400ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
