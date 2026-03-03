// src/modules/livestream/sockets/exhibitionSocket.js
const { RoomServiceClient, AccessToken } = require("livekit-server-sdk");
const { LiveStream, Exhibition, User } = require("../../index");
const notificationEmitter = require("../../../events/EventEmitter");

const API_KEY = process.env.LIVEKIT_API_KEY?.trim();
const API_SECRET = process.env.LIVEKIT_API_SECRET?.trim();
const LIVEKIT_URL =
  process.env.VITE_LIVEKIT_URL?.trim() || process.env.LIVEKIT_URL?.trim();
const LIVEKIT_HOST = LIVEKIT_URL?.replace("wss://", "https://");

const roomService = new RoomServiceClient(LIVEKIT_HOST, API_KEY, API_SECRET);

// viewer dedup per stream
const countedViewers = new Map();

// in-memory chat per exhibition
const chatHistory = new Map();

// ─── Co-stream state ──────────────────────────────────────────────────────────
//  pendingRequests : Map<exhibitionId, Map<socketId, RequestObj>>
//  activeCoStreamers: Map<exhibitionId, Set<socketId>>
const pendingRequests = new Map();
const activeCoStreamers = new Map();

const MAX_CHAT_HISTORY = 100;
const MAX_CO_STREAMERS = 3;

module.exports = (io) => {
  io.on("connection", (socket) => {
    // ── join-exhibition ────────────────────────────────────────────────────────
    socket.on("join-exhibition", async ({ exhibitionId, role }) => {
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;
      socket.join(roomName);
      socket.data.exhibitionId = exhibitionId;
      socket.data.role = role;

      try {
        const exhibition = await Exhibition.findByPk(exhibitionId);
        const isLive = exhibition?.status === "LIVE";

        if (isLive) {
          socket.emit("stream-is-live");

          const history = chatHistory.get(exhibitionId) || [];
          if (history.length > 0) socket.emit("chat-history", history);

          const active = activeCoStreamers.get(exhibitionId);
          if (active?.size > 0)
            socket.emit("costream-count-update", { count: active.size });
        }

        await broadcastViewerCount(io, roomName, exhibitionId);
      } catch (err) {
        console.error("join-exhibition error:", err);
      }
    });

    // ── artist-go-live ─────────────────────────────────────────────────────────
    socket.on("artist-go-live", async ({ exhibitionId }) => {
      const roomName = `exhibition_${exhibitionId}`;

      try {
        const exhibition = await Exhibition.findByPk(exhibitionId, {
          include: [{ model: User, as: "author" }],
        });
        if (!exhibition) return;

        await Exhibition.update(
          { status: "LIVE" },
          { where: { exhibition_id: exhibitionId } },
        );
        await LiveStream.update(
          { stream_status: "STREAMING" },
          { where: { exhibition_id: exhibitionId } },
        );

        // Init fresh state for this session
        chatHistory.set(exhibitionId, []);
        pendingRequests.set(exhibitionId, new Map());
        activeCoStreamers.set(exhibitionId, new Set());

        try {
          await roomService.createRoom({
            name: roomName,
            emptyTimeout: 10 * 60,
            maxParticipants: 100,
          });
        } catch (e) {
          console.log("Room may already exist:", e.message);
        }

        const admin = await User.findOne({ where: { role: "ADMIN" } });
        if (admin) {
          notificationEmitter.emit("sendNotification", {
            recipient_id: admin.user_id,
            actor_id: exhibition.author_id,
            type: "exhibition_live",
            title: "🔴 Exhibition is LIVE",
            message: `"${exhibition.title}" by ${exhibition.author?.name} is now broadcasting.`,
            entity_type: "exhibition",
            entity_id: exhibitionId,
            priority: "high",
          });
        }

        io.to(roomName).emit("stream-started");
        await broadcastViewerCount(io, roomName, exhibitionId);
      } catch (err) {
        console.error("artist-go-live error:", err);
      }
    });

    // ── viewer-watching ────────────────────────────────────────────────────────
    socket.on(
      "viewer-watching",
      async ({ exhibitionId, userId, displayName }) => {
        const roomName = `exhibition_${exhibitionId}`;
        socket.data.watching = true;
        socket.data.displayName = displayName || "Guest";
        socket.data.userId = userId || null;

        try {
          if (!countedViewers.has(exhibitionId))
            countedViewers.set(exhibitionId, new Set());

          const key =
            userId && userId !== "any" ? `user_${userId}` : `anon_${socket.id}`;
          if (!countedViewers.get(exhibitionId).has(key)) {
            countedViewers.get(exhibitionId).add(key);
            await LiveStream.increment("total_views", {
              where: { exhibition_id: exhibitionId },
            });
          }

          const history = chatHistory.get(exhibitionId) || [];
          if (history.length > 0) socket.emit("chat-history", history);

          socket
            .to(roomName)
            .emit("viewer-joined", { displayName: socket.data.displayName });
          await broadcastViewerCount(io, roomName, exhibitionId);
        } catch (err) {
          console.error("viewer-watching error:", err);
        }
      },
    );

    // ════════════════════════════════════════════════════════════════════════════
    // CO-STREAM EVENTS
    // ════════════════════════════════════════════════════════════════════════════

    // ── 1. Viewer requests to join stage ───────────────────────────────────────
    socket.on(
      "request-costream",
      ({ exhibitionId, userId, displayName, avatar }) => {
        if (!exhibitionId) return;

        const pending = pendingRequests.get(exhibitionId);
        const active = activeCoStreamers.get(exhibitionId);

        if (!pending)
          return socket.emit("costream-error", {
            reason: "Stream is not live.",
          });
        if (pending.has(socket.id))
          return socket.emit("costream-error", {
            reason: "You already have a pending request.",
          });
        if (active?.has(socket.id))
          return socket.emit("costream-error", {
            reason: "You are already on stage.",
          });
        if (active?.size >= MAX_CO_STREAMERS)
          return socket.emit("costream-error", {
            reason: `Stage is full (max ${MAX_CO_STREAMERS} guests).`,
          });

        const request = {
          socketId: socket.id,
          userId: userId || null,
          displayName: displayName || socket.data.displayName || "Guest",
          avatar: avatar || null,
          requestedAt: Date.now(),
        };

        pending.set(socket.id, request);
        socket.data.displayName = request.displayName;
        socket.data.userId = request.userId;

        // Notify artist
        const roomName = `exhibition_${exhibitionId}`;
        findArtistSocket(io, roomName)?.emit("costream-request", request);

        // Tell viewer request is pending
        socket.emit("costream-request-pending");

        console.log(
          `Co-stream request: ${request.displayName} → exhibition ${exhibitionId}`,
        );
      },
    );

    // ── 2. Viewer cancels their request ───────────────────────────────────────
    socket.on("cancel-costream-request", ({ exhibitionId }) => {
      if (!exhibitionId) return;
      pendingRequests.get(exhibitionId)?.delete(socket.id);

      const roomName = `exhibition_${exhibitionId}`;
      findArtistSocket(io, roomName)?.emit("costream-request-cancelled", {
        socketId: socket.id,
      });

      socket.emit("costream-request-withdrawn");
    });

    // ── 3. Artist accepts a request ───────────────────────────────────────────
    socket.on("accept-costream", async ({ exhibitionId, guestSocketId }) => {
      if (!exhibitionId || !guestSocketId) return;

      const pending = pendingRequests.get(exhibitionId);
      const active = activeCoStreamers.get(exhibitionId);
      if (!pending || !active) return;

      const request = pending.get(guestSocketId);
      if (!request)
        return socket.emit("costream-error", {
          reason: "Request not found or already handled.",
        });

      if (active.size >= MAX_CO_STREAMERS) {
        pending.delete(guestSocketId);
        io.sockets.sockets.get(guestSocketId)?.emit("costream-error", {
          reason: `Stage is full (max ${MAX_CO_STREAMERS} guests).`,
        });
        return;
      }

      try {
        const guestIdentity = request.userId
          ? `viewer_${request.userId}`
          : `guest_${guestSocketId.slice(0, 8)}`;

        const at = new AccessToken(API_KEY, API_SECRET, {
          identity: guestIdentity,
          name: request.displayName,
          ttl: "1h",
        });

        const roomName = `exhibition_${exhibitionId}`;
        at.addGrant({
          roomJoin: true,
          room: roomName,
          canPublish: true, // guest can publish camera + mic
          canSubscribe: true,
          canPublishData: true,
        });

        const guestToken = await at.toJwt();

        // Move pending → active
        pending.delete(guestSocketId);
        active.add(guestSocketId);

        const guestSocket = io.sockets.sockets.get(guestSocketId);
        if (guestSocket) {
          guestSocket.data.role = "CO_STREAMER";
          guestSocket.data.livekitIdentity = guestIdentity;
          guestSocket.emit("costream-accepted", {
            token: guestToken,
            liveKitUrl: LIVEKIT_URL,
            identity: guestIdentity,
          });
        }

        io.to(roomName).emit("costreamer-joined", {
          socketId: guestSocketId,
          displayName: request.displayName,
          avatar: request.avatar,
          identity: guestIdentity,
        });

        io.to(roomName).emit("costream-count-update", { count: active.size });

        console.log(
          `Accepted co-stream: ${request.displayName} → exhibition ${exhibitionId}`,
        );
      } catch (err) {
        console.error("accept-costream error:", err);
        socket.emit("costream-error", { reason: "Token generation failed." });
      }
    });

    // ── 4. Artist rejects a request ───────────────────────────────────────────
    socket.on("reject-costream", ({ exhibitionId, guestSocketId }) => {
      if (!exhibitionId || !guestSocketId) return;

      pendingRequests.get(exhibitionId)?.delete(guestSocketId);

      io.sockets.sockets.get(guestSocketId)?.emit("costream-request-rejected", {
        reason: "The artist declined your request.",
      });

      socket.emit("costream-reject-ack", { guestSocketId });
    });

    // ── 5. Remove a co-streamer from stage (artist or self) ───────────────────
    socket.on("remove-costreamer", async ({ exhibitionId, guestSocketId }) => {
      if (!exhibitionId) return;

      const targetId = guestSocketId || socket.id; // guest can remove themselves
      const active = activeCoStreamers.get(exhibitionId);
      if (active) active.delete(targetId);

      const roomName = `exhibition_${exhibitionId}`;

      // Try to kick from LiveKit room
      try {
        const targetSocket = io.sockets.sockets.get(targetId);
        const identity = targetSocket?.data?.livekitIdentity;
        if (identity) {
          await roomService
            .removeParticipant(roomName, identity)
            .catch(() => {});
        }
      } catch {}

      const targetSocket = io.sockets.sockets.get(targetId);
      if (targetSocket) {
        targetSocket.data.role = "VIEWER";
        targetSocket.data.livekitIdentity = null;
        targetSocket.emit("costream-removed", {
          reason: guestSocketId
            ? "You were removed from the stage."
            : "You left the stage.",
        });
      }

      io.to(roomName).emit("costreamer-left", { socketId: targetId });
      io.to(roomName).emit("costream-count-update", {
        count: active ? active.size : 0,
      });
    });

    // ════════════════════════════════════════════════════════════════════════════

    // ── chat-message ──────────────────────────────────────────────────────────
    socket.on(
      "chat-message",
      ({ exhibitionId, message, displayName, userId, avatar }) => {
        if (!exhibitionId || !message?.trim()) return;

        const roomName = `exhibition_${exhibitionId}`;
        const chatMsg = {
          id: `${socket.id}_${Date.now()}`,
          userId: userId || null,
          displayName: displayName || socket.data.displayName || "Guest",
          avatar: avatar || null,
          message: message.trim().slice(0, 200),
          role: socket.data.role || "VIEWER",
          timestamp: Date.now(),
        };

        if (!chatHistory.has(exhibitionId)) chatHistory.set(exhibitionId, []);
        const history = chatHistory.get(exhibitionId);
        history.push(chatMsg);
        if (history.length > MAX_CHAT_HISTORY) history.shift();

        io.to(roomName).emit("chat-message", chatMsg);
      },
    );

    // ── send-reaction ─────────────────────────────────────────────────────────
    socket.on("send-reaction", ({ exhibitionId, reaction }) => {
      if (!exhibitionId || !reaction) return;
      io.to(`exhibition_${exhibitionId}`).emit("reaction", {
        reaction,
        from: socket.data.role,
      });
    });

    // ── artist-end-stream ─────────────────────────────────────────────────────
    socket.on("artist-end-stream", async ({ exhibitionId }) => {
      const roomName = `exhibition_${exhibitionId}`;
      try {
        await Exhibition.update(
          { status: "ARCHIVED" },
          { where: { exhibition_id: exhibitionId } },
        );
        await LiveStream.update(
          { stream_status: "IDLE", current_viewers: 0 },
          { where: { exhibition_id: exhibitionId } },
        );

        await roomService.deleteRoom(roomName).catch(() => {});
        io.to(roomName).emit("stream-ended");

        // Notify all co-streamers
        activeCoStreamers.get(exhibitionId)?.forEach((sid) => {
          io.sockets.sockets
            .get(sid)
            ?.emit("costream-removed", { reason: "Stream has ended." });
        });

        // Wipe all state
        countedViewers.delete(exhibitionId);
        chatHistory.delete(exhibitionId);
        pendingRequests.delete(exhibitionId);
        activeCoStreamers.delete(exhibitionId);
      } catch (err) {
        console.error("artist-end-stream error:", err);
      }
    });

    // ── disconnecting ─────────────────────────────────────────────────────────
    socket.on("disconnecting", async () => {
      const { exhibitionId, role, watching } = socket.data;
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;

      try {
        // Clean pending request
        const pending = pendingRequests.get(exhibitionId);
        if (pending?.has(socket.id)) {
          pending.delete(socket.id);
          findArtistSocket(io, roomName)?.emit("costream-request-cancelled", {
            socketId: socket.id,
          });
        }

        // Clean active co-streamer
        const active = activeCoStreamers.get(exhibitionId);
        if (active?.has(socket.id)) {
          active.delete(socket.id);
          io.to(roomName).emit("costreamer-left", { socketId: socket.id });
          io.to(roomName).emit("costream-count-update", { count: active.size });
        }

        if (role === "AUTHOR") {
          const room = io.sockets.adapter.rooms.get(roomName);
          if (room && room.size > 1) {
            await LiveStream.update(
              { stream_status: "DISCONNECTED" },
              { where: { exhibition_id: exhibitionId } },
            );
            io.to(roomName).emit("stream-interrupted");
          } else {
            await LiveStream.update(
              { stream_status: "IDLE" },
              { where: { exhibition_id: exhibitionId } },
            );
          }
        }

        if (watching)
          setTimeout(
            () => broadcastViewerCount(io, roomName, exhibitionId),
            500,
          );
      } catch (err) {
        console.error("disconnecting error:", err);
      }
    });
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function findArtistSocket(io, roomName) {
  const room = io.sockets.adapter.rooms.get(roomName);
  if (!room) return null;
  for (const sid of room) {
    const s = io.sockets.sockets.get(sid);
    if (s?.data?.role === "AUTHOR") return s;
  }
  return null;
}

async function broadcastViewerCount(io, roomName, exhibitionId) {
  let count = 0;
  const room = io.sockets.adapter.rooms.get(roomName);
  if (room) {
    for (const sid of room) {
      const s = io.sockets.sockets.get(sid);
      if (s?.data?.role === "VIEWER" && s?.data?.watching) count++;
    }
  }
  await LiveStream.update(
    { current_viewers: count },
    { where: { exhibition_id: exhibitionId } },
  );
  io.to(roomName).emit("viewer-count-update", { count });
}
