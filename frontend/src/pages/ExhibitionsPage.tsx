import Footer from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navigation";
import { EXHIBITIONS } from "@/utils/consts";
import { Clock, Play, Radio } from "lucide-react";

export default function ExhibitionsPage() {
  const liveExhibition = EXHIBITIONS.find((ex) => ex.type === "LIVE");
  const upcomingEvents = EXHIBITIONS.filter((ex) => ex.type === "UPCOMING");

  return (
    <main className="bg-white min-h-screen">
      <Navbar />

      {/* LIVE HERO */}
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

      {/* UPCOMING SCHEDULE */}
      <section className="px-8 py-24 md:px-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6 border-b border-slate-100 pb-12">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-4 font-bold">
              Event Calendar
            </h2>
            <h3 className="text-5xl font-serif text-slate-900">
              Upcoming Exhibits
            </h3>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest max-w-[200px] text-right leading-loose">
            Live documentation of heritage in motion.
          </p>
        </div>

        <div className="space-y-1">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="group grid md:grid-cols-12 items-center py-10 border-b border-slate-100 hover:bg-slate-50 transition-colors px-4"
              >
                <div className="md:col-span-2 text-slate-400 font-serif text-2xl italic">
                  {event.date}
                </div>
                <div className="md:col-span-6">
                  <h4 className="text-2xl font-serif text-slate-900 mb-1">
                    {event.title}
                  </h4>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    Featured Artist: {event.curator}
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-2 text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    {event.time}
                  </span>
                </div>
                <div className="md:col-span-2 text-right">
                  <button className="text-[9px] font-black uppercase tracking-[0.3em] border border-slate-200 px-6 py-3 hover:bg-slate-900 hover:text-white transition-all">
                    Remind Me
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-xs uppercase tracking-widest py-10">
              No upcoming events scheduled at this time.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
