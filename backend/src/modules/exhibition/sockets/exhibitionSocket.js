// src/modules/livestream/sockets/exhibitionSocket.js
const { RoomServiceClient } = require("livekit-server-sdk");
const { LiveStream, Exhibition } = require("../../index");

// 1. CRITICAL: Trim keys to prevent the 401 Unauthorized error
const API_KEY = process.env.LIVEKIT_API_KEY?.trim();
const API_SECRET = process.env.LIVEKIT_API_SECRET?.trim();
const LIVEKIT_URL = process.env.LIVEKIT_URL?.trim();

const LIVEKIT_HOST = LIVEKIT_URL?.replace("wss://", "https://");

const roomService = new RoomServiceClient(LIVEKIT_HOST, API_KEY, API_SECRET);

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-exhibition", async ({ exhibitionId, role }) => {
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;
      socket.join(roomName);

      // Store data on socket for disconnect logic
      socket.data.exhibitionId = exhibitionId;
      socket.data.role = role;

      try {
        if (role === "AUTHOR") {
          // Update both Exhibition and LiveStream tables
          await Exhibition.update(
            { status: "LIVE" },
            { where: { exhibition_id: exhibitionId } },
          );
          await LiveStream.update(
            { stream_status: "STREAMING" },
            { where: { exhibition_id: exhibitionId } },
          );

          // Notify everyone in the room that stream is starting
          io.to(roomName).emit("stream-started");
        }

        if (role === "VIEWER" && !socket.data.counted) {
          socket.data.counted = true;

          await LiveStream.increment("total_views", {
            where: { exhibition_id: exhibitionId },
          });

          // Notify artist that a viewer joined
          socket.to(roomName).emit("viewer-joined");
        }

        // Update the 'current_viewers' (Live count)
        await broadcastViewerCount(io, roomName, exhibitionId);
      } catch (err) {
        console.error("Error in join-exhibition:", err);
      }
    });

    // Artist goes live - FIX: Added this missing event handler
    socket.on("artist-go-live", async ({ exhibitionId }) => {
      const roomName = `exhibition_${exhibitionId}`;

      try {
        // Update stream status to STREAMING
        await LiveStream.update(
          { stream_status: "STREAMING" },
          { where: { exhibition_id: exhibitionId } },
        );

        // Create LiveKit room if it doesn't exist
        try {
          await roomService.createRoom({
            name: roomName,
            emptyTimeout: 10 * 60, // 10 minutes
            maxParticipants: 100,
          });
          console.log(`LiveKit room created: ${roomName}`);
        } catch (roomErr) {
          // Room might already exist, that's fine
          console.log(`Room ${roomName} might already exist:`, roomErr.message);
        }

        // Notify all viewers that stream has started
        io.to(roomName).emit("stream-started");

        console.log(`Artist went live for exhibition: ${exhibitionId}`);
      } catch (err) {
        console.error("Error in artist-go-live:", err);
      }
    });

    socket.on("artist-end-stream", async ({ exhibitionId }) => {
      const roomName = `exhibition_${exhibitionId}`;

      try {
        // Update exhibition status
        await Exhibition.update(
          { status: "ARCHIVED" },
          { where: { exhibition_id: exhibitionId } },
        );

        // Update live stream status
        await LiveStream.update(
          { stream_status: "IDLE", current_viewers: 0 },
          { where: { exhibition_id: exhibitionId } },
        );

        // Delete LiveKit room
        try {
          await roomService.deleteRoom(roomName);
          console.log(`LiveKit room deleted: ${roomName}`);
        } catch (roomErr) {
          console.log(`Error deleting room ${roomName}:`, roomErr.message);
        }

        // Notify all viewers that stream has ended
        io.to(roomName).emit("stream-ended");

        console.log(`Artist ended stream for exhibition: ${exhibitionId}`);
      } catch (err) {
        console.error("Error ending stream:", err);
      }
    });

    socket.on("disconnecting", async () => {
      const { exhibitionId, role } = socket.data;
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;

      try {
        if (role === "AUTHOR") {
          // Check if artist is the last one disconnecting or if they just lost connection
          const room = io.sockets.adapter.rooms.get(roomName);

          // If there are still viewers, it's just a disconnect, not an end
          if (room && room.size > 0) {
            await LiveStream.update(
              { stream_status: "DISCONNECTED" },
              { where: { exhibition_id: exhibitionId } },
            );
            io.to(roomName).emit("stream-interrupted");
          } else {
            // No one left, stream effectively ended
            await LiveStream.update(
              { stream_status: "IDLE" },
              { where: { exhibition_id: exhibitionId } },
            );
          }
        }

        // Update viewer count after disconnect
        setTimeout(() => {
          broadcastViewerCount(io, roomName, exhibitionId);
        }, 1000);
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
      if (s?.data?.role === "VIEWER") {
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
