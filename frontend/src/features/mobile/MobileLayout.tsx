import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Bell, Home, Clock, FileText, Calendar, LogOut, User, CheckSquare, BarChart2 } from "lucide-react";
import type { SessionUser } from "../../types";
import { useApp } from "../../context/AppContext";
import MobileDashboard from "./MobileDashboard";
import MobileAttendance from "./MobileAttendance";
import MobileLeaves from "./MobileLeaves";
import MobileCalendar from "./MobileCalendar";
import "./MobileLayout.css";

type MobileLayoutProps = {
  sessionUser: SessionUser;
  token: string | null;
  onLogout: () => Promise<void>;
  children?: React.ReactNode;
};

export default function MobileLayout({
  sessionUser,
  token,
  onLogout,
  children,
}: MobileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications } = useApp();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const pathname = location.pathname;
  const isHome = pathname === "/" || pathname === "/dashboard";
  const isAttendance = pathname.startsWith("/attendance");
  const isLeave = pathname.startsWith("/leaves");
  const isCalendar = pathname.startsWith("/calendar");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const employee = sessionUser.employee;
  const initialLetter = employee?.firstName ? employee.firstName.charAt(0).toUpperCase() : "U";

  // Determine which page content to render
  const renderContent = () => {
    if (isHome) {
      return <MobileDashboard token={token} onNavigateTab={(tab) => navigate(`/${tab}`)} />;
    }
    if (isAttendance) {
      return <MobileAttendance token={token} />;
    }
    if (isLeave) {
      return <MobileLeaves token={token} currentEmployeeId={employee?.id ?? null} />;
    }
    if (isCalendar) {
      return <MobileCalendar token={token} />;
    }
    // For other secondary sub-pages (e.g. notifications, profile, etc.)
    return <div className="mobile-outlet-wrap">{children}</div>;
  };

  return (
    <div className="mobile-app-shell">
      {/* 1. Mobile Top Header */}
      <header className="mobile-header">
        <button
          className="mobile-header-btn menu-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="mobile-header-logo-wrap" onClick={() => navigate("/")}>
          <img
            src="/assets/images/Logo.png?v=2"
            alt="SGS Logo"
            className="mobile-sgs-logo"
            onError={(e) => {
              // Fallback text if image not found
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="mobile-brand-text">
            <span className="mobile-brand-sgs">SGS</span>
            <span className="mobile-brand-tag">SANSKAR GROUP IT SOLUTIONS</span>
          </div>
        </div>

        <div className="mobile-header-actions">
          <button
            className="mobile-header-btn bell-btn"
            onClick={() => navigate("/notifications")}
            aria-label="View notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          <button
            className="mobile-avatar-circle"
            onClick={() => navigate("/profile")}
            aria-label="View profile"
          >
            {initialLetter}
          </button>
        </div>
      </header>

      {/* 2. Page Content Area */}
      <main className="mobile-main-content">
        {renderContent()}
      </main>

      {/* 3. Sticky Bottom Navigation Bar (4 required tabs) */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`bottom-nav-tab ${isHome ? "active" : ""}`}>
          <div className="nav-tab-icon">
            <Home size={20} />
          </div>
          <span className="nav-tab-label">Home</span>
        </Link>

        <Link to="/attendance" className={`bottom-nav-tab ${isAttendance ? "active" : ""}`}>
          <div className="nav-tab-icon">
            <Clock size={20} />
          </div>
          <span className="nav-tab-label">Attendance</span>
        </Link>

        <Link to="/leaves" className={`bottom-nav-tab ${isLeave ? "active" : ""}`}>
          <div className="nav-tab-icon">
            <FileText size={20} />
          </div>
          <span className="nav-tab-label">Leave</span>
        </Link>

        <Link to="/calendar" className={`bottom-nav-tab ${isCalendar ? "active" : ""}`}>
          <div className="nav-tab-icon">
            <Calendar size={20} />
          </div>
          <span className="nav-tab-label">Calendar</span>
        </Link>
      </nav>

      {/* 4. Slide-Over Mobile Drawer Menu */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-user-card">
              <div className="drawer-avatar">{initialLetter}</div>
              <div className="drawer-user-info">
                <strong>{employee?.firstName} {employee?.lastName}</strong>
                <span>{sessionUser.email}</span>
                <span className="drawer-role-badge">{sessionUser.role}</span>
              </div>
            </div>

            <nav className="drawer-nav-list">
              <Link
                to="/"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/attendance"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <Clock size={18} />
                <span>Attendance</span>
              </Link>
              <Link
                to="/leaves"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <FileText size={18} />
                <span>Leave Management</span>
              </Link>
              <Link
                to="/calendar"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <Calendar size={18} />
                <span>Company Calendar</span>
              </Link>
              <Link
                to="/profile"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <User size={18} />
                <span>My Profile</span>
              </Link>
              <Link
                to="/tasks/my"
                className="drawer-nav-item"
                onClick={() => setDrawerOpen(false)}
              >
                <CheckSquare size={18} />
                <span>My Tasks</span>
              </Link>
              {(sessionUser.role === "ADMIN" || sessionUser.role === "HR" || sessionUser.role === "MANAGER") && (
                <Link
                  to="/analytics"
                  className="drawer-nav-item"
                  onClick={() => setDrawerOpen(false)}
                >
                  <BarChart2 size={18} />
                  <span>Analytics</span>
                </Link>
              )}
            </nav>

            <div className="drawer-footer">
              <button
                className="drawer-logout-btn"
                onClick={async () => {
                  setDrawerOpen(false);
                  await onLogout();
                }}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
