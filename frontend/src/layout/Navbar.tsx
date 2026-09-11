import "./Navbar.css";
import { Bell, LogOut, Search, UserRound, Clock, Trophy, Star, Plus, Minus, CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import type { Role } from "../types";
import { useApp } from "../context/AppContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import Modal from "../components/common/Modal";
import { apiRequest } from "../services/api";
import toast from "react-hot-toast";

function getNotificationIcon(type: string): { emoji: string; className: string } {
  switch (type) {
    case "TASK":
      return { emoji: "📋", className: "notif-icon--task" };
    case "LEAVE":
      return { emoji: "🏖️", className: "notif-icon--leave" };
    case "ATTENDANCE":
      return { emoji: "⏰", className: "notif-icon--attendance" };
    case "PAYROLL":
      return { emoji: "💰", className: "notif-icon--payroll" };
    case "ANNOUNCEMENT":
      return { emoji: "📢", className: "notif-icon--announcement" };
    case "INCENTIVE":
      return { emoji: "🎁", className: "notif-icon--incentive" };
    default:
      return { emoji: "🔔", className: "notif-icon--default" };
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

type NavbarProps = {
  title: string;
  navOpen: boolean;
  onToggleNav: () => void;
  token: string | null;
  currentEmployeeId: number | null;
  role: Role;
  onLogout: () => void | Promise<void>;
};

export default function Navbar({ title: _title, navOpen, onToggleNav, token, currentEmployeeId, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const { summary, notifications, loading: notificationsLoading, error: notificationsError, refreshSummary, markNotificationAsRead, markAllNotificationsAsRead, serverTimeOffset } = useApp();
  const { subscribeUser, isSubscribing } = usePushNotifications(token);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [now, setNow] = useState(() => Date.now());

  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handlePointsClick = async () => {
    if (!currentEmployeeId) return;
    setShowPointsHistory(true);
    setIsLoadingHistory(true);
    setPointsHistory([]);
    try {
      const res = await apiRequest<any[]>(`/employees/${currentEmployeeId}/points-history`, { token });
      setPointsHistory(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load points history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const formattedDate = useMemo(() => {
    const d = new Date(now);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short" }).format(d);
    const day = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", day: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "short" }).format(d);
    const year = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric" }).format(d);
    return `${weekday}, ${day} ${month} ${year}`;
  }, [now]);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(now));
  }, [now]);

  const employeeFirstName = summary?.currentEmployee?.firstName || "Ritesh";
  const employeeLastName = summary?.currentEmployee?.lastName || "Jawale";
  const employeeInitial = employeeFirstName.charAt(0).toUpperCase();
  const employeeJobTitle = summary?.currentEmployee?.jobTitle || "Technical Manager";



  const lastScrollY = useRef(0);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const canSearchEmployees = false;

  const totalUnreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [notificationsOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show if scrolling up, hide if scrolling down (and past a threshold)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
        setNotificationsOpen(false); // Close notifications if open and scrolling
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleEmployeeSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();

    navigate(trimmedSearchTerm ? `/employees?search=${encodeURIComponent(trimmedSearchTerm)}` : "/employees");
  }

  async function handleBellClick() {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      void refreshSummary();
    }
  }

  const handleLogoutConfirm = () => {
    const attendance = summary?.attendanceToday;
    const checkInTimeStr = attendance?.checkInTime;
    const isCheckedIn = Boolean(checkInTimeStr && !attendance?.checkOutTime);

    let confirmMessage = "Are you sure you want to log out? Your current session will be ended.";
    if (isCheckedIn && checkInTimeStr) {
      const checkIn = new Date(checkInTimeStr);
      const currentCalibratedTime = new Date(now + serverTimeOffset);
      const elapsedMins = Math.max(0, Math.floor((currentCalibratedTime.getTime() - checkIn.getTime()) / 60000));
      const requiredMins = 540 + (attendance?.penaltyMinutes || 0);

      if (elapsedMins < requiredMins) {
        const remaining = requiredMins - elapsedMins;
        const remH = Math.floor(remaining / 60);
        const remM = remaining % 60;
        confirmMessage = `⚠️ WARNING: You have not completed your required working hours today yet!\n\nYou still have approximately ${remH}h ${remM}m remaining (including any late penalties).\n\nAre you sure you want to log out of the application?`;
      }
    }

    if (window.confirm(confirmMessage)) {
      void onLogout();
    }
  };

  return (
    <>
      <header className={`topbar ${!isVisible ? "topbar--hidden" : ""}`}>
      {/* Left: Mobile Nav Button & Search Pill */}
      <div className="topbar-left">
        <Button className="mobile-nav-toggle" variant="secondary" type="button" onClick={onToggleNav}>
          {navOpen ? "Close menu" : "Menu"}
        </Button>

        {canSearchEmployees ? (
          <form className="topbar-search-pill" onSubmit={handleEmployeeSearchSubmit}>
            <Search className="topbar-search-icon" size={17} strokeWidth={2.2} />
            <input
              className="topbar-search-input"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search employees, leaves, tasks..."
            />
          </form>
        ) : (
          <div className="topbar-search-pill">
            <Search className="topbar-search-icon" size={17} strokeWidth={2.2} />
            <input
              className="topbar-search-input"
              type="search"
              placeholder="Search employees, leaves, tasks..."
              disabled
            />
          </div>
        )}
      </div>

      {/* Right Actions: Date, Time, Bell, User Chip */}
      <div className="topbar-actions">

        {/* Date Display */}
        <div className="topbar-date-item">
          <CalendarDays size={18} strokeWidth={2} className="topbar-item-icon" />
          <span className="topbar-date-text">{formattedDate}</span>
        </div>

        {/* Divider */}
        <div className="topbar-divider" />

        {/* Time Display */}
        <div className="topbar-time-item">
          <Clock size={18} strokeWidth={2} className="topbar-item-icon" />
          <div className="topbar-time-info">
            <strong className="topbar-time-val">{formattedTime}</strong>
            <span className="topbar-time-tz">Kolkata, India</span>
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="topbar-notifications" ref={notificationsRef}>
          <button
            type="button"
            className="topbar-bell-btn"
            aria-label="Notifications"
            onClick={() => void handleBellClick()}
          >
            <Bell size={18} strokeWidth={2} />
            {totalUnreadCount > 0 && (
              <span className="topbar-bell-badge">
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </span>
            )}
          </button>

          {notificationsOpen ? (
            <div className="topbar-notification-popover">
              <div className="topbar-notification-popover__header">
                <strong>Notifications</strong>
                <div className="topbar-notification-popover__actions">
                  <button 
                    type="button" 
                    className="text-action-btn" 
                    onClick={() => void markAllNotificationsAsRead()} 
                    disabled={totalUnreadCount === 0}
                  >
                    Mark all read
                  </button>
                  <button 
                    type="button" 
                    className="text-action-btn" 
                    onClick={async () => {
                      try {
                        await subscribeUser();
                        alert("Desktop notifications enabled!");
                      } catch (err: any) {
                        alert(err.message || "Failed to enable notifications");
                      }
                    }} 
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? "Enabling..." : "Alerts"}
                  </button>
                  <button 
                    type="button" 
                    className="text-action-btn" 
                    onClick={() => void refreshSummary()} 
                    disabled={notificationsLoading}
                  >
                    {notificationsLoading ? "..." : "Refresh"}
                  </button>
                </div>
              </div>
              {notificationsLoading ? <p className="muted">Loading updates...</p> : null}
              {notificationsError ? <p className="error-text">{notificationsError}</p> : null}
              {!notificationsLoading && !notificationsError ? (
                notifications.length ? (
                  <div className="topbar-notification-list">
                    <div className="topbar-notification-list__label">Last 7 days activity</div>
                    {notifications.map((item) => {
                      const iconInfo = getNotificationIcon(item.type);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`topbar-notification-item ${!item.isRead ? "unread" : ""}`}
                          onClick={() => {
                            if (!item.isRead) {
                              void markNotificationAsRead(item.id);
                            }
                            if (item.link) {
                              navigate(item.link);
                            }
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="topbar-notification-item__icon-wrapper">
                            <div className={`topbar-notification-item__icon ${iconInfo.className}`}>
                              {iconInfo.emoji}
                            </div>
                          </div>
                          <div className="topbar-notification-item__content">
                            <div className="topbar-notification-item__top">
                              <span className="topbar-notification-item__title">
                                {item.title}
                                {!item.isRead && <span className="unread-dot" />}
                              </span>
                              <span className="topbar-notification-item__time">
                                {getRelativeTime(item.createdAt)}
                              </span>
                            </div>
                            <span className="topbar-notification-item__desc">{item.message}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="topbar-notification-empty">
                    <div className="topbar-notification-empty__icon">🔔</div>
                    <p className="topbar-notification-empty__title">You're all caught up!</p>
                    <p className="topbar-notification-empty__desc">No new notifications in the last 7 days.</p>
                  </div>
                )
              ) : null}
              <div className="topbar-notification-popover__footer">
                <button 
                  type="button" 
                  className="topbar-notification-view-all"
                  onClick={() => {
                    navigate("/notifications");
                    setNotificationsOpen(false);
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* User Profile Chip & Dropdown */}
        <div className="topbar-user-menu-wrap" ref={userMenuRef}>
          <button
            type="button"
            className="topbar-user-chip"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            aria-label="User menu"
          >
            <div className="topbar-user-avatar">{employeeInitial}</div>
            <div className="topbar-user-details">
              <span className="topbar-user-name">{employeeFirstName} {employeeLastName}</span>
              <span className="topbar-user-role">{employeeJobTitle}</span>
            </div>
            <ChevronDown size={14} className={`topbar-user-chevron ${userMenuOpen ? "open" : ""}`} />
          </button>

          {userMenuOpen && (
            <div className="topbar-user-dropdown">
              <button
                type="button"
                className="topbar-user-dropdown-item"
                onClick={() => {
                  if (currentEmployeeId) navigate(`/employees/${currentEmployeeId}`);
                  setUserMenuOpen(false);
                }}
              >
                <UserRound size={16} />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                className="topbar-user-dropdown-item"
                onClick={() => {
                  handlePointsClick();
                  setUserMenuOpen(false);
                }}
              >
                <Trophy size={16} />
                <span>Points History</span>
              </button>
              <div className="topbar-user-dropdown-divider" />
              <button
                type="button"
                className="topbar-user-dropdown-item topbar-user-dropdown-item--logout"
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogoutConfirm();
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* Points History Modal */}
      <Modal
        open={showPointsHistory}
        title="My Points History"
        onClose={() => setShowPointsHistory(false)}
      >
        <div style={{ padding: "12px 0" }}>
          {isLoadingHistory ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading history...</div>
          ) : pointsHistory.length === 0 ? (
            <div style={{ 
              padding: "40px 20px", 
              textAlign: "center", 
              color: "#64748b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <Trophy size={40} style={{ opacity: 0.35 }} />
              <span style={{ fontSize: "12px", fontWeight: "500" }}>No points history found.</span>
            </div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {pointsHistory.map(entry => (
                <div key={entry.id} style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", alignItems: "center" }}>
                    <strong style={{ fontSize: "12px", color: entry.mode === "add" ? "#059669" : entry.mode === "subtract" ? "#dc2626" : "#4f46e5", display: "flex", alignItems: "center", gap: "6px" }}>
                      {entry.mode === "add" ? <Plus size={14} /> : entry.mode === "subtract" ? <Minus size={14} /> : <Star size={14} />}
                      {entry.amount} pts
                    </strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#334155", marginBottom: "8px", lineHeight: "1.5" }}>{entry.reason}</div>
                  {entry.givenBy && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px", fontWeight: "bold" }}>
                        {entry.givenBy.firstName[0]}{entry.givenBy.lastName[0]}
                      </span>
                      Given by {entry.givenBy.firstName} {entry.givenBy.lastName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
