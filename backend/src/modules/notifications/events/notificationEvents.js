"use strict";
const { Notification } = require("../../index");
const notificationEmitter = require("../../../events/EventEmitter");

// Maps userId → Set of socketIds so one user can be connected on multiple tabs
const userSockets = new Map();

function initNotificationModule(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query?.userId;

    if (userId) {
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      console.log(
        `[Notifications] User ${userId} connected (socket: ${socket.id}) — ${userSockets.get(userId).size} tab(s) open`,
      );

      socket.emit("notification:connected", { userId });
    }

    socket.on("notification:register", ({ userId: uid }) => {
      if (!uid) return;
      socket.data.userId = uid;

      if (!userSockets.has(uid)) {
        userSockets.set(uid, new Set());
      }
      userSockets.get(uid).add(socket.id);

      console.log(
        `[Notifications] User ${uid} registered on socket ${socket.id}`,
      );
      socket.emit("notification:connected", { userId: uid });
    });

    socket.on("notification:markRead", ({ notificationId, userId: uid }) => {
      if (!notificationId || !uid) return;
      emitToUser(io, uid, "notification:read", { notificationId });
    });

    socket.on("notification:markAllRead", ({ userId: uid }) => {
      if (!uid) return;
      emitToUser(io, uid, "notification:allRead", {});
    });

    socket.on("disconnect", () => {
      if (userId && userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          console.log(`[Notifications] User ${userId} fully disconnected`);
        } else {
          console.log(
            `[Notifications] User ${userId} has ${userSockets.get(userId).size} tab(s) remaining`,
          );
        }
      }
    });
  });

  notificationEmitter.on("sendNotification", (data) => {
    const {
      recipient_id,
      actor_id,
      type,
      title,
      message,
      link,
      entity_type,
      entity_id,
      priority,
      metadata,
    } = data;

    if (!recipient_id) return;

    try {
      Notification.create({
        recipient_id,
        actor_id,
        type,
        title,
        message,
        link: link || null,
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        priority: priority || "normal",
        metadata: metadata || null,
      });

      const payload = {
        recipient_id,
        actor_id,
        type,
        title,
        message,
        link: link || null,
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        priority: priority || "normal",
        metadata: metadata || null,
        is_read: false,
        createdAt: new Date().toISOString(),
      };

      const delivered = emitToUser(
        io,
        String(recipient_id),
        "notification:new",
        payload,
      );

      if (delivered) {
        console.log(
          `[Notifications] Live push → User ${recipient_id} (type: ${type})`,
        );
      } else {
        console.log(
          `[Notifications] User ${recipient_id} offline — DB record only`,
        );
      }
    } catch (error) {
      console.error(`[Notifications] Error creating notification: ${error}`);
    }
  });

  console.log("[Notifications] Module initialized");
}

/**
 * Emit an event to ALL active sockets for a given userId.
 * Returns true if at least one socket was found.
 */
function emitToUser(io, userId, event, payload) {
  const socketIds = userSockets.get(String(userId));
  if (!socketIds || socketIds.size === 0) return false;

  for (const sid of socketIds) {
    io.to(sid).emit(event, payload);
  }
  return true;
}

module.exports = { initNotificationModule, emitToUser };
