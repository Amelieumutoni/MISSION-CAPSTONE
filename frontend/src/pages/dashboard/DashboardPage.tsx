import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useNotificationSocket,
  type LiveNotification,
} from "@/hooks/useNotifications";

// Priority → toast variant
const PRIORITY_TOAST: Record<string, typeof toast.message> = {
  low: toast.message,
  normal: toast.message,
  high: toast.warning,
  urgent: toast.error,
};

// Notification type → emoji
const TYPE_EMOJI: Record<string, string> = {
  exhibition_live: "🔴",
  artwork_sold: "💰",
  new_order: "📦",
  order_status: "🚚",
  new_follower: "👤",
  comment: "💬",
  system: "⚙️",
};

export default function AdminLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();

  const userId = user?.id ?? user?.user_id ?? null;

  // Wire up live notifications — toast fires HERE, not inside the hook
  useNotificationSocket({
    userId,
    onNewNotification: (notification: LiveNotification) => {
      const emoji = TYPE_EMOJI[notification.type] || "🔔";
      const toastFn =
        PRIORITY_TOAST[notification.priority || "normal"] ?? toast.message;

      toastFn(`${emoji} ${notification.title}`, {
        description: notification.message,
        duration: notification.priority === "urgent" ? 8000 : 4500,
        ...(notification.link
          ? {
              action: {
                label: "View",
                onClick: () => (window.location.href = notification.link!),
              },
            }
          : {}),
      });
    },
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-[#050508] transition-colors duration-500 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      <Toaster
        duration={3000}
        richColors={true}
        theme={darkMode ? "system" : "light"}
        position="top-right"
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#050508] relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/[0.07] blur-[120px] rounded-none rotate-12" />
            <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[50%] bg-violet-600/5 dark:bg-violet-600/[0.05] blur-[100px] rounded-none -rotate-12" />
          </div>

          <div className="relative z-10 p-6 lg:p-10 xl:p-14 max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
