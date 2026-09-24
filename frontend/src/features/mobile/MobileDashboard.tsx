import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { apiRequest } from "../../services/api";
import toast from "react-hot-toast";
import { FingerprintIcon, PlantArtIllustration } from "./MobileIcons";
import "./MobileDashboard.css";

type MobileDashboardProps = {
  token: string | null;
  onNavigateTab?: (tab: string) => void;
};

export default function MobileDashboard({ token }: MobileDashboardProps) {
  const { summary } = useApp();
  const currentEmployee = summary?.currentEmployee;
  const attendanceToday = summary?.attendanceToday;

  const [loadingAction, setLoadingAction] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(Boolean(attendanceToday?.checkInTime && !attendanceToday?.checkOutTime));

  useEffect(() => {
    setIsCheckedIn(Boolean(attendanceToday?.checkInTime && !attendanceToday?.checkOutTime));
  }, [attendanceToday]);

  const firstName = currentEmployee?.firstName || "Employee";
  const lastName = currentEmployee?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  // Dynamic greeting based on current hour
  const hour = new Date().getHours();
  let greeting = "Good Morning,";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon,";
  else if (hour >= 17) greeting = "Good Evening,";

  // Dynamic today string: e.g. "Today, 16 Sep 2026"
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Calculate working, break, remaining
  const workedMinutes = attendanceToday?.workedMinutes || 0;
  const workedH = Math.floor(workedMinutes / 60);
  const workedM = workedMinutes % 60;

  const breakMinutes = attendanceToday?.penaltyMinutes || 0; // or breaks
  const breakH = Math.floor(breakMinutes / 60);
  const breakM = breakMinutes % 60;

  const totalRequired = 540; // 9 hours
  const remainingMinutes = Math.max(0, totalRequired - workedMinutes);
  const remainingH = Math.floor(remainingMinutes / 60);
  const remainingM = remainingMinutes % 60;

  let statusLabel = "Not Checked In";
  let statusTone = "not-checked-in";
  if (attendanceToday?.checkOutTime) {
    statusLabel = "Completed";
    statusTone = "completed";
  } else if (attendanceToday?.checkInTime) {
    statusLabel = "Checked In";
    statusTone = "checked-in";
  }

  async function handleAttendanceAction() {
    if (!token) return;
    try {
      setLoadingAction(true);
      const actionPath = isCheckedIn ? "/attendance/check-out" : "/attendance/check-in";
      await apiRequest(actionPath, { method: "POST", token });
      toast.success(isCheckedIn ? "Checked out successfully!" : "Checked in successfully!");
      setIsCheckedIn(!isCheckedIn);
      window.location.reload(); // Refresh context
    } catch (err: any) {
      toast.error(err?.message || "Failed to perform attendance action.");
    } finally {
      setLoadingAction(false);
    }
  }

  return (
    <div className="mobile-dashboard-page">
      {/* 1. Greeting Banner Card */}
      <div className="mobile-greeting-card">
        <div className="greeting-text-col">
          <span className="greeting-time-sub">{greeting}</span>
          <h1 className="greeting-user-name">{fullName}</h1>
          <p className="greeting-inspire-quote">
            Let's make today productive and meaningful.
          </p>
        </div>
        <div className="greeting-art-col">
          <PlantArtIllustration />
        </div>
      </div>

      {/* 2. Attendance Widget Card */}
      <div className="mobile-attendance-card">
        <div className="attendance-card-top-row">
          <div className="attendance-title-wrap">
            <div className="attendance-clock-badge">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="attendance-card-title">Attendance</h2>
              <span className="attendance-card-date">Today, {todayFormatted}</span>
            </div>
          </div>
          <div className={`attendance-status-pill ${statusTone}`}>
            {statusLabel}
          </div>
        </div>

        {/* Big Fingerprint Check In / Check Out Button */}
        <button
          className={`mobile-checkin-action-btn ${isCheckedIn ? "checked-in" : ""}`}
          onClick={handleAttendanceAction}
          disabled={loadingAction}
        >
          <FingerprintIcon size={22} color="#ffffff" />
          <span>{loadingAction ? "Processing..." : isCheckedIn ? "Check Out" : "Check In"}</span>
        </button>

        {/* 4-Metric Footer */}
        <div className="attendance-metrics-grid">
          <div className="metric-col">
            <span className="metric-label">Working</span>
            <span className="metric-val">{workedH}h {workedM}m</span>
          </div>
          <div className="metric-col">
            <span className="metric-label">Break</span>
            <span className="metric-val">{breakH}h {breakM}m</span>
          </div>
          <div className="metric-col">
            <span className="metric-label">Remaining</span>
            <span className="metric-val">{remainingH}h {remainingM}m</span>
          </div>
          <div className="metric-col">
            <span className="metric-label">Status</span>
            <span className="metric-val status-text">{statusLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
