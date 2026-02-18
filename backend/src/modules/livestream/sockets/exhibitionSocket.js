const { LiveStream, Exhibition, Sequelize } = require("../../index");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // 1. JOINING THE EXHIBITION
    socket.on("join-exhibition", async ({ exhibitionId, role }) => {
      socket.join(`exhibition_${exhibitionId}`);

      // Store metadata in the socket instance for easier cleanup on disconnect
      socket.data.exhibitionId = exhibitionId;
      socket.data.role = role;

      await LiveStream.update(
        {
          total_views: Sequelize.literal("total_views + 1"),
          stream_status: role === "AUTHOR" ? "STREAMING" : undefined,
        },
        { where: { exhibition_id: exhibitionId } },
      );

      // Get current room size to broadcast
      const currentRoom = io.sockets.adapter.rooms.get(
        `exhibition_${exhibitionId}`,
      );
      const count = currentRoom ? currentRoom.size : 0;

      // Update active viewer count for real-time display
      await LiveStream.update(
        { current_viewers: count },
        { where: { exhibition_id: exhibitionId } },
      );

      // Broadcast new count to everyone
      io.to(`exhibition_${exhibitionId}`).emit("viewer-count-update", {
        count,
      });
    });

    // 2. ARTIST STARTING STREAM
    socket.on("artist-go-live", async ({ exhibitionId, peerId }) => {
      await LiveStream.update(
        { artist_peer_id: peerId, stream_status: "STREAMING" },
        { where: { exhibition_id: exhibitionId } },
      );

      socket.to(`exhibition_${exhibitionId}`).emit("stream-started", {
        peerId: peerId,
        status: "LIVE",
      });
    });

    // 3. ARTIST ENDING STREAM (Manually)
    socket.on("artist-end-stream", async ({ exhibitionId }) => {
      await Exhibition.update(
        { status: "ARCHIVED" },
        { where: { exhibition_id: exhibitionId } },
      );

      await LiveStream.update(
        { stream_status: "IDLE", artist_peer_id: null, current_viewers: 0 },
        { where: { exhibition_id: exhibitionId } },
      );

      io.to(`exhibition_${exhibitionId}`).emit("stream-ended", {
        message: "This exhibition has concluded. Thank you for visiting!",
        nextStep: "REDIRECT_TO_GALLERY",
      });
    });

    // 4. HANDLING DISCONNECTS
    socket.on("disconnecting", async () => {
      const exhibitionId = socket.data.exhibitionId;
      if (!exhibitionId) return;

      const roomName = `exhibition_${exhibitionId}`;

      // Logic for when the Artist drops unexpectedly
      if (socket.data.role === "AUTHOR") {
        await LiveStream.update(
          { stream_status: "DISCONNECTED" },
          { where: { exhibition_id: exhibitionId } },
        );

        socket.to(roomName).emit("stream-interrupted", {
          message: "Artist lost connection. Attempting to reconnect...",
        });
      }

      // Update current viewer count for those remaining
      const currentRoom = io.sockets.adapter.rooms.get(roomName);
      const count = currentRoom ? currentRoom.size - 1 : 0;

      await LiveStream.update(
        { current_viewers: Math.max(0, count) },
        { where: { exhibition_id: exhibitionId } },
      );

      socket
        .to(roomName)
        .emit("viewer-count-update", { count: Math.max(0, count) });
    });
  });
};
