"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Info, AlertCircle, ExternalLink, X, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    const wasClosed = !isOpen;
    setIsOpen(wasClosed);

    if (wasClosed) {
      const hasUnread = notifications.some((n) => !n.isRead);
      if (hasUnread) {
        // Optimistically mark as read
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
          await fetch("/api/notifications", { method: "PATCH" });
        } catch (e) {
          console.error("Failed to mark notifications as read", e);
        }
      }
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic delete
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="text-[#00FF00]" size={16} />;
      case "WARNING":
      case "ERROR":
        return <AlertCircle className="text-[#FF0000]" size={16} />;
      default:
        return <Info className="text-white/60" size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-10 h-10 border border-white/10 bg-black text-white/60 hover:bg-white/5 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#FF0000] text-[8px] font-bold text-white ring-2 ring-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] border-2 border-white/10 bg-black shadow-2xl z-50 flex flex-col max-h-[400px]">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h3 className="font-sans text-xs font-black uppercase tracking-widest text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-[#F5E000] uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-xs text-white/40 uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Bell size={24} className="text-white/20" />
                <p className="text-xs text-white/40 uppercase tracking-widest mt-2">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded flex gap-3 transition-colors ${
                    !notification.isRead ? "bg-white/5" : "hover:bg-white/5"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0 relative pr-6">
                    <button 
                      onClick={(e) => deleteNotification(notification.id, e)}
                      className="absolute -top-1 -right-2 p-1 text-white/40 hover:text-[#FF0000] transition-colors rounded"
                      title="Delete notification"
                    >
                      <X size={14} />
                    </button>
                    
                    <p className="text-sm font-bold text-white pr-4 leading-tight">
                      {notification.title}
                    </p>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed break-words">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                        {formatDate(notification.createdAt)}
                      </span>
                      <Link 
                        href={`/${locale}/portal/submissions`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-1 text-[10px] text-[#00FF00] hover:underline uppercase font-bold tracking-widest"
                      >
                        View Submission <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
