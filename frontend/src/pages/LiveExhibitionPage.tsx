import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LiveKitRoom,
  VideoTrack,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft,
  Users,
  Radio,
  WifiOff,
  PlayCircle,
  ShoppingCart,
  Eye,
  ExternalLink,
  Loader2,
  Wifi,
  AlertCircle,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { livekitToken } from "@/api/services/liveStream";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/socket.io";
const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL ||
  "wss://livestreaming-yrj2soge.livekit.cloud";

type StreamState =
  | "waiting"
  | "live"
  | "ended"
  | "interrupted"
  | "joining"
  | "reconnecting";

function VideoRenderer({ viewerCount }: { viewerCount: number }) {
  const videoTracks = useTracks([{ source: Track.Source.Camera }], {
    onlySubscribed: true,
  });

  return (
    <div className="relative w-full h-full">
      {videoTracks.length > 0 ? (
        videoTracks.map((trackRef) => (
          <VideoTrack
            key={trackRef.publication?.trackSid}
            trackRef={trackRef}
            className="w-full h-full object-cover"
          />
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-black/50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm">Waiting for artist's video...</p>
          </div>
        </div>
      )}

      {/* Audio handled automatically */}
      <RoomAudioRenderer />

      {/* Overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest shadow-md">
        <span className="w-1.5 h-1.5 bg-white animate-pulse rounded-full" />
        LIVE
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full">
        <Users size={12} />
        {viewerCount} watching
      </div>
    </div>
  );
}

export default function ViewerLivePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [streamState, setStreamState] = useState<StreamState>("waiting");
  const [viewerCount, setViewerCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [liveKitConnected, setLiveKitConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [artistDisconnected, setArtistDisconnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const baseUrl = import.meta.env.BACKEND_IMAGE_URL || "/image";

  const handleJoinLive = useCallback(async () => {
    if (streamState !== "live" && streamState !== "interrupted") return;
    if (isJoining) return;

    setIsJoining(true);
    setHasInteracted(true);
    setStreamState("joining");

    try {
      console.log("Requesting LiveKit token for exhibition:", id);
      const response = await livekitToken(Number(id), "VIEWER");
      console.log("Token response:", response);

      let tokenStr: string;
      if (typeof response === "string") {
        tokenStr = response;
      } else if (response && typeof response.token === "string") {
        tokenStr = response.token;
      } else {
        throw new Error("Invalid token format received");
      }

      if (!tokenStr.startsWith("eyJ")) {
        throw new Error("Invalid token format - not a JWT");
      }

      console.log("Token received successfully");
      setToken(tokenStr);
      setStreamState("live");
      setArtistDisconnected(false);
      toast.success("Joined live stream!");
    } catch (err: any) {
      console.error("Failed to join live:", err);
      toast.error(`Could not connect to stream: ${err.message}`);
      setStreamState(streamState === "interrupted" ? "interrupted" : "waiting");
      setHasInteracted(false);
    } finally {
      setIsJoining(false);
    }
  }, [id, streamState, isJoining]);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser online");
      if (socketRef.current && !socketConnected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      console.log("Browser offline");
      toast.error("Internet connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [socketConnected]);

  useEffect(() => {
    // Only fetch initial data if we don't have a token yet
    if (!token) {
      setIsLoading(true);

      ExhibitionService.getExhibitionById(id!)
        .then((res) => {
          setExhibition(res.data);
          console.log("Exhibition data:", res.data);

          const exhibitionStatus = res.data?.status;
          console.log("Exhibition status:", exhibitionStatus);

          if (exhibitionStatus === "ARCHIVED") {
            console.log("Exhibition is ARCHIVED - stream ended");
            setStreamState("ended");
            setHasInteracted(false);
            setToken(null);
          } else {
            const liveDetails = res.data?.live_details;
            const streamStatus = liveDetails?.stream_status;

            console.log("Stream status:", streamStatus);

            if (streamStatus === "STREAMING") {
              setStreamState("live");
              // Don't reset hasInteracted if we're already interacting
              if (!hasInteracted) {
                setHasInteracted(false);
              }
            } else if (streamStatus === "IDLE") {
              setStreamState("waiting");
            } else if (streamStatus === "DISCONNECTED") {
              setStreamState("interrupted");
              setArtistDisconnected(true);
            } else {
              setStreamState("waiting");
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load exhibition:", err);
          toast.error("Failed to load exhibition details");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    // Socket connection - only set up once
    if (!socketRef.current) {
      const socket = io(window.location.origin, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["polling", "websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected successfully");
        setSocketConnected(true);
        setReconnectAttempt(0);
        socket.emit("join-exhibition", { exhibitionId: id, role: "VIEWER" });
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setSocketConnected(false);

        if (reason === "io server disconnect" || reason === "transport close") {
          // Server disconnected or network issue
          toast.error("Connection to server lost. Attempting to reconnect...");
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setSocketConnected(false);
      });

      socket.on("reconnect_attempt", (attempt) => {
        console.log("Reconnection attempt:", attempt);
        setStreamState("reconnecting");
        setReconnectAttempt(attempt);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        setSocketConnected(true);
        setStreamState((prev) => (prev === "reconnecting" ? "live" : prev));
        setReconnectAttempt(0);

        // Re-join the exhibition room
        socket.emit("join-exhibition", { exhibitionId: id, role: "VIEWER" });

        // If we were in a live state before, try to rejoin
        if (streamState === "live" && token) {
          handleJoinLive();
        }

        toast.success("Reconnected to server");
      });

      socket.on("reconnect_failed", () => {
        console.log("Socket reconnection failed");
        setStreamState("interrupted");
        toast.error("Failed to reconnect. Please refresh the page.");
      });

      socket.on("stream-started", () => {
        console.log("Stream started event received");
        setToken(null);
        setLiveKitConnected(false);
        setHasInteracted(false);
        setArtistDisconnected(false);
        setStreamState("live");
        toast.success("Artist is now live!");
      });

      socket.on("stream-ended", () => {
        console.log("Stream ended event received");
        setStreamState("ended");
        setToken(null);
        setLiveKitConnected(false);
        setHasInteracted(false);
        setArtistDisconnected(false);
        toast.info("The live stream has ended");
      });

      socket.on("stream-interrupted", () => {
        console.log("Stream interrupted event received");
        setStreamState("interrupted");
        setArtistDisconnected(true);
        setLiveKitConnected(false);
        toast.error("Artist lost connection. Waiting for them to reconnect...");

        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Auto-reconnect logic for viewers if they were previously connected
        if (token) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (streamState === "interrupted" && artistDisconnected) {
              // Don't auto-reconnect, just show message
              toast.info(
                "Artist is still disconnected. You can try to rejoin when they're back.",
              );
            }
          }, 10000);
        }
      });

      socket.on("viewer-count-update", ({ count }) => {
        setViewerCount(count);
      });
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id, token, hasInteracted, handleJoinLive]);

  const handleLiveKitConnect = () => {
    setLiveKitConnected(true);
    console.log("Connected to LiveKit");
  };

  const handleLiveKitDisconnect = () => {
    setLiveKitConnected(false);
    if (streamState === "live") {
      setStreamState("interrupted");
      toast.error("Disconnected from stream");
    }
  };

  const handleReconnect = () => {
    handleJoinLive();
  };

  const handleBackToWaiting = () => {
    setStreamState("waiting");
    setHasInteracted(false);
    setToken(null);
    setArtistDisconnected(false);
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const bannerImage = exhibition?.banner_image
    ? exhibition.banner_image.startsWith("http")
      ? exhibition.banner_image
      : `${baseUrl}${exhibition.banner_image}`
    : "https://via.placeholder.com/1280x720?text=Exhibition+Banner";

  // Show LiveKit room if we have a token and we're in live state
  const showLiveKitRoom =
    token && streamState === "live" && hasInteracted && !artistDisconnected;

  if (isLoading && !token) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  console.log("Current state:", {
    streamState,
    hasInteracted,
    token: token ? "present" : null,
    liveKitConnected,
    isJoining,
    socketConnected,
    artistDisconnected,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Toaster richColors theme="system" />

      <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3">
          {streamState === "live" && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-red-500 text-red-500 bg-red-50 dark:bg-red-950/30 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-red-500 animate-pulse rounded-full" />
              {liveKitConnected ? "LIVE" : "CONNECTING"}
            </div>
          )}
          {streamState === "interrupted" && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/30 text-[10px] font-bold uppercase tracking-widest">
              <WifiOff size={12} />
              {artistDisconnected ? "ARTIST OFFLINE" : "DISCONNECTED"}
            </div>
          )}
          {streamState === "reconnecting" && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/30 text-[10px] font-bold uppercase tracking-widest">
              <Loader2 size={12} className="animate-spin" />
              RECONNECTING
            </div>
          )}
          {streamState === "ended" && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest">
              ENDED
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
            <Users size={12} />
            {viewerCount}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
            Live Exhibition
          </p>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-50">
            {exhibition?.title || "Live Exhibition"}
          </h1>
        </div>

        <div className="relative w-full aspect-video bg-zinc-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          {showLiveKitRoom ? (
            <LiveKitRoom
              token={token}
              serverUrl={LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              onConnected={handleLiveKitConnect}
              onDisconnected={handleLiveKitDisconnect}
              options={{
                adaptiveStream: true,
                dynacast: true,
              }}
            >
              <VideoRenderer viewerCount={viewerCount} />
            </LiveKitRoom>
          ) : (
            <>
              <img
                src={bannerImage}
                alt="Exhibition Banner"
                className="w-full h-full object-cover brightness-75"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-white text-center px-6">
                {streamState === "waiting" && (
                  <>
                    <Radio
                      size={80}
                      className="mb-8 opacity-70 animate-pulse"
                    />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                      Live Stream Coming Soon
                    </h2>
                    <p className="text-xl md:text-2xl opacity-90 max-w-3xl mb-10">
                      The artist hasn't started broadcasting yet. Check back
                      soon!
                    </p>
                  </>
                )}

                {streamState === "live" && !hasInteracted && (
                  <>
                    <PlayCircle
                      size={100}
                      className="mb-8 text-red-500 drop-shadow-lg"
                    />
                    <h2 className="text-5xl font-bold mb-6">Live Now!</h2>
                    <p className="text-2xl opacity-90 mb-10 max-w-2xl">
                      The exhibition is broadcasting live right now
                    </p>
                    <button
                      onClick={handleJoinLive}
                      disabled={isJoining}
                      className={`px-12 py-6 bg-red-600 hover:bg-red-700 text-white font-bold text-2xl transition-all transform hover:scale-105 flex items-center gap-4 ${
                        isJoining ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isJoining ? (
                        <Loader2 size={32} className="animate-spin" />
                      ) : (
                        <PlayCircle size={32} />
                      )}
                      {isJoining ? "Connecting..." : "Join Live Stream"}
                    </button>
                  </>
                )}

                {streamState === "joining" && (
                  <>
                    <Loader2
                      size={80}
                      className="mb-8 animate-spin text-red-500"
                    />
                    <h2 className="text-4xl font-bold mb-6">
                      Connecting to Stream...
                    </h2>
                    <p className="text-xl opacity-90 mb-10">
                      Please wait while we establish connection
                    </p>
                  </>
                )}

                {streamState === "interrupted" && (
                  <>
                    <WifiOff size={80} className="mb-8 text-amber-500" />
                    <h2 className="text-4xl font-bold mb-6">
                      {artistDisconnected
                        ? "Artist Disconnected"
                        : "Connection Interrupted"}
                    </h2>
                    <p className="text-xl opacity-90 mb-10 max-w-2xl">
                      {artistDisconnected
                        ? "The artist has left the stream. They may have refreshed the page or lost connection."
                        : "The connection to the stream was lost."}
                    </p>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-white/70">
                        {artistDisconnected
                          ? "Please wait for the artist to return. You can try to rejoin when they're back."
                          : "The artist may be reconnecting. You can try to reconnect manually."}
                      </p>
                      <div className="flex gap-4 justify-center">
                        {!artistDisconnected && (
                          <button
                            onClick={handleReconnect}
                            disabled={isJoining}
                            className="px-10 py-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl disabled:opacity-50"
                          >
                            {isJoining ? "Connecting..." : "Try Reconnecting"}
                          </button>
                        )}
                        <button
                          onClick={handleBackToWaiting}
                          className="px-10 py-5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xl"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={handleRefreshPage}
                          className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {streamState === "reconnecting" && (
                  <>
                    <Loader2
                      size={80}
                      className="mb-8 animate-spin text-amber-500"
                    />
                    <h2 className="text-4xl font-bold mb-6">
                      Reconnecting to Server...
                    </h2>
                    <p className="text-xl opacity-90 mb-10">
                      Attempt {reconnectAttempt} of 10
                    </p>
                  </>
                )}

                {streamState === "ended" && (
                  <>
                    <h2 className="text-5xl font-serif mb-8">
                      Stream Has Ended
                    </h2>
                    <p className="text-2xl opacity-90 mb-10">
                      Thank you for being part of this exhibition
                    </p>
                    <button
                      onClick={() => navigate(-1)}
                      className="px-12 py-6 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-2xl"
                    >
                      Return to Gallery
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {exhibition && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 dark:border-slate-800 pt-10">
            <div className="md:col-span-2 p-8 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 space-y-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                About this Exhibition
              </p>
              <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {exhibition.description || "No description provided."}
              </p>
            </div>

            <div className="p-8 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 space-y-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                Details
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Artist
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {exhibition.author?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Artworks
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {exhibition.artworks?.length || 0} pieces
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {exhibition?.artworks && exhibition.artworks.length > 0 && (
          <div className="space-y-8 border-t border-slate-100 dark:border-slate-800 pt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 font-bold">
                  Works in this Exhibition
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Acquire pieces directly from the artist
                </p>
              </div>
              <button
                onClick={() => navigate("/shop")}
                className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Full Shop <ExternalLink size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibition.artworks.map((art) => (
                <div
                  key={art.artwork_id}
                  className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition-all hover:shadow-md"
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        art.main_image?.startsWith("http")
                          ? art.main_image
                          : `${baseUrl}${art.main_image}`
                      }
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {art.status === "SOLD" && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm font-bold uppercase tracking-widest border-2 border-white/40 px-6 py-3 rounded">
                          Sold
                        </span>
                      </div>
                    )}
                    {art.status !== "SOLD" && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() =>
                            navigate(`/artworks/${art.artwork_id}`)
                          }
                          className="bg-white text-slate-900 px-6 py-3 text-sm uppercase tracking-widest font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg"
                        >
                          <Eye size={16} /> View Details
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="font-serif text-lg truncate text-slate-900 dark:text-slate-100">
                          {art.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                          {art.technique || "Original"}
                        </p>
                      </div>
                      {art.price && (
                        <p className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100 flex-shrink-0">
                          ${parseFloat(art.price).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {art.status === "AVAILABLE" ? (
                      <button
                        onClick={() => navigate(`/artworks/${art.artwork_id}`)}
                        className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm uppercase tracking-widest font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 rounded"
                      >
                        <ShoppingCart size={16} />
                        Acquire
                      </button>
                    ) : (
                      <div className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-widest font-bold text-center">
                        Not Available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artist offline warning */}
        {artistDisconnected && streamState === "interrupted" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                Artist Disconnected
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                The artist has left the stream. This usually happens when they
                refresh the page or lose connection. They should be back
                shortly. You don't need to do anything.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
