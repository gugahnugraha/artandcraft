"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch notifications on mount
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(console.error);

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (id === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4 bg-muted/20">
            <h3 className="font-bold text-foreground">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead("all")}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Belum ada notifikasi.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => {
                  const content = (
                    <div
                      className={`p-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!notification.read ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: id })}
                        </span>
                      </div>
                      <p className={`text-xs ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                    </div>
                  );

                  if (notification.link) {
                    return (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={notification.id} onClick={() => handleNotificationClick(notification)} className="cursor-pointer">
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-2 border-t border-border bg-muted/20 text-center">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:underline">
              Lihat Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
