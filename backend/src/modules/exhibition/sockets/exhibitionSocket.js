// src/modules/livestream/sockets/exhibitionSocket.js
const { RoomServiceClient } = require("livekit-server-sdk");
const { LiveStream, Exhibition, User } = require("../../index");
const notificationEmitter = require("../../../events/EventEmitter");

const API_KEY = process.env.LIVEKIT_API_KEY?.trim();
const API_SECRET = process.env.LIVEKIT_API_SECRET?.trim();
const LIVEKIT_URL = process.env.LIVEKIT_URL?.trim();
const LIVEKIT_HOST = LIVEKIT_URL?.replace("wss://", "https://");

const roomService = new RoomServiceClient(LIVEKIT_HOST, API_KEY, API_SECRET);

// Tracks which users have been counted per stream (resets when stream ends)
const countedViewers = new Map();

// In-memory chat history per exhibition (cleared when stream ends)
const chatHistory = new Map();

const MAX_CHAT_HISTORY = 1000; // Keep last 100 messages in memory

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ── Step 1: Anyone joining the page joins the socket room silently ──────────
    socket.on("join-exhibition", async ({ exhibitionId, role }) => {
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;
      socket.join(roomName);
      socket.data.exhibitionId = exhibitionId;
      socket.data.role = role;

      try {
        const exhibition = await Exhibition.findByPk(exhibitionId);
        const isLive = exhibition && exhibition.status === "LIVE";

        if (role === "VIEWER" && isLive) {
          socket.emit("stream-is-live");

          // Send recent chat history to the new viewer
          const history = chatHistory.get(exhibitionId) || [];
          if (history.length > 0) {
            socket.emit("chat-history", history);
          }
        }

        if (role === "AUTHOR" && isLive) {
          // Send chat history to the author too if they reconnect
          const history = chatHistory.get(exhibitionId) || [];
          if (history.length > 0) {
            socket.emit("chat-history", history);
          }
        }

        await broadcastViewerCount(io, roomName, exhibitionId);
      } catch (err) {
        console.error("Error in join-exhibition:", err);
      }
    });

    // ── Step 2: Artist clicks "Go Live" ─────────────────────────────────────────
    socket.on("artist-go-live", async ({ exhibitionId }) => {
      const roomName = `exhibition_${exhibitionId}`;

      try {
        const exhibition = await Exhibition.findByPk(exhibitionId, {
          include: [{ model: User, as: "author" }],
        });

        if (!exhibition) {
          console.error("Exhibition not found:", exhibitionId);
          return;
        }

        await Exhibition.update(
          { status: "LIVE" },
          { where: { exhibition_id: exhibitionId } },
        );
        await LiveStream.update(
          { stream_status: "STREAMING" },
          { where: { exhibition_id: exhibitionId } },
        );

        // Initialize fresh chat history for this stream session
        chatHistory.set(exhibitionId, []);

        try {
          await roomService.createRoom({
            name: roomName,
            emptyTimeout: 10 * 60,
            maxParticipants: 100,
          });
          console.log(`LiveKit room created: ${roomName}`);
        } catch (roomErr) {
          console.log(`Room ${roomName} might already exist:`, roomErr.message);
        }

        const admin = await User.findOne({ where: { role: "ADMIN" } });
        if (admin) {
          notificationEmitter.emit("sendNotification", {
            recipient_id: admin.user_id,
            actor_id: exhibition.author_id,
            type: "exhibition_live",
            title: "🔴 Exhibition is LIVE",
            message: `The exhibition "${exhibition.title}" by ${exhibition.author?.name} is now broadcasting.`,
            entity_type: "exhibition",
            entity_id: exhibitionId,
            priority: "high",
          });
        }

        io.to(roomName).emit("stream-started");
        await broadcastViewerCount(io, roomName, exhibitionId);

        console.log(`Artist went live for exhibition: ${exhibitionId}`);
      } catch (err) {
        console.error("Error in artist-go-live:", err);
      }
    });

    // ── Step 3: Viewer clicks "Join Live Stream" — count them ───────────────────
    socket.on(
      "viewer-watching",
      async ({ exhibitionId, userId, displayName }) => {
        const roomName = `exhibition_${exhibitionId}`;
        socket.data.watching = true;
        socket.data.displayName = displayName || "Guest";
        socket.data.userId = userId || null;

        try {
          if (!countedViewers.has(exhibitionId)) {
            countedViewers.set(exhibitionId, new Set());
          }

          const sessionKey =
            userId && userId !== "any" ? `user_${userId}` : `anon_${socket.id}`;
          const alreadyCounted = countedViewers
            .get(exhibitionId)
            .has(sessionKey);

          if (!alreadyCounted) {
            countedViewers.get(exhibitionId).add(sessionKey);
            await LiveStream.increment("total_views", {
              where: { exhibition_id: exhibitionId },
            });
          }

          // Send chat history to this viewer
          const history = chatHistory.get(exhibitionId) || [];
          if (history.length > 0) {
            socket.emit("chat-history", history);
          }

          socket
            .to(roomName)
            .emit("viewer-joined", { displayName: socket.data.displayName });
          await broadcastViewerCount(io, roomName, exhibitionId);

          console.log(
            `Viewer watching exhibition ${exhibitionId}, key: ${sessionKey}`,
          );
        } catch (err) {
          console.error("Error in viewer-watching:", err);
        }
      },
    );

    // ── Step 4: Chat message sent ────────────────────────────────────────────────
    socket.on(
      "chat-message",
      ({ exhibitionId, message, displayName, userId, avatar }) => {
        if (!exhibitionId || !message?.trim()) return;

        // Sanitize message
        const sanitized = message.trim().slice(0, 200);
        const roomName = `exhibition_${exhibitionId}`;

        const chatMsg = {
          id: `${socket.id}_${Date.now()}`,
          userId: userId || null,
          displayName: displayName || socket.data.displayName || "Guest",
          avatar: avatar || null,
          message: sanitized,
          role: socket.data.role || "VIEWER", // AUTHOR or VIEWER
          timestamp: Date.now(),
        };

        // Store in memory
        if (!chatHistory.has(exhibitionId)) {
          chatHistory.set(exhibitionId, []);
        }
        const history = chatHistory.get(exhibitionId);
        history.push(chatMsg);

        // Keep memory bounded
        if (history.length > MAX_CHAT_HISTORY) {
          history.shift();
        }

        // Broadcast to everyone in the room including sender
        io.to(roomName).emit("chat-message", chatMsg);
      },
    );

    // ── Step 5: Artist sends a "reaction" (heart, fire, etc.) ───────────────────
    socket.on("send-reaction", ({ exhibitionId, reaction }) => {
      if (!exhibitionId || !reaction) return;
      const roomName = `exhibition_${exhibitionId}`;
      io.to(roomName).emit("reaction", { reaction, from: socket.data.role });
    });

    // ── Step 6: Artist ends stream intentionally ─────────────────────────────────
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

        try {
          await roomService.deleteRoom(roomName);
          console.log(`LiveKit room deleted: ${roomName}`);
        } catch (roomErr) {
          console.log(`Error deleting room ${roomName}:`, roomErr.message);
        }

        io.to(roomName).emit("stream-ended");

        // Clear all data for this stream
        countedViewers.delete(exhibitionId);
        chatHistory.delete(exhibitionId); // ← wipe chat when stream ends

        console.log(`Artist ended stream for exhibition: ${exhibitionId}`);
      } catch (err) {
        console.error("Error ending stream:", err);
      }
    });

    // ── Handle unexpected disconnects ────────────────────────────────────────────
    socket.on("disconnecting", async () => {
      const { exhibitionId, role, watching } = socket.data;
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;

      try {
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

        if (watching) {
          setTimeout(() => {
            broadcastViewerCount(io, roomName, exhibitionId);
          }, 500);
        }
      } catch (err) {
        console.error("Error in disconnecting:", err);
      }
    });
  });
};

async function broadcastViewerCount(io, roomName, exhibitionId) {
  let viewerCount = 0;
  const room = io.sockets.adapter.rooms.get(roomName);

  if (room) {
    for (const sid of room) {
      const s = io.sockets.sockets.get(sid);
      if (s?.data?.role === "VIEWER" && s?.data?.watching) {
        viewerCount++;
      }
    }
  }

  await LiveStream.update(
    { current_viewers: viewerCount },
    { where: { exhibition_id: exhibitionId } },
  );

  io.to(roomName).emit("viewer-count-update", { count: viewerCount });
}
