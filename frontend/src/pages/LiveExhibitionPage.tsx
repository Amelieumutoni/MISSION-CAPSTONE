import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  LiveKitRoom,
  VideoTrack,
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
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
  AlertCircle,
  Send,
  Heart,
  Flame,
  Star,
  Smile,
  UserPlus,
  UserMinus,
  Crown,
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { livekitToken } from "@/api/services/liveStream";

const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL ||
  "wss://livestreaming-yrj2soge.livekit.cloud";

const BASE_URL = import.meta.env.BACKEND_IMAGE_URL || "/image";

type StreamState =
  | "waiting"
  | "live"
  | "ended"
  | "interrupted"
  | "joining"
  | "reconnecting";

type CoStreamState = "idle" | "pending" | "accepted" | "rejected" | "removed";

interface ChatMessage {
  id: string;
  userId: string | null;
  displayName: string;
  avatar: string | null;
  message: string;
  role: "AUTHOR" | "VIEWER" | "CO_STREAMER";
  timestamp: number;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

// ----------------------------------------------------------------------
// Floating reactions overlay
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// Video renderer for ordinary viewers (shows all camera tracks)
// ----------------------------------------------------------------------
function VideoRenderer({
  viewerCount,
  reactions,
}: {
  viewerCount: number;
  reactions: FloatingReaction[];
}) {
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
            <p className="text-sm font-light tracking-wider">
              Waiting for artist's video...
            </p>
          </div>
        </div>
      )}

      <RoomAudioRenderer />
      <FloatingReactions reactions={reactions} />

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

// ----------------------------------------------------------------------
// Co‑streamer view (PiP + stage controls)
// ----------------------------------------------------------------------
function CoStreamerView({
  isMuted,
  isCameraOff,
  reactions,
  onLeave,
}: {
  isMuted: boolean;
  isCameraOff: boolean;
  reactions: FloatingReaction[];
  onLeave: () => void;
}) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!localParticipant) return;
    const audioPub = localParticipant.getTrackPublication(
      Track.Source.Microphone,
    );
    if (audioPub?.track)
      isMuted ? audioPub.track.mute() : audioPub.track.unmute();
    const videoPub = localParticipant.getTrackPublication(Track.Source.Camera);
    if (videoPub?.track)
      isCameraOff ? videoPub.track.mute() : videoPub.track.unmute();
  }, [isMuted, isCameraOff, localParticipant]);

  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false },
  );
  const visibleTracks = cameraTracks.filter(
    (t) => t.participant.identity !== localParticipant?.identity,
  );

  // Self video for PiP
  const selfVideoTrack = cameraTracks.find(
    (t) => t.participant.identity === localParticipant?.identity,
  );

  return (
    <div className="relative w-full h-full">
      {/* All other participants' videos */}
      {visibleTracks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <Radio
            size={48}
            strokeWidth={1}
            className="text-white/20 animate-pulse"
          />
        </div>
      ) : visibleTracks.length === 1 ? (
        <div className="absolute inset-0 bg-zinc-950">
          <VideoTrack
            trackRef={visibleTracks[0]}
            className="w-full h-full object-cover"
          />
          <ParticipantLabel
            identity={visibleTracks[0].participant.identity}
            name={visibleTracks[0].participant.name}
            localIdentity={localParticipant?.identity}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-zinc-950">
          <div
            className={`w-full h-full grid gap-px bg-zinc-800 ${
              visibleTracks.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 grid-rows-2"
            }`}
          >
            {visibleTracks.map((trackRef) => (
              <div
                key={trackRef.participant.identity}
                className="relative bg-zinc-900 overflow-hidden"
              >
                <VideoTrack
                  trackRef={trackRef}
                  className="w-full h-full object-cover"
                />
                <ParticipantLabel
                  identity={trackRef.participant.identity}
                  name={trackRef.participant.name}
                  localIdentity={localParticipant?.identity}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <FloatingReactions reactions={reactions} />

      {/* Self PiP */}
      <div className="absolute bottom-4 right-4 w-28 h-20 bg-zinc-900 border-2 border-zinc-700 overflow-hidden rounded-sm shadow-2xl z-20">
        {selfVideoTrack && !isCameraOff && selfVideoTrack.publication ? (
          <VideoTrack
            trackRef={selfVideoTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <VideoOff size={16} />
          </div>
        )}
        <div className="absolute bottom-1 left-1 text-[7px] text-white/60 font-bold bg-black/50 px-1 rounded-sm uppercase">
          You
        </div>
      </div>

      <button
        onClick={onLeave}
        className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 backdrop-blur px-3 py-1.5 text-white text-[9px] font-bold uppercase tracking-widest transition-colors z-20"
      >
        <UserMinus size={11} />
        Leave Stage
      </button>
    </div>
  );
}

function ParticipantLabel({
  identity,
  name,
  localIdentity,
}: {
  identity: string;
  name: string | undefined;
  localIdentity: string | undefined;
}) {
  const isSelf = identity === localIdentity;
  const isGuest =
    identity.startsWith("viewer_") || identity.startsWith("guest_");

  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-1 rounded-full">
      <Crown
        size={9}
        className={
          isSelf
            ? "text-yellow-400"
            : isGuest
              ? "text-indigo-400"
              : "text-yellow-400"
        }
      />
      <span className="text-[9px] text-white/90 uppercase tracking-wide font-bold">
        {isSelf ? "You" : name || "Artist"}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------
// Chat bubble (updated to handle CO_STREAMER role)
// ----------------------------------------------------------------------
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isArtist = msg.role === "AUTHOR";
  const isCoStreamer = msg.role === "CO_STREAMER";
  const initials = msg.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-2 group px-1">
      <div
        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${
          isArtist
            ? "bg-red-500 text-white ring-1 ring-red-400"
            : isCoStreamer
              ? "bg-indigo-500 text-white ring-1 ring-indigo-400"
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
          className={`text-[10px] font-bold tracking-wider mr-1.5 ${
            isArtist
              ? "text-red-400"
              : isCoStreamer
                ? "text-indigo-400"
                : "text-zinc-400"
          }`}
        >
          {isArtist ? "🎨 " : isCoStreamer ? "🎤 " : ""}
          {msg.displayName}
        </span>
        <span className="text-[13px] text-white/90 break-words leading-snug">
          {msg.message}
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Live Chat panel (unchanged aside from using updated ChatBubble)
// ----------------------------------------------------------------------
function LiveChat({
  messages,
  onSend,
  onReaction,
  displayName,
  isLive,
}: {
  messages: ChatMessage[];
  onSend: (msg: string) => void;
  onReaction: (emoji: string) => void;
  displayName: string;
  isLive: boolean;
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

  const REACTIONS = [
    { emoji: "❤️", icon: Heart },
    { emoji: "🔥", icon: Flame },
    { emoji: "⭐", icon: Star },
    { emoji: "😍", icon: Smile },
    { emoji: "👏", icon: null },
    { emoji: "💎", icon: null },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 border-l border-zinc-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
            Live Chat
          </span>
        </div>
        {!isLive && (
          <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
            Stream ended
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
            <div className="text-3xl">💬</div>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold">
              Be the first to say something
            </p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reactions row */}
      <div className="px-3 py-2 flex items-center gap-1.5 border-t border-zinc-800/60 flex-shrink-0">
        {REACTIONS.map(({ emoji }) => (
          <button
            key={emoji}
            onClick={() => onReaction(emoji)}
            disabled={!isLive}
            className="text-lg hover:scale-125 transition-transform disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            title={`React with ${emoji}`}
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
              ? "border-zinc-700 focus-within:border-zinc-500"
              : "border-zinc-800 opacity-50"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={handleKey}
            disabled={!isLive}
            placeholder={isLive ? `Comment as ${displayName}…` : "Stream ended"}
            className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-600 outline-none min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !isLive}
            className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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

// ----------------------------------------------------------------------
// Join-stage button (from first component)
// ----------------------------------------------------------------------
function JoinStageButton({
  coStreamState,
  onRequest,
  onCancel,
}: {
  coStreamState: CoStreamState;
  onRequest: () => void;
  onCancel: () => void;
}) {
  if (coStreamState === "idle") {
    return (
      <button
        onClick={onRequest}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-[10px] font-bold uppercase tracking-widest"
      >
        <UserPlus size={13} />
        Request to Join
      </button>
    );
  }

  if (coStreamState === "pending") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2.5 border border-amber-500/50 text-amber-400 bg-amber-950/20 text-[10px] font-bold uppercase tracking-widest">
          <Loader2 size={13} className="animate-spin" />
          Waiting for artist...
        </div>
        <button
          onClick={onCancel}
          className="p-2.5 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          title="Cancel request"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  if (coStreamState === "rejected") {
    return (
      <button
        onClick={onRequest}
        className="flex items-center gap-2 px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors text-[10px] font-bold uppercase tracking-widest"
      >
        <UserPlus size={13} />
        Request Again
      </button>
    );
  }

  return null;
}

// ----------------------------------------------------------------------
// Main viewer page (merged)
// ----------------------------------------------------------------------
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
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [artistDisconnected, setArtistDisconnected] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);

  // Co‑streaming state
  const [coStreamState, setCoStreamState] = useState<CoStreamState>("idle");
  const [coStreamToken, setCoStreamToken] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Helper to get user info
  const getViewerInfo = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { displayName: "Guest", userId: null, avatar: null };
      const parsed = JSON.parse(raw);
      return {
        displayName: parsed?.name ?? parsed?.username ?? "Guest",
        userId: parsed?.id ?? parsed?.user_id ?? null,
        avatar: parsed?.avatar ?? null,
      };
    } catch {
      return { displayName: "Guest", userId: null, avatar: null };
    }
  };

  // Spawn a floating reaction
  const spawnFloatingReaction = useCallback((emoji: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    const x = 10 + Math.random() * 70;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  }, []);

  // Send a chat message
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!socketRef.current || streamState !== "live") return;
      const { displayName, userId, avatar } = getViewerInfo();
      socketRef.current.emit("chat-message", {
        exhibitionId: id,
        message,
        displayName,
        userId,
        avatar,
      });
    },
    [id, streamState],
  );

  // Send a reaction
  const handleSendReaction = useCallback(
    (emoji: string) => {
      if (!socketRef.current || streamState !== "live") return;
      socketRef.current.emit("send-reaction", {
        exhibitionId: id,
        reaction: emoji,
      });
      spawnFloatingReaction(emoji);
    },
    [id, streamState, spawnFloatingReaction],
  );

  // Co‑streaming actions
  const handleRequestCoStream = useCallback(() => {
    if (!socketRef.current) return;
    const { displayName, userId, avatar } = getViewerInfo();
    socketRef.current.emit("request-costream", {
      exhibitionId: id,
      userId,
      displayName,
      avatar,
    });
  }, [id]);

  const handleCancelRequest = useCallback(() => {
    socketRef.current?.emit("cancel-costream-request", { exhibitionId: id });
    setCoStreamState("idle");
  }, [id]);

  const handleLeaveStage = useCallback(() => {
    socketRef.current?.emit("remove-costreamer", { exhibitionId: id });
    setCoStreamState("idle");
    setCoStreamToken(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [id]);

  // Join live stream (viewer)
  const handleJoinLive = useCallback(async () => {
    if (streamState !== "live" && streamState !== "interrupted") return;
    if (isJoining) return;

    setIsJoining(true);
    setHasInteracted(true);
    setStreamState("joining");

    try {
      const response = await livekitToken(Number(id), "VIEWER");

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

      setToken(tokenStr);
      setStreamState("live");
      setArtistDisconnected(false);

      socketRef.current?.emit("viewer-watching", {
        exhibitionId: id,
        userId: getViewerInfo().userId,
        displayName: getViewerInfo().displayName,
      });

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

  // Online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (socketRef.current?.disconnected) socketRef.current.connect();
    };
    const handleOffline = () => toast.error("Internet connection lost");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Socket + initial data
  useEffect(() => {
    setIsLoading(true);
    ExhibitionService.getExhibitionById(id!)
      .then((res) => {
        setExhibition(res.data);
        if (res.data?.status === "ARCHIVED") {
          setStreamState("ended");
          return;
        }
        const streamStatus = res.data?.live_details?.stream_status;
        if (streamStatus === "STREAMING") setStreamState("live");
        else if (streamStatus === "DISCONNECTED") {
          setStreamState("interrupted");
          setArtistDisconnected(true);
        } else setStreamState("waiting");
      })
      .catch(() => toast.error("Failed to load exhibition details"))
      .finally(() => setIsLoading(false));

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
      socket.emit("join-exhibition", { exhibitionId: id, role: "VIEWER" });
    });

    socket.on("reconnect_attempt", (attempt) => {
      setStreamState("reconnecting");
      setReconnectAttempt(attempt);
    });

    socket.on("reconnect", () => {
      setStreamState((prev) => (prev === "reconnecting" ? "live" : prev));
      setReconnectAttempt(0);
      socket.emit("join-exhibition", { exhibitionId: id, role: "VIEWER" });
      toast.success("Reconnected");
    });

    socket.on("reconnect_failed", () => {
      setStreamState("interrupted");
      toast.error("Failed to reconnect. Please refresh the page.");
    });

    socket.on("stream-is-live", () => {
      setStreamState((prev) =>
        prev === "waiting" || prev === "reconnecting" ? "live" : prev,
      );
    });

    socket.on("stream-started", () => {
      setToken(null);
      setLiveKitConnected(false);
      setHasInteracted(false);
      setArtistDisconnected(false);
      setChatMessages([]); // fresh chat for new stream
      setStreamState("live");
      toast.success("Artist is now live!");
    });

    socket.on("stream-ended", () => {
      setStreamState("ended");
      setToken(null);
      setLiveKitConnected(false);
      setHasInteracted(false);
      setArtistDisconnected(false);
      setChatMessages([]); // wipe chat when stream ends
      toast.info("The live stream has ended");
    });

    socket.on("stream-interrupted", () => {
      setStreamState("interrupted");
      setArtistDisconnected(true);
      setLiveKitConnected(false);
      toast.error("Artist lost connection. Waiting for them to reconnect...");
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        toast.info("Artist is still disconnected. Hang tight.");
      }, 10000);
    });

    socket.on("viewer-count-update", ({ count }: { count: number }) => {
      setViewerCount(count);
    });

    // Chat events
    socket.on("chat-history", (history: ChatMessage[]) => {
      setChatMessages(history);
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setChatMessages((prev) => {
        const updated = [...prev, msg];
        return updated.slice(-100); // keep last 100 in UI
      });
    });

    socket.on("reaction", ({ reaction }: { reaction: string }) => {
      spawnFloatingReaction(reaction);
    });

    // Co‑stream events
    socket.on("costream-request-pending", () => setCoStreamState("pending"));
    socket.on("costream-accepted", ({ token }: { token: string }) => {
      setCoStreamToken(token);
      setCoStreamState("accepted");
      toast.success("You're on stage! Camera and mic are now live.");
    });
    socket.on("costream-request-rejected", ({ reason }: { reason: string }) => {
      setCoStreamState("rejected");
      toast.error(reason || "Your request was declined.");
      setTimeout(() => setCoStreamState("idle"), 3000);
    });
    socket.on("costream-request-withdrawn", () => setCoStreamState("idle"));
    socket.on("costream-removed", ({ reason }: { reason: string }) => {
      setCoStreamToken(null);
      setCoStreamState("idle");
      toast.info(reason || "You have left the stage.");
    });
    socket.on("costream-error", ({ reason }: { reason: string }) => {
      toast.error(reason);
      setCoStreamState("idle");
    });

    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id, spawnFloatingReaction]);

  const handleLiveKitConnect = () => setLiveKitConnected(true);
  const handleLiveKitDisconnect = () => {
    setLiveKitConnected(false);
    if (streamState === "live") {
      setStreamState("interrupted");
      toast.error("Disconnected from stream");
    }
  };

  const handleBackToWaiting = () => {
    setStreamState("waiting");
    setHasInteracted(false);
    setToken(null);
    setArtistDisconnected(false);
  };

  const bannerImage = exhibition?.banner_image
    ? exhibition.banner_image.startsWith("http")
      ? exhibition.banner_image
      : `${BASE_URL}${exhibition.banner_image}`
    : "https://via.placeholder.com/1280x720?text=Exhibition+Banner";

  const isCoStreamer = coStreamState === "accepted" && !!coStreamToken;
  const isStreamActive = streamState === "live" || streamState === "joining";
  const displayName = getViewerInfo().displayName;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading exhibition...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject float-up animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 2.5s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        <Toaster richColors theme="system" />

        {/* Top bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {isCoStreamer && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-indigo-400 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <Crown size={12} /> On Stage
              </div>
            )}
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
                RECONNECTING ({reconnectAttempt}/10)
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

        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
          {/* Title */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
              Live Exhibition
            </p>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-50">
              {exhibition?.title || "Live Exhibition"}
            </h1>
          </div>

          {/* ── Main content: video + chat side by side ── */}
          <div
            className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-800 overflow-hidden"
            style={{ height: "560px" }}
          >
            {/* Video area */}
            <div className="relative flex-1 bg-zinc-900 min-h-64 lg:min-h-0">
              {isCoStreamer ? (
                <LiveKitRoom
                  token={coStreamToken!}
                  serverUrl={LIVEKIT_URL}
                  connect={true}
                  video={!isCameraOff}
                  audio={!isMuted}
                  onDisconnected={() => {
                    setCoStreamToken(null);
                    setCoStreamState("idle");
                  }}
                >
                  <CoStreamerView
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    reactions={floatingReactions}
                    onLeave={handleLeaveStage}
                  />
                  <RoomAudioRenderer />
                </LiveKitRoom>
              ) : token && streamState === "live" && hasInteracted ? (
                <LiveKitRoom
                  token={token}
                  serverUrl={LIVEKIT_URL}
                  connect={true}
                  audio={true}
                  video={false}
                  onConnected={handleLiveKitConnect}
                  onDisconnected={handleLiveKitDisconnect}
                  options={{ adaptiveStream: true, dynacast: true }}
                >
                  <VideoRenderer
                    viewerCount={viewerCount}
                    reactions={floatingReactions}
                  />
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
                          size={56}
                          className="mb-6 opacity-70 animate-pulse"
                        />
                        <h2 className="text-3xl font-bold mb-4">
                          Live Stream Coming Soon
                        </h2>
                        <p className="text-lg opacity-80 max-w-sm">
                          The artist hasn't started broadcasting yet.
                        </p>
                      </>
                    )}
                    {streamState === "live" && !hasInteracted && (
                      <>
                        <PlayCircle
                          size={72}
                          className="mb-6 text-red-500 drop-shadow-lg"
                        />
                        <h2 className="text-4xl font-bold mb-4">Live Now!</h2>
                        <p className="text-xl opacity-90 mb-8 max-w-sm">
                          The exhibition is broadcasting live
                        </p>
                        <button
                          onClick={handleJoinLive}
                          disabled={isJoining}
                          className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl transition-all transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isJoining ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <PlayCircle size={24} />
                          )}
                          {isJoining ? "Connecting..." : "Join Live Stream"}
                        </button>
                      </>
                    )}
                    {streamState === "joining" && (
                      <>
                        <Loader2
                          size={56}
                          className="mb-6 animate-spin text-red-500"
                        />
                        <h2 className="text-3xl font-bold mb-4">
                          Connecting...
                        </h2>
                      </>
                    )}
                    {streamState === "interrupted" && (
                      <>
                        <WifiOff size={56} className="mb-6 text-amber-500" />
                        <h2 className="text-3xl font-bold mb-4">
                          {artistDisconnected
                            ? "Artist Disconnected"
                            : "Connection Interrupted"}
                        </h2>
                        <p className="text-lg opacity-80 mb-8 max-w-sm">
                          {artistDisconnected
                            ? "The artist lost connection. They should be back shortly."
                            : "Your connection was lost."}
                        </p>
                        <div className="flex gap-3 flex-wrap justify-center">
                          {!artistDisconnected && (
                            <button
                              onClick={handleJoinLive}
                              disabled={isJoining}
                              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-50"
                            >
                              Try Reconnecting
                            </button>
                          )}
                          <button
                            onClick={handleBackToWaiting}
                            className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold"
                          >
                            Go Back
                          </button>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                          >
                            Refresh
                          </button>
                        </div>
                      </>
                    )}
                    {streamState === "reconnecting" && (
                      <>
                        <Loader2
                          size={56}
                          className="mb-6 animate-spin text-amber-500"
                        />
                        <h2 className="text-3xl font-bold mb-4">
                          Reconnecting...
                        </h2>
                        <p className="text-lg opacity-80">
                          Attempt {reconnectAttempt} of 10
                        </p>
                      </>
                    )}
                    {streamState === "ended" && (
                      <>
                        <h2 className="text-4xl font-serif mb-6">
                          Stream Has Ended
                        </h2>
                        <p className="text-xl opacity-80 mb-8">
                          Thank you for being part of this exhibition
                        </p>
                        <button
                          onClick={() => navigate(-1)}
                          className="px-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg"
                        >
                          Return to Gallery
                        </button>
                      </>
                    )}
                  </div>
                  <FloatingReactions reactions={floatingReactions} />
                </>
              )}
            </div>

            {/* Chat panel — only visible when stream is live and user has joined */}
            {isStreamActive && hasInteracted && (
              <div
                className="w-full lg:w-80 flex-shrink-0 flex flex-col"
                style={{ minHeight: "300px" }}
              >
                <LiveChat
                  messages={chatMessages}
                  onSend={handleSendMessage}
                  onReaction={handleSendReaction}
                  displayName={displayName}
                  isLive={isStreamActive && hasInteracted}
                />
              </div>
            )}
          </div>

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
                  The artist has left the stream — likely refreshed or lost
                  connection. They should be back shortly. You don't need to do
                  anything.
                </p>
              </div>
            </div>
          )}

          {/* Controls row (co‑streamer controls + join button) */}
          {streamState === "live" && hasInteracted && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {isCoStreamer && (
                  <>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3 border transition-all ${
                        isMuted
                          ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button
                      onClick={() => setIsCameraOff(!isCameraOff)}
                      className={`p-3 border transition-all ${
                        isCameraOff
                          ? "border-red-200 dark:border-red-900 text-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                      }`}
                    >
                      {isCameraOff ? (
                        <VideoOff size={18} />
                      ) : (
                        <Video size={18} />
                      )}
                    </button>
                  </>
                )}
              </div>
              {!isCoStreamer && (
                <JoinStageButton
                  coStreamState={coStreamState}
                  onRequest={handleRequestCoStream}
                  onCancel={handleCancelRequest}
                />
              )}
            </div>
          )}

          {/* Exhibition info */}
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

          {/* Artworks grid */}
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
                            : `${BASE_URL}${art.main_image}`
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
                          onClick={() =>
                            navigate(`/artworks/${art.artwork_id}`)
                          }
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
        </div>
      </div>
    </>
  );
}
