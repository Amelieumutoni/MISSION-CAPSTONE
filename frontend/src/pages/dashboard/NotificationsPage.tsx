import React, { useState, useEffect } from "react";
import NotificationService from "@/api/services/notificationSerivce";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bell,
  Trash2,
  MailOpen,
  AlertTriangle,
  Eye,
  ArrowRight,
} from "lucide-react";

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getMyNotifications();
      setNotifications(data.data || data);
    } catch (err) {
      toast.error("COMMUNICATION ERROR", {
        description: "Could not synchronize with the notification registry.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      toast.error("REGISTRY ERROR", {
        description: "Failed to update notification state.",
      });
    }
  };

  const handleDelete = async (id) => {
    toast.promise(NotificationService.deleteNotification(id), {
      loading: "DELETING RECORD...",
      success: () => {
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== id),
        );
        return "NOTIFICATION PURGED.";
      },
      error: "FAILED TO PURGE RECORD.",
    });
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    if (filter === "URGENT")
      return n.priority === "urgent" || n.priority === "high";
    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl text-slate-900 dark:text-slate-100">
      {/* Header Section */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">
            Registry / Communication
          </p>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
        </div>

        {/* Filter Navigation */}
        <div className="flex gap-6 border-b border-slate-100 dark:border-white/10 pb-1">
          {["ALL", "UNREAD", "URGENT"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-mono tracking-widest transition-all pb-1 ${
                filter === f
                  ? "text-slate-900 dark:text-white border-b border-slate-900 dark:border-white"
                  : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
              }`}
            >
              {f}{" "}
              {f === "UNREAD" &&
                `(${notifications.filter((n) => !n.is_read).length})`}
            </button>
          ))}
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-0 border-t border-slate-100 dark:border-white/10">
        {isLoading ? (
          <p className="py-20 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600">
            Synchronizing Registry...
          </p>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-32 text-center border-b border-slate-100 dark:border-white/10">
            <Bell
              size={24}
              className="mx-auto text-slate-200 dark:text-slate-800 mb-4"
            />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600">
              No records found in this category.
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <article
              key={notif.notification_id}
              className={`group flex items-center justify-between py-8 border-b border-slate-100 dark:border-white/5 transition-all ${
                !notif.is_read
                  ? "bg-slate-50/50 dark:bg-white/[0.02] -mx-4 px-4"
                  : "hover:bg-slate-50/30 dark:hover:bg-white/[0.01]"
              }`}
            >
              <div className="flex items-start gap-6 max-w-2xl">
                <div className="mt-1">
                  {notif.priority === "urgent" || notif.priority === "high" ? (
                    <AlertTriangle
                      size={16}
                      className="text-red-500 dark:text-red-400"
                    />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 ${
                        notif.is_read
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "bg-slate-900 dark:bg-indigo-400"
                      }`}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3
                      className={`text-sm tracking-tight ${
                        !notif.is_read
                          ? "font-bold text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-300 dark:text-slate-700">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif">
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.notification_id)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <MailOpen size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.notification_id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {notif.link && (
                  <Button
                    variant="ghost"
                    className="h-8 px-3 rounded-none border border-slate-200 dark:border-white/10 text-[9px] font-mono uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    View <ArrowRight size={12} className="ml-2" />
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {notifications.some((n) => !n.is_read) && (
        <footer className="mt-12">
          <button
            onClick={() =>
              NotificationService.markAllAsRead().then(loadNotifications)
            }
            className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-indigo-400 transition-all border-b border-transparent hover:border-slate-900 dark:hover:border-indigo-400 pb-1"
          >
            Mark all records as read
          </button>
        </footer>
      )}
    </div>
  );
}
