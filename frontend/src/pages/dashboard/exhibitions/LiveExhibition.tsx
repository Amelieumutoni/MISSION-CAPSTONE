import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Send,
  Heart,
  Flame,
  Star,
  Smile,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { livekitToken } from "@/api/services/liveStream";
import { Track } from "livekit-client";

const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL ||
  "wss://livestreaming-yrj2soge.livekit.cloud";

interface ChatMessage {
  id: string;
  userId: string | null;
  displayName: string;
  avatar: string | null;
  message: string;
  role: "AUTHOR" | "VIEWER";
  timestamp: number;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

// ─── Floating reactions ───────────────────────────────────────────────────────
function FloatingReactions({ reactions }: { reactions: FloatingReaction[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-16 text-3xl animate-float-up"
          style={{ left: `${r.x}%` }}
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
}

// ─── Artist self-view ─────────────────────────────────────────────────────────
function ArtistSelfView({
  isMuted,
  isCameraOff,
  reactions,
}: {
  isMuted: boolean;
  isCameraOff: boolean;
  reactions: FloatingReaction[];
}) {
  const { localParticipant } = useLocalParticipant();

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.Microphone, withPlaceholder: true },
  ]);

  const localVideoTrack = tracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      t.participant.identity === localParticipant?.identity,
  );

  useEffect(() => {
    if (localParticipant) {
      const audioPublication = localParticipant.getTrackPublication(
        Track.Source.Microphone,
      );
      if (audioPublication?.track) {
        isMuted
          ? audioPublication.track.mute()
          : audioPublication.track.unmute();
      }
      const videoPublication = localParticipant.getTrackPublication(
        Track.Source.Camera,
      );
      if (videoPublication?.track) {
        isCameraOff
          ? videoPublication.track.mute()
          : videoPublication.track.unmute();
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

      <FloatingReactions reactions={reactions} />

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

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isArtist = msg.role === "AUTHOR";
  const initials = msg.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-2 px-1">
      <div
        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${
          isArtist
            ? "bg-red-500 text-white ring-1 ring-red-400"
            : "bg-zinc-700 text-zinc-200"
        }`}
      >
        {msg.avatar ? (
          <img
            src={msg.avatar}
            alt={initials}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`text-[10px] font-bold tracking-wider mr-1.5 ${isArtist ? "text-red-400" : "text-zinc-400"}`}
        >
          {isArtist ? "🎨 " : ""}
          {msg.displayName}
        </span>
        <span className="text-[13px] text-white/90 break-words leading-snug">
          {msg.message}
        </span>
      </div>
    </div>
  );
}

// ─── Artist chat panel ────────────────────────────────────────────────────────
function ArtistChat({
  messages,
  onSend,
  onReaction,
  isLive,
  artistName,
}: {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  onReaction: (emoji: string) => void;
  isLive: boolean;
  artistName: string;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !isLive) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const REACTIONS = ["❤️", "🔥", "⭐", "😍", "👏", "💎"];

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 border-l border-zinc-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`}
          />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            Live Chat
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
            <div className="text-3xl">💬</div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold">
              {isLive ? "No messages yet" : "Start streaming to enable chat"}
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reactions */}
      <div className="px-3 py-2 flex items-center gap-1.5 border-t border-zinc-800/60 flex-shrink-0">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReaction(emoji)}
            disabled={!isLive}
            className="text-lg hover:scale-125 transition-transform disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1 flex-shrink-0">
        <div
          className={`flex items-center gap-2 bg-zinc-900 border rounded-full px-3 py-2 transition-colors ${
            isLive
              ? "border-zinc-700 focus-within:border-red-800"
              : "border-zinc-800 opacity-40"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={handleKey}
            disabled={!isLive}
            placeholder={isLive ? `Reply as ${artistName}…` : "Go live to chat"}
            className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-600 outline-none min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !isLive}
            className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[9px] text-zinc-700 mt-1 text-right">
          {input.length}/200
        </p>
      </div>
    </div>
  );
}

// ─── Main artist page ─────────────────────────────────────────────────────────
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

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<BlobPart[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  const getArtistName = (): string => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "Artist";
      const parsed = JSON.parse(raw);
      return parsed?.name ?? parsed?.username ?? "Artist";
    } catch {
      return "Artist";
    }
  };

  const getArtistId = (): string | null => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id ?? parsed?.user_id ?? null;
    } catch {
      return null;
    }
  };

  const spawnFloatingReaction = useCallback((emoji: string) => {
    const rid = `${Date.now()}_${Math.random()}`;
    const x = 10 + Math.random() * 70;
    setFloatingReactions((prev) => [...prev, { id: rid, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== rid));
    }, 2500);
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socketRef.current || !isLive) return;
      socketRef.current.emit("chat-message", {
        exhibitionId: id,
        message,
        displayName: getArtistName(),
        userId: getArtistId(),
        avatar: null,
      });
    },
    [id, isLive],
  );

  const handleSendReaction = useCallback(
    (emoji: string) => {
      if (!socketRef.current || !isLive) return;
      socketRef.current.emit("send-reaction", {
        exhibitionId: id,
        reaction: emoji,
      });
      spawnFloatingReaction(emoji);
    },
    [id, isLive, spawnFloatingReaction],
  );

  useEffect(() => {
    setIsLoading(true);

    ExhibitionService.getExhibitionByIdByMe(id!)
      .then((res) => {
        setExhibition(res.data);
        const archived = res.data?.status === "ARCHIVED";
        setIsArchived(archived);
        if (archived)
          toast.error("This exhibition is archived and cannot be streamed");
      })
      .catch(() => toast.error("Failed to load exhibition details"))
      .finally(() => setIsLoading(false));

    const socket = io(window.location.origin, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-exhibition", { exhibitionId: id, role: "AUTHOR" });
    });

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
      setChatMessages([]);
      toast.info("Stream has ended");
    });

    // Chat events
    socket.on("chat-history", (history: ChatMessage[]) => {
      setChatMessages(history);
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg].slice(-100));
    });

    socket.on("reaction", ({ reaction }: { reaction: string }) => {
      spawnFloatingReaction(reaction);
    });

    return () => {
      socket.disconnect();
    };
  }, [id, spawnFloatingReaction]);

  const startStream = async () => {
    if (isArchived) {
      toast.error("Cannot start stream for archived exhibition");
      return;
    }

    setConnectionStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      localStreamRef.current = stream;

      try {
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9,opus",
        });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.current.push(e.data);
        };
        recorder.start(10000);
        mediaRecorderRef.current = recorder;
      } catch (recorderErr) {
        console.warn("Recording not supported:", recorderErr);
      }

      const response = await livekitToken(Number(id), "AUTHOR");
      let livekitTokenString: string;
      if (typeof response === "string") {
        livekitTokenString = response;
      } else if (response && typeof response.token === "string") {
        livekitTokenString = response.token;
      } else {
        throw new Error("Invalid token format received");
      }

      if (!livekitTokenString.startsWith("eyJ")) {
        throw new Error("Invalid token format - not a JWT");
      }

      setToken(livekitTokenString);
      socketRef.current?.emit("artist-go-live", { exhibitionId: id });
      setIsLive(true);
      setConnectionStatus("live");
      toast.success("You are now live!");
    } catch (err: any) {
      console.error("Start stream failed:", err);
      setConnectionStatus("idle");
      toast.error(`Failed to start: ${err.message}`);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    }
  };

  const endStream = async () => {
    if (isEnding) return;
    setIsEnding(true);
    const toastId = toast.loading("Ending stream...");

    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
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
                } catch (uploadErr) {
                  console.error("Failed to upload recording:", uploadErr);
                }
              }
              resolve();
            };
          } else resolve();
        });
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      socketRef.current?.emit("artist-end-stream", { exhibitionId: id });

      let retries = 3;
      while (retries > 0) {
        try {
          await ExhibitionService.endLiveStream(id!);
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setToken(null);
      setIsLive(false);
      setLiveKitConnected(false);
      setConnectionStatus("idle");
      setChatMessages([]);
      toast.success("Stream ended successfully", { id: toastId });

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
    if (isLive) setConnectionStatus("disconnected");
  };

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

  const artistName = exhibition?.author?.name || getArtistName();

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
        }
        .animate-float-up { animation: floatUp 2.5s ease-out forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      `}</style>

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
                <AlertCircle size={12} /> ARCHIVED
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

        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">
          {/* Title */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
              {exhibition?.title}
            </p>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-50">
              Live Studio
            </h1>
          </div>

          {/* Video + Chat side by side */}
          <div
            className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-800 overflow-hidden"
            style={{ height: "520px" }}
          >
            {/* Video */}
            <div className="relative flex-1 bg-zinc-900 min-h-64 lg:min-h-0">
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
                  <ArtistSelfView
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    reactions={floatingReactions}
                  />
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
                  <FloatingReactions reactions={floatingReactions} />
                </>
              )}
            </div>

            {/* Chat panel — only show when artist is live */}
            {isLive && liveKitConnected && (
              <div
                className="w-full lg:w-80 flex-shrink-0 flex flex-col"
                style={{ minHeight: "300px" }}
              >
                <ArtistChat
                  messages={chatMessages}
                  onSend={handleSendMessage}
                  onReaction={handleSendReaction}
                  isLive={isLive && liveKitConnected}
                  artistName={artistName}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isLive || !liveKitConnected || isArchived}
                className={`p-3 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isMuted
                    ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                disabled={!isLive || !liveKitConnected || isArchived}
                className={`p-3 border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isCameraOff
                    ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                }`}
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
                      <RefreshCw size={14} className="mr-2 animate-spin" />{" "}
                      Ending...
                    </>
                  ) : (
                    <>
                      <PhoneOff size={14} className="mr-2" /> End Stream
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
                label: "Messages",
                value: chatMessages.length,
                icon: <span className="text-sm">💬</span>,
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
    </>
  );
}
