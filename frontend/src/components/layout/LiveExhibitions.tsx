import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Play,
  Radio,
  Calendar,
  Users,
  Clock,
  Archive,
  Film,
  Eye,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LiveExhibitsSection() {
  const navigate = useNavigate();
  const [liveExhibitions, setLiveExhibitions] = useState<Exhibition[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<Exhibition[]>(
    [],
  );
  const [archivedExhibitions, setArchivedExhibitions] = useState<Exhibition[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      // Fetch all public exhibitions
      const res = await ExhibitionService.getPublicExhibitions();
      const allExhibitions = res.data;

      // Filter exhibitions by status and type
      const live = allExhibitions.filter(
        (ex: Exhibition) => ex.status === "LIVE" && ex.type === "LIVE",
      );

      const upcoming = allExhibitions.filter(
        (ex: Exhibition) => ex.status === "UPCOMING" && ex.type === "LIVE",
      );

      const archived = allExhibitions.filter(
        (ex: Exhibition) => ex.status === "ARCHIVED" && ex.type === "LIVE",
      );

      setLiveExhibitions(live);
      setUpcomingExhibitions(upcoming);
      setArchivedExhibitions(archived);
    } catch (err) {
      console.error("Failed to fetch exhibitions:", err);
      toast.error("Failed to load exhibitions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="px-8 py-24 bg-slate-50/50">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-px bg-slate-300" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
              Live Exhibitions
            </h3>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-slate-200 mb-6" />
              <div className="h-6 bg-slate-200 w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-24 bg-slate-50/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-slate-300" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">
            Live Exhibitions
          </h3>
        </div>
      </div>

      <Tabs
        defaultValue="live"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-12">
          <TabsTrigger value="live" className="rounded-none">
            Live ({liveExhibitions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-none">
            Upcoming ({upcomingExhibitions.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="rounded-none">
            Archived ({archivedExhibitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live">
          {liveExhibitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {liveExhibitions.slice(0, 6).map((exhibition) => (
                <LiveExhibitionCard
                  key={exhibition.exhibition_id}
                  exhibition={exhibition}
                  baseUrl={baseUrl}
                  type="live"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No live exhibitions at the moment"
              icon={<Radio />}
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcomingExhibitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {upcomingExhibitions.slice(0, 6).map((exhibition) => (
                <LiveExhibitionCard
                  key={exhibition.exhibition_id}
                  exhibition={exhibition}
                  baseUrl={baseUrl}
                  type="upcoming"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No upcoming exhibitions scheduled"
              icon={<Calendar />}
            />
          )}
        </TabsContent>

        <TabsContent value="archived">
          {archivedExhibitions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {archivedExhibitions.slice(0, 6).map((exhibition) => (
                <ArchivedExhibitionCard
                  key={exhibition.exhibition_id}
                  exhibition={exhibition}
                  baseUrl={baseUrl}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No archived exhibitions" icon={<Archive />} />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function LiveExhibitionCard({
  exhibition,
  baseUrl,
  type,
}: {
  exhibition: Exhibition;
  baseUrl: string;
  type: "live" | "upcoming";
}) {
  const navigate = useNavigate();
  const isLive = type === "live";

  const bannerImage = exhibition.banner_image
    ? exhibition.banner_image.startsWith("http")
      ? exhibition.banner_image
      : `${baseUrl}${exhibition.banner_image}`
    : "https://via.placeholder.com/1280x720?text=Exhibition";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/exhibitions/${exhibition.exhibition_id}/watch`)}
    >
      <div className="relative aspect-video bg-slate-200 mb-6 overflow-hidden">
        <img
          src={bannerImage}
          alt={exhibition.title}
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
            {exhibition.status}
          </span>

          {isLive && exhibition.live_details?.current_viewers !== undefined && (
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] flex items-center gap-1">
              <Users className="w-3 h-3" />
              {exhibition.live_details.current_viewers} VIEWERS
            </span>
          )}

          {!isLive && exhibition.start_date && (
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(exhibition.start_date)}
            </span>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm text-white text-[8px] font-black tracking-[0.2em]">
            {exhibition.type}
          </span>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl">
            <Play className="w-6 h-6 text-slate-900 fill-slate-900 ml-1" />
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 w-0 group-hover:w-full opacity-70 ${
            isLive ? "bg-red-600" : "bg-indigo-600"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-serif text-xl mb-1 group-hover:underline decoration-1 underline-offset-8">
            {exhibition.title}
          </h5>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium flex items-center gap-2">
            <span>{exhibition.author?.name || "Unknown Artist"}</span>
            {exhibition.artworks && exhibition.artworks.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {exhibition.artworks.length} pieces
                </span>
              </>
            )}
          </p>
        </div>

        {isLive && (
          <div className="flex gap-1 pt-2">
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_0ms]" />
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_200ms]" />
            <div className="w-1 h-3 bg-red-600 animate-[bounce_1s_infinite_400ms]" />
          </div>
        )}

        {!isLive && exhibition.status === "UPCOMING" && (
          <div className="pt-2">
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
        )}
      </div>

      {exhibition.description && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
          {exhibition.description}
        </p>
      )}
    </div>
  );
}

function ArchivedExhibitionCard({
  exhibition,
  baseUrl,
}: {
  exhibition: Exhibition;
  baseUrl: string;
}) {
  const navigate = useNavigate();
  const hasRecording = exhibition.live_details?.recording_path;
  const totalViews = exhibition.live_details?.total_views || 0;

  const bannerImage = exhibition.banner_image
    ? exhibition.banner_image.startsWith("http")
      ? exhibition.banner_image
      : `${baseUrl}${exhibition.banner_image}`
    : "https://via.placeholder.com/1280x720?text=Archived+Exhibition";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePlayRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasRecording) {
      // Navigate to recording page or open video player
      window.open(`${baseUrl}${hasRecording}`, "_blank");
    } else {
      // If no recording, go to exhibition page
      navigate(`/exhibitions/${exhibition.exhibition_id}`);
    }
  };

  return (
    <div className="group cursor-pointer relative">
      <div className="relative aspect-video bg-slate-200 mb-6 overflow-hidden">
        {/* Background Image */}
        <img
          src={bannerImage}
          alt={exhibition.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-800 text-white text-[8px] font-black tracking-[0.2em] flex items-center gap-1">
            <Archive className="w-3 h-3" />
            ARCHIVED
          </span>

          {hasRecording && (
            <span className="px-3 py-1 bg-green-600/90 backdrop-blur-sm text-white text-[8px] font-bold tracking-[0.2em] flex items-center gap-1">
              <Film className="w-3 h-3" />
              RECORDING AVAILABLE
            </span>
          )}
        </div>

        {/* View Count & Date */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          {totalViews > 0 && (
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {totalViews} VIEWS
            </span>
          )}
          <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold tracking-[0.2em] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(exhibition.end_date)}
          </span>
        </div>

        {/* Play/View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-2xl cursor-pointer hover:bg-white"
            onClick={handlePlayRecording}
          >
            {hasRecording ? (
              <Play className="w-6 h-6 text-slate-900 fill-slate-900 ml-1" />
            ) : (
              <Eye className="w-6 h-6 text-slate-900" />
            )}
          </div>
        </div>

        {/* Recording Indicator */}
        {hasRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-serif text-xl mb-1 group-hover:underline decoration-1 underline-offset-8">
            {exhibition.title}
          </h5>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium mb-2">
            {exhibition.author?.name || "Unknown Artist"}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-[9px] text-slate-500">
            {exhibition.artworks && exhibition.artworks.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {exhibition.artworks.length} pieces
              </span>
            )}
            {exhibition.live_details?.stream_status && (
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3" />
                {exhibition.live_details.stream_status}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasRecording && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-none text-[8px] h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`${baseUrl}${hasRecording}`, "_blank");
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              Recording
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {exhibition.description && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
          {exhibition.description}
        </p>
      )}

      {/* No Recording Message */}
      {!hasRecording && (
        <div className="mt-3 flex items-center gap-1 text-[8px] text-amber-600 bg-amber-50 p-2">
          <AlertCircle className="w-3 h-3" />
          <span>No recording available for this archived exhibition</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center py-20 border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 mx-auto mb-4 text-slate-300">{icon}</div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
