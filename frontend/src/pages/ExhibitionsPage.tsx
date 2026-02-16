import { EXHIBITIONS } from "@/utils/consts";
import { Maximize2, Play, Radio } from "lucide-react";

export default function ExhibitionsPage() {
  const liveExhibition = EXHIBITIONS.find((ex) => ex.type === "LIVE");
  const upcomingEvents = EXHIBITIONS.filter((ex) => ex.type === "UPCOMING");

  // Logic for Finished/Past events (Classifications or archived streams)
  const finishedEvents = EXHIBITIONS.filter(
    (ex) => ex.type === "FINISHED" || ex.type === "CLASSIFICATION",
  );

  return (
    <>
      {liveExhibition && (
        <section className="relative h-[85vh] bg-slate-900 overflow-hidden">
          <img
            src={liveExhibition.banner}
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Live Now"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-16 md:pb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="bg-red-600 text-white px-4 py-1.5 text-[10px] font-black tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE NOW
              </span>
              <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm bg-white/10 px-3 py-1.5 border border-white/20">
                {liveExhibition.viewers} Watching
              </span>
            </div>

            <h1 className="text-white text-6xl md:text-8xl font-serif mb-8 max-w-5xl leading-[1.1] tracking-tighter">
              {liveExhibition.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-10">
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-light">
                {liveExhibition.description}
              </p>
              <a
                href={liveExhibition.streamLink}
                className="group inline-flex items-center gap-6 bg-white text-slate-900 px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-200 transition-all shadow-xl"
              >
                Join Broadcast{" "}
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      )}
      {/* 1. UPCOMING SESSIONS - Editorial Timeline */}
      <section className="px-8 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-slate-100 pb-10">
          <div>
            <h2 className="text-5xl font-serif tracking-tighter text-slate-900 mb-2">
              Upcoming Streams
            </h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-red-600 font-black animate-pulse">
              Live Documentation Schedule
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest leading-relaxed">
              Sync your craft <br /> with the masters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="group flex flex-col">
              {/* YOUTUBE PREMIERE THUMBNAIL */}
              <div className="relative aspect-video overflow-hidden bg-slate-900 mb-6 shadow-2xl">
                <img
                  src={event.banner}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                />

                {/* TOP OVERLAY: DATE BADGE */}
                <div className="absolute top-4 left-4 flex flex-col items-center bg-white/95 backdrop-blur-md text-slate-900 px-3 py-2 min-w-[50px]">
                  <span className="text-[9px] font-black uppercase tracking-tighter border-b border-slate-200 w-full text-center pb-1">
                    {event?.date.split(" ")[0]}
                  </span>
                  <span className="text-xl font-serif font-bold pt-1">
                    {event?.date.split(" ")[1]?.replace(",", "")}
                  </span>
                </div>

                {/* BOTTOM OVERLAY: STATUS */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1.5 tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    UPCOMING
                  </span>
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1">
                    {event.time} GMT
                  </span>
                </div>
              </div>

              {/* INFO SECTION (TWITCH STYLE) */}
              <div className="flex gap-4 px-1">
                <div className="w-12 h-12 rounded-full border-2 border-slate-100 p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                    {/* Replace with actual artist image if available */}
                    <img
                      src={event.banner}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-xl font-serif text-slate-900 leading-tight mb-2 group-hover:text-red-600 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-6">
                    with {event.curator}
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-slate-50">
                    <button className="flex-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] py-4 px-4 hover:bg-red-600 transition-all flex items-center justify-center gap-3">
                      Notify Me <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button className="px-5 border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Maximize2 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. FINISHED SESSIONS - Archived Video Grid */}
      <section className="px-8 md:px-16 py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-5xl font-serif tracking-tight mb-4">
                Past Records
              </h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">
                Rewatch the craft
              </p>
            </div>
            <button className="text-[9px] font-black uppercase tracking-widest border-b border-white/20 pb-2 hover:text-red-500 hover:border-red-500 transition-all">
              View Full Archive
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {finishedEvents.map((event) => (
              <div key={event.id} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden bg-slate-800 mb-6">
                  <img
                    src={event.banner}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    alt={event.title}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                      <Play className="w-5 h-5 fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 text-[8px] font-bold tracking-widest">
                    RECORDED
                  </div>
                </div>
                <h3 className="font-serif text-xl mb-2 group-hover:text-slate-400 transition-colors">
                  {event.title}
                </h3>
                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-slate-500 font-black">
                  <span>{event.curator}</span>
                  <span>2025</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
