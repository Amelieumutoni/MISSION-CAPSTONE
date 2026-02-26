import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface LiveNotification {
  notification_id: number;
  recipient_id: string | number;
  actor_id?: string | number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  entity_type?: string | null;
  entity_id?: string | number | null;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: any;
  is_read: boolean;
  createdAt: string;
}

interface UseNotificationSocketOptions {
  userId: string | number | null | undefined;
  onNewNotification?: (notification: LiveNotification) => void;
  onNotificationRead?: (notificationId: number) => void;
  onAllRead?: () => void;
}

export function useNotificationSocket({
  userId,
  onNewNotification,
  onNotificationRead,
  onAllRead,
}: UseNotificationSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  const markRead = useCallback(
    (notificationId: number) => {
      if (!socketRef.current || !userId) return;
      socketRef.current.emit("notification:markRead", {
        notificationId,
        userId: String(userId),
      });
    },
    [userId],
  );

  const markAllRead = useCallback(() => {
    if (!socketRef.current || !userId) return;
    socketRef.current.emit("notification:markAllRead", {
      userId: String(userId),
    });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const socket = io(window.location.origin, {
      query: { userId: String(userId) },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      transports: ["polling", "websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("notification:register", { userId: String(userId) });
    });

    socket.on("notification:new", (notification: LiveNotification) => {
      onNewNotification?.(notification);
    });

    socket.on(
      "notification:read",
      ({ notificationId }: { notificationId: number }) => {
        onNotificationRead?.(notificationId);
      },
    );

    socket.on("notification:allRead", () => {
      onAllRead?.();
    });

    socket.on("reconnect", () => {
      socket.emit("notification:register", { userId: String(userId) });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return { markRead, markAllRead };
}
