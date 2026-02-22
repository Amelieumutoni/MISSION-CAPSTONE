import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Users,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowLeft,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { livekitToken } from "@/api/services/liveStream";
import { Track } from "livekit-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL ||
  "wss://livestreaming-yrj2soge.livekit.cloud";

/**
 * Renders the artist's local camera and mic preview with controls
 */
function ArtistSelfView({
  isMuted,
  isCameraOff,
}: {
  isMuted: boolean;
  isCameraOff: boolean;
}) {
  const { localParticipant } = useLocalParticipant();

  // Get local tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: true },
  ]);

  const localVideoTrack = tracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      t.participant.identity === localParticipant?.identity,
  );

  // Apply mute/camera state to local participant
  useEffect(() => {
    if (localParticipant) {
      // Handle microphone mute
      const audioPublication = localParticipant.getTrackPublication(
        Track.Source.Microphone,
      );
      if (audioPublication?.track) {
        if (isMuted) {
          audioPublication.track.mute();
        } else {
          audioPublication.track.unmute();
        }
      }

      // Handle camera on/off
      const videoPublication = localParticipant.getTrackPublication(
        Track.Source.Camera,
      );
      if (videoPublication?.track) {
        if (isCameraOff) {
          videoPublication.track.mute();
        } else {
          videoPublication.track.unmute();
        }
      }
    }
  }, [isMuted, isCameraOff, localParticipant]);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
      {localVideoTrack && !isCameraOff ? (
        <VideoTrack
          trackRef={localVideoTrack}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-white/50">
          <VideoOff size={48} strokeWidth={1} />
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
            Camera {isCameraOff ? "Disabled" : "Loading..."}
          </p>
        </div>
      )}

      {/* Audio indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
        {isMuted ? (
          <MicOff size={14} className="text-red-400" />
        ) : (
          <Mic size={14} className="text-green-400" />
        )}
        <span className="text-[8px] uppercase tracking-wider text-white/80">
          {isMuted ? "Muted" : "Live"}
        </span>
      </div>
    </div>
  );
}

export default function ArtistLivePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "live" | "disconnected"
  >("idle");
  const [liveKitConnected, setLiveKitConnected] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Fetch exhibition data
    ExhibitionService.getExhibitionByIdByMe(id!)
      .then((res) => {
        setExhibition(res.data);
        // Check if exhibition is archived
        const archived = res.data?.status === "ARCHIVED";
        setIsArchived(archived);

        if (archived) {
          toast.error("This exhibition is archived and cannot be streamed");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch exhibition:", err);
        toast.error("Failed to load exhibition details");
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.emit("join-exhibition", { exhibitionId: id, role: "AUTHOR" });

    socket.on("viewer-count-update", ({ count }) => setViewerCount(count));

    socket.on("stream-interrupted", () => {
      setConnectionStatus("disconnected");
      toast.error("Stream interrupted. Check your connection.");
    });

    socket.on("stream-ended", () => {
      setConnectionStatus("idle");
      setIsLive(false);
      setToken(null);
      setLiveKitConnected(false);
      toast.info("Stream has ended");
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const startStream = async () => {
    // Don't allow starting stream if exhibition is archived
    if (isArchived) {
      toast.error("Cannot start stream for archived exhibition");
      return;
    }

    setConnectionStatus("connecting");

    try {
      // 1. Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      localStreamRef.current = stream;

      // 2. Start recording for VOD
      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.current.push(e.data);
        };
        recorder.start(10000); // chunks every 10s
        mediaRecorderRef.current = recorder;
      } catch (recorderErr) {
        console.warn(
          "Recording not supported, continuing without recording:",
          recorderErr,
        );
      }

      // 3. Get LiveKit token
      const response = await livekitToken(Number(id), "AUTHOR");

      // Handle different response formats
      let livekitTokenString: string;
      if (typeof response === "string") {
        livekitTokenString = response;
      } else if (response && typeof response.token === "string") {
        livekitTokenString = response.token;
      } else {
        throw new Error("Invalid token format received");
      }

      // Validate token format (JWT starts with eyJ)
      if (!livekitTokenString.startsWith("eyJ")) {
        throw new Error("Invalid token format - not a JWT");
      }

      setToken(livekitTokenString);

      // 4. Notify backend that stream is starting
      socketRef.current?.emit("artist-go-live", { exhibitionId: id });

      // 5. Update local state (LiveKit connection will happen via LiveKitRoom)
      setIsLive(true);
      setConnectionStatus("live");

      toast.success("You are now live!");
    } catch (err: any) {
      console.error("Start stream failed:", err);
      setConnectionStatus("idle");
      toast.error(`Failed to start: ${err.message}`);

      // Clean up stream if error occurred
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    }
  };

  const endStream = async () => {
    if (isEnding) return; // Prevent multiple end attempts

    setIsEnding(true);
    const toastId = toast.loading("Ending stream...");

    try {
      // 1. Stop recording if active
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();

        // Wait for final data
        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => {
              if (recordedChunks.current.length > 0) {
                const blob = new Blob(recordedChunks.current, {
                  type: "video/webm",
                });

                try {
                  const file = new File([blob], `stream-${Date.now()}.webm`, {
                    type: "video/webm",
                  });
                  await ExhibitionService.uploadRecording(id!, file);
                  console.log("Recording uploaded successfully");
                } catch (uploadErr) {
                  console.error("Failed to upload recording:", uploadErr);
                }
              }
              resolve();
            };
          } else {
            resolve();
          }
        });
      }

      // 2. Stop all media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => {
          t.stop();
          console.log("Track stopped:", t.kind);
        });
        localStreamRef.current = null;
      }

      // 3. Notify backend via socket
      if (socketRef.current) {
        socketRef.current.emit("artist-end-stream", { exhibitionId: id });
        console.log("Socket event emitted: artist-end-stream");
      }

      // 4. Update backend via REST API with retry
      let retries = 3;
      let success = false;

      while (retries > 0 && !success) {
        try {
          await ExhibitionService.endLiveStream(id!);
          success = true;
          console.log("REST API call successful: endLiveStream");
        } catch (err) {
          retries--;
          console.log(`REST API call failed, retries left: ${retries}`);
          if (retries === 0) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // 5. Clear LiveKit connection
      setToken(null);
      setIsLive(false);
      setLiveKitConnected(false);
      setConnectionStatus("idle");

      toast.success("Stream ended successfully", { id: toastId });

      // Navigate after a short delay to ensure all cleanup is done
      setTimeout(() => {
        navigate(`/dashboard/exhibitions/${id}`, { replace: true });
      }, 500);
    } catch (err) {
      console.error("Error ending stream:", err);
      toast.error("Failed to end stream properly", { id: toastId });
      setConnectionStatus("live");
      setIsEnding(false);
    }
  };

  const handleLiveKitConnect = () => {
    setLiveKitConnected(true);
    toast.success("Connected to streaming server");
  };

  const handleLiveKitDisconnect = () => {
    setLiveKitConnected(false);
    if (isLive) {
      setConnectionStatus("disconnected");
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleCamera = () => setIsCameraOff(!isCameraOff);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-red-500 border-slate-200 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Toaster richColors theme="system" />

      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3">
          {isArchived && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest">
              <AlertCircle size={12} />
              ARCHIVED
            </div>
          )}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
              isArchived
                ? "border-slate-300 text-slate-400"
                : connectionStatus === "live" && liveKitConnected
                  ? "border-red-500 text-red-500 bg-red-50 dark:bg-red-950/30"
                  : connectionStatus === "connecting"
                    ? "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                    : connectionStatus === "disconnected"
                      ? "border-slate-400 text-slate-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-400"
            }`}
          >
            {connectionStatus === "live" && liveKitConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
            {isArchived
              ? "ARCHIVED"
              : connectionStatus === "live" && liveKitConnected
                ? "Live"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "disconnected"
                    ? "Disconnected"
                    : "Offline"}
          </div>

          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              <Users size={12} />
              {viewerCount}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
            {exhibition?.title}
          </p>
          <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-50">
            Live Studio
          </h1>
        </div>

        {/* Video Preview */}
        <div className="relative w-full aspect-video bg-zinc-900 border border-slate-200 dark:border-slate-800 overflow-hidden rounded-lg">
          {token && isLive && !isArchived ? (
            <LiveKitRoom
              token={token}
              serverUrl={LIVEKIT_URL}
              connect={true}
              video={true}
              audio={true}
              onConnected={handleLiveKitConnect}
              onDisconnected={handleLiveKitDisconnect}
              options={{
                publishDefaults: {
                  videoSimulcastLayers: true,
                  videoCodec: "vp9",
                },
              }}
            >
              <ArtistSelfView isMuted={isMuted} isCameraOff={isCameraOff} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <>
              {isArchived ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                  <AlertCircle size={64} className="mb-4 text-slate-400" />
                  <h2 className="text-2xl font-bold mb-2">
                    Exhibition Archived
                  </h2>
                  <p className="text-sm text-slate-400 mb-6">
                    This exhibition has ended and cannot be streamed
                  </p>
                  <Button
                    onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
                    className="rounded-none px-6 py-3 bg-slate-700 hover:bg-slate-600"
                  >
                    Return to Details
                  </Button>
                </div>
              ) : !isLive && connectionStatus === "idle" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600">
                  <Video
                    size={48}
                    strokeWidth={1}
                    className="mb-4 opacity-30"
                  />
                  <p className="text-[10px] uppercase tracking-widest font-bold">
                    Camera preview will appear here
                  </p>
                </div>
              ) : connectionStatus === "connecting" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-t-red-500 border-white/20 rounded-full animate-spin" />
                    <p className="text-white text-[10px] uppercase tracking-widest animate-pulse font-bold">
                      Initializing Stream...
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              disabled={!isLive || !liveKitConnected || isArchived}
              className={`p-3 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isMuted
                  ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={toggleCamera}
              disabled={!isLive || !liveKitConnected || isArchived}
              className={`p-3 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isCameraOff
                  ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
              }`}
              title={isCameraOff ? "Turn camera on" : "Turn camera off"}
            >
              {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!isLive && !isArchived ? (
              <Button
                onClick={startStream}
                disabled={connectionStatus === "connecting" || isEnding}
                className="rounded-none px-10 py-6 uppercase text-[10px] tracking-widest font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                <Radio size={14} className="mr-2" />
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Go Live"}
              </Button>
            ) : isLive && !isArchived ? (
              <Button
                onClick={endStream}
                disabled={isEnding}
                className="rounded-none px-10 py-6 uppercase text-[10px] tracking-widest font-bold bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-700 disabled:opacity-50"
              >
                {isEnding ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <PhoneOff size={14} className="mr-2" />
                    End Stream
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Info Panel */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {[
            {
              label: "Connection",
              value: isArchived
                ? "ARCHIVED"
                : connectionStatus === "live" && liveKitConnected
                  ? "CONNECTED"
                  : connectionStatus.toUpperCase(),
              icon: isArchived ? (
                <AlertCircle size={14} className="text-slate-400" />
              ) : connectionStatus === "live" && liveKitConnected ? (
                <Wifi size={14} className="text-emerald-500" />
              ) : (
                <WifiOff size={14} className="text-slate-300" />
              ),
            },
            {
              label: "Viewers",
              value: isArchived ? "0" : viewerCount,
              icon: <Users size={14} className="text-slate-400" />,
            },
            {
              label: "Status",
              value: isArchived
                ? "Ended"
                : isLive && liveKitConnected
                  ? "Broadcasting"
                  : "Standby",
              icon: (
                <Radio
                  size={14}
                  className={
                    isArchived
                      ? "text-slate-400"
                      : isLive && liveKitConnected
                        ? "text-red-500"
                        : "text-slate-300"
                  }
                />
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 space-y-2"
            >
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
                {stat.icon}
                {stat.label}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
