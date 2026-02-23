import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Maximize2,
  Play,
  Radio,
  Users,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ExhibitionsPage() {
  const navigate = useNavigate();
  const [liveExhibition, setLiveExhibition] = useState<Exhibition | null>(null);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<Exhibition[]>(
    [],
  );
  const [archivedExhibitions, setArchivedExhibitions] = useState<Exhibition[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const res = await ExhibitionService.getPublicExhibitions();
      const allExhibitions = res.data;

      // Find current live exhibition (LIVE status and LIVE type)
      const live = allExhibitions.find(
        (ex: Exhibition) => ex.status === "LIVE" && ex.type === "LIVE",
      );

      // Upcoming exhibitions (UPCOMING status and LIVE type)
      const upcoming = allExhibitions.filter(
        (ex: Exhibition) => ex.status === "UPCOMING" && ex.type === "LIVE",
      );

      // Archived exhibitions (ARCHIVED status and LIVE type) - for Past Records
      const archived = allExhibitions.filter(
        (ex: Exhibition) => ex.status === "ARCHIVED" && ex.type === "LIVE",
      );

      setLiveExhibition(live || null);
      setUpcomingExhibitions(upcoming);
      setArchivedExhibitions(archived);
    } catch (err) {
      console.error("Failed to fetch exhibitions:", err);
      toast.error("Failed to load exhibitions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      day: date.getDate(),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  if (loading) {
    return (
      <>
        {/* Hero Skeleton */}
        <section className="relative h-[85vh] bg-slate-900">
          <Skeleton className="absolute inset-0 opacity-20" />
        </section>

        {/* Upcoming Skeleton */}
        <section className="px-8 md:px-16 py-32 max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-video w-full mb-6" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>

        {/* Archived Skeleton */}
        <section className="px-8 md:px-16 py-32 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-48 mb-16 bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="aspect-video w-full mb-6 bg-slate-800" />
                  <Skeleton className="h-6 w-3/4 mb-2 bg-slate-800" />
                  <Skeleton className="h-4 w-1/2 bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* LIVE NOW SECTION */}
      {liveExhibition && (
        <section className="relative h-[85vh] bg-slate-900 overflow-hidden">
          <img
            src={
              liveExhibition.banner_image?.startsWith("http")
                ? liveExhibition.banner_image
                : `${baseUrl}${liveExhibition.banner_image}`
            }
            className="w-full h-full object-cover opacity-50 scale-105"
            alt="Live Now"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end px-8 pb-16 md:px-16 md:pb-24">
            <div className="flex items-center gap-4 mb-8">
              <span className="bg-red-600 text-white px-4 py-1.5 text-[10px] font-black tracking-[0.3em] flex items-center gap-2 shadow-2xl">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE NOW
              </span>
              {liveExhibition.live_details && (
                <span className="text-white/80 text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm bg-white/10 px-3 py-1.5 border border-white/20">
                  <Users className="w-3 h-3 inline mr-1" />
                  {liveExhibition.live_details.current_viewers} Watching
                </span>
              )}
            </div>

            <h1 className="text-white text-6xl md:text-8xl font-serif mb-8 max-w-5xl leading-[1.1] tracking-tighter">
              {liveExhibition.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-10">
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-light">
                {liveExhibition.description}
              </p>
              <button
                onClick={() =>
                  navigate(`/exhibitions/${liveExhibition.exhibition_id}/watch`)
                }
                className="group inline-flex items-center gap-6 bg-white text-slate-900 px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-200 transition-all shadow-xl"
              >
                Join Broadcast{" "}
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING SESSIONS */}
      {upcomingExhibitions.length > 0 && (
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
            {upcomingExhibitions.map((exhibition) => {
              const date = formatDate(exhibition.start_date);

              return (
                <div
                  key={exhibition.exhibition_id}
                  className="group flex flex-col cursor-pointer"
                  onClick={() =>
                    navigate(`/exhibitions/${exhibition.exhibition_id}`)
                  }
                >
                  {/* YOUTUBE PREMIERE THUMBNAIL */}
                  <div className="relative aspect-video overflow-hidden bg-slate-900 mb-6 shadow-2xl">
                    <img
                      src={
                        exhibition.banner_image?.startsWith("http")
                          ? exhibition.banner_image
                          : `${baseUrl}${exhibition.banner_image}`
                      }
                      alt={exhibition.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                    />

                    {/* TOP OVERLAY: DATE BADGE */}
                    <div className="absolute top-4 left-4 flex flex-col items-center bg-white/95 backdrop-blur-md text-slate-900 px-3 py-2 min-w-[50px]">
                      <span className="text-[9px] font-black uppercase tracking-tighter border-b border-slate-200 w-full text-center pb-1">
                        {date.month}
                      </span>
                      <span className="text-xl font-serif font-bold pt-1">
                        {date.day}
                      </span>
                    </div>

                    {/* BOTTOM OVERLAY: STATUS */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1.5 tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        UPCOMING
                      </span>
                      <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1">
                        {date.time} GMT
                      </span>
                    </div>
                  </div>

                  {/* INFO SECTION */}
                  <div className="flex gap-4 px-1">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-100 p-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden">
                        <img
                          src={
                            exhibition.banner_image?.startsWith("http")
                              ? exhibition.banner_image
                              : `${baseUrl}${exhibition.banner_image}`
                          }
                          className="w-full h-full object-cover grayscale"
                          alt={exhibition.author?.name}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xl font-serif text-slate-900 leading-tight mb-2 group-hover:text-red-600 transition-colors">
                        {exhibition.title}
                      </h4>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-6">
                        with {exhibition.author?.name || "Unknown Artist"}
                      </p>

                      <div className="flex gap-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(
                              `You'll be notified when ${exhibition.title} starts`,
                            );
                          }}
                          className="flex-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] py-4 px-4 hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                        >
                          Notify Me <Play className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/exhibitions/${exhibition.exhibition_id}`,
                            );
                          }}
                          className="px-5 border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <Maximize2 className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PAST RECORDS - Archived Sessions */}
      {archivedExhibitions.length > 0 && (
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
              {archivedExhibitions.length > 6 && (
                <button
                  onClick={() => navigate("/exhibitions/archive")}
                  className="text-[9px] font-black uppercase tracking-widest border-b border-white/20 pb-2 hover:text-red-500 hover:border-red-500 transition-all"
                >
                  View Full Archive
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {archivedExhibitions.slice(0, 6).map((exhibition) => {
                const hasRecording = exhibition.live_details?.recording_path;
                const totalViews = exhibition.live_details?.total_views || 0;
                const date = formatDate(exhibition.end_date);

                return (
                  <div
                    key={exhibition.exhibition_id}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(`/exhibitions/${exhibition.exhibition_id}`)
                    }
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-800 mb-6">
                      <img
                        src={
                          exhibition.banner_image?.startsWith("http")
                            ? exhibition.banner_image
                            : `${baseUrl}${exhibition.banner_image}`
                        }
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        alt={exhibition.title}
                      />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all">
                          <Play className="w-5 h-5 fill-current ml-1" />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={`rounded-none text-[8px] ${
                            hasRecording ? "bg-green-600" : "bg-slate-700"
                          }`}
                        >
                          {hasRecording ? "RECORDING AVAILABLE" : "ARCHIVED"}
                        </Badge>
                      </div>

                      {/* Stats Badge */}
                      <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 text-[8px] font-bold tracking-widest flex items-center gap-2">
                        {totalViews > 0 && (
                          <>
                            <Eye className="w-3 h-3" />
                            {totalViews}
                          </>
                        )}
                        <Calendar className="w-3 h-3" />
                        {date.full}
                      </div>
                    </div>

                    <h3 className="font-serif text-xl mb-2 group-hover:text-slate-400 transition-colors">
                      {exhibition.title}
                    </h3>

                    <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-500 font-black">
                      <span>{exhibition.author?.name || "Unknown Artist"}</span>
                      {exhibition.artworks && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {exhibition.artworks.length} pieces
                        </span>
                      )}
                    </div>

                    {!hasRecording && (
                      <p className="text-[8px] text-amber-500/70 mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-amber-500" />
                        No recording available
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {!liveExhibition &&
        upcomingExhibitions.length === 0 &&
        archivedExhibitions.length === 0 && (
          <section className="px-8 md:px-16 py-32 max-w-7xl mx-auto text-center">
            <div className="border-2 border-dashed border-slate-200 py-32">
              <Radio className="w-16 h-16 mx-auto mb-6 text-slate-300" />
              <h2 className="text-3xl font-serif text-slate-400 mb-4">
                No Exhibitions Available
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Check back later for upcoming live streams and archived content.
              </p>
            </div>
          </section>
        )}
    </>
  );
}
