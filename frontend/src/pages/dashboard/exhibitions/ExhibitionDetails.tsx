import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import {
  Calendar,
  Video,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Settings,
  Eye,
  Clock,
  Plus,
  Radio,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

export default function ExhibitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ex, setEx] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const res = await ExhibitionService.getExhibitionByIdByMe(id!);
        setEx(res.data);
      } catch (err) {
        toast.error("Unauthorized or exhibition not found");
        navigate("/dashboard/exhibitions");
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-serif tracking-widest animate-pulse text-slate-900 dark:text-slate-100">
        AUTHENTICATING OWNER ACCESS...
      </div>
    );

  if (!ex) return null;

  // Check if exhibition can be streamed
  const isArchived = ex.status === "ARCHIVED";
  const canStream =
    ex.type === "LIVE" && !isArchived && ex.is_published === true;

  // Determine button state and tooltip message
  const getStreamButtonState = () => {
    if (isArchived) {
      return {
        disabled: true,
        title: "Cannot stream - Exhibition is archived",
      };
    }
    if (!ex.is_published) {
      return {
        disabled: true,
        title: "Cannot stream - Exhibition must be published first",
      };
    }
    return {
      disabled: false,
      title: "Go Live",
    };
  };

  const streamButtonState = getStreamButtonState();

  return (
    <div className="min-h-screen bg-white dark:bg-transparent pb-20 transition-colors duration-300">
      <Toaster richColors theme="system" />

      {/* Hero Banner */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-slate-900">
        <img
          src={
            ex.banner_image?.startsWith("http")
              ? ex.banner_image
              : `${baseUrl}${ex.banner_image}`
          }
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black to-transparent" />

        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start">
          <Link
            to="/dashboard/exhibitions"
            className="bg-black/20 hover:bg-black/40 backdrop-blur-md p-2 text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <Button
            variant="secondary"
            className="rounded-none bg-white text-black hover:bg-slate-200"
            onClick={() =>
              navigate(`/dashboard/exhibitions/edit/${ex.exhibition_id}`)
            }
          >
            <Edit3 size={16} className="mr-2" /> Edit Exhibition
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className="bg-indigo-600 rounded-none">{ex.type}</Badge>
                <Badge
                  variant="outline"
                  className={`${
                    ex.is_published
                      ? "border-emerald-500 text-emerald-500"
                      : "border-amber-500 text-amber-500"
                  } bg-black/20`}
                >
                  {ex.is_published ? "PUBLIC" : "DRAFT"}
                </Badge>
                {isArchived && (
                  <Badge className="bg-slate-600 rounded-none">ARCHIVED</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-white">
                {ex.title}
              </h1>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 flex gap-8">
              <div className="text-center">
                <p className="text-[10px] text-white/50 uppercase tracking-tighter">
                  Status
                </p>
                <p className="text-white font-bold text-sm">{ex.status}</p>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-white/50 uppercase tracking-tighter">
                  Artworks
                </p>
                <p className="text-white font-bold text-sm">
                  {ex.artworks?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-inherit space-y-6 transition-colors duration-300">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Settings size={14} /> Exhibition Settings
            </h4>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Duration
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Calendar
                    size={14}
                    className="text-slate-400 dark:text-slate-500"
                  />
                  {new Date(ex.start_date).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  —{" "}
                  {new Date(ex.end_date).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              {ex.type === "LIVE" && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Stream Access
                  </span>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-600 dark:text-indigo-400 font-mono break-all flex justify-between items-center">
                    {ex.stream_link || "No link provided"}
                    {ex.stream_link && <ExternalLink size={12} />}
                  </div>

                  {/* Publishing status warning */}
                  {!ex.is_published && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertCircle
                        size={14}
                        className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[9px] text-amber-700 dark:text-amber-400">
                        Exhibition must be published before you can go live.
                      </p>
                    </div>
                  )}

                  {isArchived && (
                    <div className="flex items-start gap-2 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <AlertCircle
                        size={14}
                        className="text-slate-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[9px] text-slate-600 dark:text-slate-400">
                        Archived exhibitions cannot be streamed.
                      </p>
                    </div>
                  )}

                  <p className="text-[9px] text-slate-400 dark:text-slate-500 italic leading-tight">
                    Note: Ensure your live stream is set to "Public" so visitors
                    can view it.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold mb-4">
              Description
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {ex.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold">
              Current Curation
            </h4>
            <div className="flex items-center gap-2">
              {ex.type === "LIVE" && ex.status === "LIVE" && (
                <Button
                  size="sm"
                  disabled={!canStream}
                  className={`rounded-none text-[9px] uppercase font-bold tracking-widest ${
                    canStream
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (canStream) {
                      navigate(
                        `/dashboard/exhibitions/${ex.exhibition_id}/live`,
                      );
                    }
                  }}
                  title={streamButtonState.title}
                >
                  <Radio
                    size={12}
                    className={`mr-2 ${canStream ? "animate-pulse" : ""}`}
                  />
                  Go Live
                </Button>
              )}

              {!isArchived && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  onClick={() => navigate("/dashboard/exhibitions")}
                >
                  <Plus size={14} className="mr-2" /> Curate Artworks
                </Button>
              )}
            </div>
          </div>

          {/* Publishing status message for empty curation section */}
          {!ex.is_published && ex.artworks && ex.artworks.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <AlertCircle
                size={14}
                className="text-amber-600 dark:text-amber-400"
              />
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                This exhibition is in DRAFT mode. Publish it to make it visible
                to viewers and enable streaming.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ex.artworks?.map((art) => (
              <div
                key={art.artwork_id}
                className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-inherit overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition-all"
              >
                <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={`${baseUrl}${art.main_image}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    alt={art.title}
                  />
                </div>

                <div className="p-4 bg-white dark:bg-inherit border-t border-slate-100 dark:border-slate-800">
                  <h5 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100">
                    {art.title}
                  </h5>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                    {art.status || "Active"}
                  </p>
                </div>
              </div>
            ))}

            {(!ex.artworks || ex.artworks.length === 0) && (
              <div className="col-span-full py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <Clock size={32} className="mb-4 opacity-20" />
                <p className="text-[10px] uppercase tracking-widest font-bold">
                  This exhibition is empty
                </p>
                <p className="text-xs">
                  Start adding artworks to build your show.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
