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
import { toast } from "sonner";
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
  Check,
  X,
  UserPlus,
  UserMinus,
  Crown,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { livekitToken } from "@/api/services/liveStream";
import { Track } from "livekit-client";

const LIVEKIT_URL =
  import.meta.env.VITE_LIVEKIT_URL ||
  "wss://livestreaming-yrj2soge.livekit.cloud";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface CoStreamRequest {
  socketId: string;
  userId: string | null;
  displayName: string;
  avatar: string | null;
  requestedAt: number;
}

interface ActiveCoStreamer {
  socketId: string;
  displayName: string;
  avatar: string | null;
  identity: string;
}

// ─── Floating reactions ───────────────────────────────────────────────────────

function FloatingReactions({ reactions }: { reactions: FloatingReaction[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
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

// ─── Stage view — uses useTracks for ALL video, no ParticipantTile ────────────

function StageView({
  isMuted,
  isCameraOff,
  reactions,
  coStreamers,
  onRemoveCoStreamer,
}: {
  isMuted: boolean;
  isCameraOff: boolean;
  reactions: FloatingReaction[];
  coStreamers: ActiveCoStreamer[];
  onRemoveCoStreamer: (socketId: string) => void;
}) {
  const { localParticipant } = useLocalParticipant();

  // Get ALL camera tracks (local + remote) with placeholder: false so we only
  // get real published tracks — avoids the "no TrackRef" crash from placeholders
  const allCameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  // Separate artist vs guests
  const localTrack = allCameraTracks.find(
    (t) => t.participant.identity === localParticipant?.identity,
  );
  const guestTracks = allCameraTracks.filter(
    (t) => t.participant.identity !== localParticipant?.identity,
  );

  // Mute controls
  useEffect(() => {
    if (!localParticipant) return;
    const audio = localParticipant.getTrackPublication(Track.Source.Microphone);
    if (audio?.track) isMuted ? audio.track.mute() : audio.track.unmute();
    const video = localParticipant.getTrackPublication(Track.Source.Camera);
    if (video?.track) isCameraOff ? video.track.mute() : video.track.unmute();
  }, [isMuted, isCameraOff, localParticipant]);

  const totalTiles = 1 + guestTracks.length;

  return (
    <div className="relative w-full h-full bg-zinc-950">
      {totalTiles === 1 ? (
        // ── Solo view ─────────────────────────────────────────────────────────
        <div className="w-full h-full flex items-center justify-center">
          {localTrack && !isCameraOff ? (
            <VideoTrack
              trackRef={localTrack}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <VideoOff size={48} strokeWidth={1} />
              <p className="text-[10px] uppercase tracking-widest font-bold">
                Camera {isCameraOff ? "Disabled" : "Loading..."}
              </p>
            </div>
          )}
        </div>
      ) : (
        // ── Split grid ────────────────────────────────────────────────────────
        <div
          className={`w-full h-full grid gap-px bg-zinc-800 ${
            totalTiles === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"
          }`}
        >
          {/* Artist tile */}
          <div className="relative bg-zinc-900 overflow-hidden">
            {localTrack && !isCameraOff ? (
              <VideoTrack
                trackRef={localTrack}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <VideoOff size={28} strokeWidth={1} />
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-1 rounded-full">
              <Crown size={10} className="text-yellow-400" />
              <span className="text-[9px] text-white/90 font-bold uppercase tracking-wider">
                You
              </span>
            </div>
          </div>

          {/* Guest tiles — each has a guaranteed trackRef from useTracks */}
          {guestTracks.map((trackRef) => {
            const match = coStreamers.find(
              (cs) => cs.identity === trackRef.participant.identity,
            );
            return (
              <div
                key={trackRef.participant.identity}
                className="relative bg-zinc-900 overflow-hidden"
              >
                <VideoTrack
                  trackRef={trackRef}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[9px] text-white/90 font-bold uppercase tracking-wider truncate max-w-[70%]">
                    {match?.displayName || trackRef.participant.name || "Guest"}
                  </span>
                  {match && (
                    <button
                      onClick={() => onRemoveCoStreamer(match.socketId)}
                      className="bg-red-600/80 hover:bg-red-600 backdrop-blur p-1 rounded-full transition-colors"
                      title="Remove from stage"
                    >
                      <UserMinus size={10} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FloatingReactions reactions={reactions} />

      {/* Mic indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
        {isMuted ? (
          <MicOff size={12} className="text-red-400" />
        ) : (
          <Mic size={12} className="text-green-400" />
        )}
        <span className="text-[8px] uppercase tracking-wider text-white/80">
          {isMuted ? "Muted" : "Live"}
        </span>
      </div>
    </div>
  );
}

// ─── Co-stream request card ───────────────────────────────────────────────────

function CoStreamRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: CoStreamRequest;
  onAccept: (socketId: string) => void;
  onReject: (socketId: string) => void;
}) {
  const initials = request.displayName.slice(0, 2).toUpperCase();
  const waitSec = Math.floor((Date.now() - request.requestedAt) / 1000);

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-700">
      <div className="w-9 h-9 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
        {request.avatar ? (
          <img
            src={request.avatar}
            alt={initials}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-white truncate">
          {request.displayName}
        </p>
        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
          {waitSec < 60 ? `${waitSec}s ago` : "wants to join stage"}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onAccept(request.socketId)}
          className="w-8 h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 transition-colors"
          title="Accept"
        >
          <Check size={14} className="text-white" />
        </button>
        <button
          onClick={() => onReject(request.socketId)}
          className="w-8 h-8 flex items-center justify-center bg-zinc-700 hover:bg-red-600 transition-colors"
          title="Decline"
        >
          <X size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isArtist = msg.role === "AUTHOR";
  const isCoStreamer = msg.role === "CO_STREAMER";
  const initials = msg.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-2 px-1">
      <div
        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 overflow-hidden ${
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
            className="w-full h-full object-cover"
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

// ─── Right panel: requests + chat ────────────────────────────────────────────

function ArtistSidePanel({
  messages,
  requests,
  coStreamers,
  onSend,
  onReaction,
  onAccept,
  onReject,
  onRemoveCoStreamer,
  isLive,
  artistName,
}: {
  messages: ChatMessage[];
  requests: CoStreamRequest[];
  coStreamers: ActiveCoStreamer[];
  onSend: (msg: string) => void;
  onReaction: (emoji: string) => void;
  onAccept: (socketId: string) => void;
  onReject: (socketId: string) => void;
  onRemoveCoStreamer: (socketId: string) => void;
  isLive: boolean;
  artistName: string;
}) {
  const [tab, setTab] = useState<"chat" | "guests">("chat");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-switch to guests tab when a new request arrives
  const prevLen = useRef(0);
  useEffect(() => {
    if (requests.length > prevLen.current) setTab("guests");
    prevLen.current = requests.length;
  }, [requests.length]);

  const handleSend = () => {
    const t = input.trim();
    if (!t || !isLive) return;
    onSend(t);
    setInput("");
    inputRef.current?.focus();
  };

  const REACTIONS = ["❤️", "🔥", "⭐", "😍", "👏", "💎"];

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 border-l border-zinc-800">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 flex-shrink-0">
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${
            tab === "chat"
              ? "text-white border-b-2 border-red-500"
              : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          Chat
          {messages.length > 0 && (
            <span className="ml-1.5 text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("guests")}
          className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors relative ${
            tab === "guests"
              ? "text-white border-b-2 border-red-500"
              : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          Stage
          {requests.length > 0 && (
            <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center animate-pulse">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat tab ─────────────────────────────────────────────────────────── */}
      {tab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                <div className="text-3xl">💬</div>
                <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold">
                  {isLive ? "No messages yet" : "Go live to enable chat"}
                </p>
              </div>
            ) : (
              messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-2 flex items-center gap-1.5 border-t border-zinc-800/60 flex-shrink-0">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReaction(emoji)}
                disabled={!isLive}
                className="text-lg hover:scale-125 transition-transform disabled:opacity-30"
              >
                {emoji}
              </button>
            ))}
          </div>

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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!isLive}
                placeholder={
                  isLive ? `Reply as ${artistName}…` : "Go live to chat"
                }
                className="flex-1 bg-transparent text-[13px] text-white placeholder-zinc-600 outline-none min-w-0"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !isLive}
                className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-400 disabled:opacity-30"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="text-[9px] text-zinc-700 mt-1 text-right">
              {input.length}/200
            </p>
          </div>
        </>
      )}

      {/* ── Stage tab ─────────────────────────────────────────────────────────── */}
      {tab === "guests" && (
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          {requests.length > 0 && (
            <div className="p-3 border-b border-zinc-800">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 flex items-center gap-1.5">
                <UserPlus size={10} /> Requests ({requests.length})
              </p>
              <div className="space-y-2">
                {requests.map((req) => (
                  <CoStreamRequestCard
                    key={req.socketId}
                    request={req}
                    onAccept={onAccept}
                    onReject={onReject}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="p-3">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-2 flex items-center gap-1.5">
              <Crown size={10} /> On Stage ({coStreamers.length + 1})
            </p>

            {/* Artist row */}
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-bold text-white">
                🎨
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">{artistName}</p>
                <p className="text-[9px] text-red-400 uppercase tracking-widest">
                  Host
                </p>
              </div>
            </div>

            {coStreamers.length === 0 && requests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold">
                  No guests yet
                </p>
                <p className="text-[10px] text-zinc-700 mt-1">
                  Viewers can request to join your stage
                </p>
              </div>
            ) : (
              coStreamers.map((cs) => (
                <div
                  key={cs.socketId}
                  className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-indigo-900/40 mb-2"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
                    {cs.avatar ? (
                      <img
                        src={cs.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      cs.displayName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">
                      {cs.displayName}
                    </p>
                    <p className="text-[9px] text-indigo-400 uppercase tracking-widest">
                      Co-streamer
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveCoStreamer(cs.socketId)}
                    className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-red-600/80 transition-colors"
                    title="Remove from stage"
                  >
                    <UserMinus size={11} className="text-white/70" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);
  const [coStreamRequests, setCoStreamRequests] = useState<CoStreamRequest[]>(
    [],
  );
  const [activeCoStreamers, setActiveCoStreamers] = useState<
    ActiveCoStreamer[]
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
    setTimeout(
      () => setFloatingReactions((prev) => prev.filter((r) => r.id !== rid)),
      2500,
    );
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

  const handleAcceptCoStream = useCallback(
    (guestSocketId: string) => {
      socketRef.current?.emit("accept-costream", {
        exhibitionId: id,
        guestSocketId,
      });
      setCoStreamRequests((prev) =>
        prev.filter((r) => r.socketId !== guestSocketId),
      );
    },
    [id],
  );

  const handleRejectCoStream = useCallback(
    (guestSocketId: string) => {
      socketRef.current?.emit("reject-costream", {
        exhibitionId: id,
        guestSocketId,
      });
      setCoStreamRequests((prev) =>
        prev.filter((r) => r.socketId !== guestSocketId),
      );
      toast.info("Request declined.");
    },
    [id],
  );

  const handleRemoveCoStreamer = useCallback(
    (guestSocketId: string) => {
      socketRef.current?.emit("remove-costreamer", {
        exhibitionId: id,
        guestSocketId,
      });
    },
    [id],
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

    socket.on("connect", () =>
      socket.emit("join-exhibition", { exhibitionId: id, role: "AUTHOR" }),
    );

    socket.on("viewer-count-update", ({ count }) => setViewerCount(count));
    socket.on("stream-interrupted", () => {
      setConnectionStatus("disconnected");
      toast.error("Stream interrupted.");
    });
    socket.on("stream-ended", () => {
      setConnectionStatus("idle");
      setIsLive(false);
      setToken(null);
      setLiveKitConnected(false);
      setChatMessages([]);
      setCoStreamRequests([]);
      setActiveCoStreamers([]);
    });

    socket.on("chat-history", (history: ChatMessage[]) =>
      setChatMessages(history),
    );
    socket.on("chat-message", (msg: ChatMessage) =>
      setChatMessages((prev) => [...prev, msg].slice(-100)),
    );
    socket.on("reaction", ({ reaction }: { reaction: string }) =>
      spawnFloatingReaction(reaction),
    );

    socket.on("costream-request", (request: CoStreamRequest) => {
      setCoStreamRequests((prev) => {
        if (prev.some((r) => r.socketId === request.socketId)) return prev;
        return [...prev, request];
      });
      toast(`${request.displayName} wants to join your stream`, { icon: "🎤" });
    });

    socket.on(
      "costream-request-cancelled",
      ({ socketId }: { socketId: string }) => {
        setCoStreamRequests((prev) =>
          prev.filter((r) => r.socketId !== socketId),
        );
      },
    );

    socket.on(
      "costreamer-joined",
      (data: {
        socketId: string;
        displayName: string;
        avatar: string | null;
        identity: string;
      }) => {
        setActiveCoStreamers((prev) => [...prev, data]);
        toast.success(`${data.displayName} joined the stage!`);
      },
    );

    socket.on("costreamer-left", ({ socketId }: { socketId: string }) => {
      setActiveCoStreamers((prev) =>
        prev.filter((cs) => cs.socketId !== socketId),
      );
    });

    socket.on("costream-error", ({ reason }: { reason: string }) => {
      toast.error(reason);
    });

    return () => socket.disconnect();
  }, [id, spawnFloatingReaction]);

  const startStream = async () => {
    if (isArchived) return;
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
      } catch (e) {
        console.warn("Recording not supported:", e);
      }

      const response = await livekitToken(Number(id), "AUTHOR");
      const tokenStr =
        typeof response === "string" ? response : response?.token;
      if (!tokenStr?.startsWith("eyJ")) throw new Error("Invalid token format");

      setToken(tokenStr);
      socketRef.current?.emit("artist-go-live", { exhibitionId: id });
      setIsLive(true);
      setConnectionStatus("live");
      toast.success("You are now live!");
    } catch (err: any) {
      setConnectionStatus("idle");
      toast.error(`Failed to start: ${err.message}`);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
  };

  const endStream = async () => {
    if (isEnding) return;
    setIsEnding(true);
    const toastId = toast.loading("Ending stream...");

    try {
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
        await new Promise<void>((resolve) => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = async () => {
              if (recordedChunks.current.length > 0) {
                const blob = new Blob(recordedChunks.current, {
                  type: "video/webm",
                });
                const file = new File([blob], `stream-${Date.now()}.webm`, {
                  type: "video/webm",
                });
                await ExhibitionService.uploadRecording(id!, file).catch(
                  console.error,
                );
              }
              resolve();
            };
          } else resolve();
        });
      }

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      socketRef.current?.emit("artist-end-stream", { exhibitionId: id });

      let retries = 3;
      while (retries > 0) {
        try {
          await ExhibitionService.endLiveStream(id!);
          break;
        } catch {
          retries--;
          if (retries === 0) throw new Error("Failed to end stream");
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      setToken(null);
      setIsLive(false);
      setLiveKitConnected(false);
      setConnectionStatus("idle");
      setChatMessages([]);
      setCoStreamRequests([]);
      setActiveCoStreamers([]);
      toast.success("Stream ended successfully", { id: toastId });
      setTimeout(
        () => navigate(`/dashboard/exhibitions/${id}`, { replace: true }),
        500,
      );
    } catch (err) {
      toast.error("Failed to end stream properly", { id: toastId });
      setConnectionStatus("live");
      setIsEnding(false);
    }
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
        {/* Top bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {coStreamRequests.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-950/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                <UserPlus size={12} />
                {coStreamRequests.length} request
                {coStreamRequests.length > 1 ? "s" : ""}
              </div>
            )}
            {activeCoStreamers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 border border-indigo-400 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-[10px] font-bold uppercase tracking-widest">
                <Crown size={12} />
                {activeCoStreamers.length} on stage
              </div>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${
                connectionStatus === "live" && liveKitConnected
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
              {connectionStatus === "live" && liveKitConnected
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
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
              {exhibition?.title}
            </p>
            <h1 className="text-3xl font-serif text-slate-900 dark:text-slate-50">
              Live Studio
            </h1>
          </div>

          {/* Video + side panel */}
          <div
            className="flex flex-col lg:flex-row gap-0 border border-slate-200 dark:border-slate-800 overflow-hidden"
            style={{ height: "520px" }}
          >
            <div className="relative flex-1 bg-zinc-900 min-h-64 lg:min-h-0">
              {token && isLive && !isArchived ? (
                <LiveKitRoom
                  token={token}
                  serverUrl={LIVEKIT_URL}
                  connect={true}
                  video={true}
                  audio={true}
                  onConnected={() => {
                    setLiveKitConnected(true);
                    toast.success("Connected to streaming server");
                  }}
                  onDisconnected={() => {
                    setLiveKitConnected(false);
                    if (isLive) setConnectionStatus("disconnected");
                  }}
                  options={{
                    publishDefaults: {
                      videoSimulcastLayers: true,
                      videoCodec: "vp9",
                    },
                  }}
                >
                  <StageView
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    reactions={floatingReactions}
                    coStreamers={activeCoStreamers}
                    onRemoveCoStreamer={handleRemoveCoStreamer}
                  />
                  <RoomAudioRenderer />
                </LiveKitRoom>
              ) : (
                <>
                  {!isLive && connectionStatus === "idle" && !isArchived && (
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
                  )}
                  {connectionStatus === "connecting" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-t-red-500 border-white/20 rounded-full animate-spin" />
                        <p className="text-white text-[10px] uppercase tracking-widest animate-pulse font-bold">
                          Initializing Stream...
                        </p>
                      </div>
                    </div>
                  )}
                  {isArchived && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                      <AlertCircle size={64} className="mb-4 text-slate-400" />
                      <h2 className="text-2xl font-bold mb-2">
                        Exhibition Archived
                      </h2>
                      <p className="text-sm text-slate-400 mb-6">
                        This exhibition has ended
                      </p>
                      <Button
                        onClick={() => navigate(`/dashboard/exhibitions/${id}`)}
                        className="rounded-none px-6 py-3 bg-slate-700"
                      >
                        Return to Details
                      </Button>
                    </div>
                  )}
                  <FloatingReactions reactions={floatingReactions} />
                </>
              )}
            </div>

            {isLive && liveKitConnected && (
              <div
                className="w-full lg:w-80 flex-shrink-0 flex flex-col"
                style={{ minHeight: "300px" }}
              >
                <ArtistSidePanel
                  messages={chatMessages}
                  requests={coStreamRequests}
                  coStreamers={activeCoStreamers}
                  onSend={handleSendMessage}
                  onReaction={handleSendReaction}
                  onAccept={handleAcceptCoStream}
                  onReject={handleRejectCoStream}
                  onRemoveCoStreamer={handleRemoveCoStreamer}
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

          {/* Info panel */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {[
              {
                label: "Connection",
                value:
                  connectionStatus === "live" && liveKitConnected
                    ? "CONNECTED"
                    : connectionStatus.toUpperCase(),
                icon:
                  connectionStatus === "live" && liveKitConnected ? (
                    <Wifi size={14} className="text-emerald-500" />
                  ) : (
                    <WifiOff size={14} className="text-slate-300" />
                  ),
              },
              {
                label: "Viewers",
                value: viewerCount,
                icon: <Users size={14} className="text-slate-400" />,
              },
              {
                label: "On Stage",
                value: activeCoStreamers.length + (isLive ? 1 : 0),
                icon: <Crown size={14} className="text-indigo-400" />,
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
