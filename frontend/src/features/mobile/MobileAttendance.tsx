import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, Coffee, Hourglass, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { apiRequest } from "../../services/api";
import toast from "react-hot-toast";
import { FingerprintIcon } from "./MobileIcons";
import type { Attendance } from "../../types";
import "./MobileAttendance.css";

type MobileAttendanceProps = {
  token: string | null;
};

export default function MobileAttendance({ token }: MobileAttendanceProps) {
  const navigate = useNavigate();
  const { summary } = useApp();
  const attendanceToday = summary?.attendanceToday;

  const [activeTab, setActiveTab] = useState<"today" | "history" | "regularization">("today");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(Boolean(attendanceToday?.checkInTime && !attendanceToday?.checkOutTime));
  const [loadingAction, setLoadingAction] = useState(false);

  // History State
  const [historyMonth, setHistoryMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [historyRecords, setHistoryRecords] = useState<Attendance[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsCheckedIn(Boolean(attendanceToday?.checkInTime && !attendanceToday?.checkOutTime));
  }, [attendanceToday]);

  // Fetch History for selected month
  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      setHistoryLoading(true);
      const res = await apiRequest<{ attendances: Attendance[] }>(
        `/attendance/my?month=${historyMonth.month}&year=${historyMonth.year}`,
        { token }
      );
      setHistoryRecords(res.data?.attendances || []);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }, [token, historyMonth]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const changeMonth = (delta: number) => {
    setHistoryMonth((prev) => {
      let newMonth = prev.month + delta;
      let newYear = prev.year;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const monthLabel = new Date(historyMonth.year, historyMonth.month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate metrics
  const workedMinutes = attendanceToday?.workedMinutes || 0;
  const workedH = Math.floor(workedMinutes / 60);
  const workedM = workedMinutes % 60;

  const breakMinutes = attendanceToday?.penaltyMinutes || 0;
  const breakH = Math.floor(breakMinutes / 60);
  const breakM = breakMinutes % 60;

  const totalRequired = 540;
  const remainingMinutes = Math.max(0, totalRequired - workedMinutes);
  const remainingH = Math.floor(remainingMinutes / 60);
  const remainingM = remainingMinutes % 60;

  let statusText = "Not Checked In";
  if (attendanceToday?.checkOutTime) statusText = "Completed";
  else if (attendanceToday?.checkInTime) statusText = "Checked In";

  async function handleAttendanceAction() {
    if (!token) return;
    try {
      setLoadingAction(true);
      const actionPath = isCheckedIn ? "/attendance/check-out" : "/attendance/check-in";
      await apiRequest(actionPath, { method: "POST", token });
      toast.success(isCheckedIn ? "Checked out successfully!" : "Checked in successfully!");
      setIsCheckedIn(!isCheckedIn);
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || "Failed to perform attendance action.");
    } finally {
      setLoadingAction(false);
    }
  }

  // Format digital clock
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mobile-attendance-page">
      {/* 1. Top Header with Back button & Centered Title */}
      <div className="mobile-page-header">
        <button className="mobile-back-btn" onClick={() => navigate("/")} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="mobile-page-title">Attendance</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* 2. Segmented Navigation Pills */}
      <div className="segmented-pills-bar">
        <button
          className={`seg-pill ${activeTab === "today" ? "active" : ""}`}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
        <button
          className={`seg-pill ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`seg-pill ${activeTab === "regularization" ? "active" : ""}`}
          onClick={() => setActiveTab("regularization")}
        >
          Regularization
        </button>
      </div>

      {/* 3. Screen 2: Today Tab Content */}
      {activeTab === "today" && (
        <div className="attendance-today-content">
          {/* Big Clock Section */}
          <div className="digital-clock-section">
            <div className="digital-clock-time">{timeString}</div>
            <div className="digital-clock-date">{dateString}</div>
            <div className="digital-clock-location">Kolkata, India</div>
          </div>

          {/* Status Headline */}
          <div className="attendance-headline-section">
            <h2 className="headline-status">{statusText}</h2>
            <p className="headline-sub">
              {isCheckedIn
                ? "Your work session is in progress."
                : "Tap the button below to start your day"}
            </p>
          </div>

          {/* Action Button */}
          <button
            className={`mobile-checkin-action-btn large ${isCheckedIn ? "checked-in" : ""}`}
            onClick={handleAttendanceAction}
            disabled={loadingAction}
          >
            <FingerprintIcon size={24} color="#ffffff" />
            <span>{loadingAction ? "Processing..." : isCheckedIn ? "Check Out" : "Check In"}</span>
          </button>

          {/* 2x2 Grid Stats Card */}
          <div className="attendance-grid-card">
            <div className="grid-cell">
              <div className="grid-cell-icon">
                <Clock size={18} />
              </div>
              <div className="grid-cell-data">
                <span className="grid-cell-label">Working Hours</span>
                <span className="grid-cell-val">{workedH}h {workedM}m</span>
              </div>
            </div>

            <div className="grid-cell">
              <div className="grid-cell-icon">
                <Coffee size={18} />
              </div>
              <div className="grid-cell-data">
                <span className="grid-cell-label">Break Time</span>
                <span className="grid-cell-val">{breakH}h {breakM}m</span>
              </div>
            </div>

            <div className="grid-cell">
              <div className="grid-cell-icon">
                <Hourglass size={18} />
              </div>
              <div className="grid-cell-data">
                <span className="grid-cell-label">Remaining</span>
                <span className="grid-cell-val">{remainingH}h {remainingM}m</span>
              </div>
            </div>

            <div className="grid-cell">
              <div className="grid-cell-icon">
                <Compass size={18} />
              </div>
              <div className="grid-cell-data">
                <span className="grid-cell-label">Status</span>
                <span className="grid-cell-val">{statusText}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Screen 8: History Tab Content */}
      {activeTab === "history" && (
        <div className="attendance-history-content">
          {/* Month Switcher */}
          <div className="month-switcher">
            <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <span className="month-title">{monthLabel}</span>
            <button className="month-nav-btn" onClick={() => changeMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* History List */}
          {historyLoading ? (
            <div className="history-loading">Loading records...</div>
          ) : historyRecords.length === 0 ? (
            <div className="history-empty">No records found for this month.</div>
          ) : (
            <div className="history-records-list">
              {historyRecords.map((rec) => {
                const dateObj = new Date(rec.attendanceDate);
                const dayStr = dateObj.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                // Timestamps or day labels
                let timeSpan = "—";
                if (rec.checkInTime) {
                  const inTime = new Date(rec.checkInTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const outTime = rec.checkOutTime
                    ? new Date(rec.checkOutTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "In Progress";
                  timeSpan = `${inTime} – ${outTime}`;
                } else if (dateObj.getDay() === 0) {
                  timeSpan = "Sunday";
                } else if (dateObj.getDay() === 6) {
                  timeSpan = "Saturday";
                }

                // Status pill
                let statusBadgeClass = "present";
                let statusBadgeText = "Present";

                if (rec.status === "HALF_DAY") {
                  statusBadgeClass = "half-day";
                  statusBadgeText = "Half Day";
                } else if (dateObj.getDay() === 0 && !rec.checkInTime) {
                  statusBadgeClass = "weekly-off";
                  statusBadgeText = "Weekly Off";
                } else if (dateObj.getDay() === 6 && !rec.checkInTime) {
                  statusBadgeClass = "working-sat";
                  statusBadgeText = "Saturday Off";
                } else if (rec.status === "ABSENT") {
                  statusBadgeClass = "absent";
                  statusBadgeText = "Absent";
                }

                return (
                  <div key={rec.id} className="history-item-row">
                    <div className="history-date-col">{dayStr}</div>
                    <div className="history-time-col">{timeSpan}</div>
                    <div className="history-status-col">
                      <span className={`status-pill ${statusBadgeClass}`}>
                        {statusBadgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Regularization Tab Content */}
      {activeTab === "regularization" && (
        <div className="attendance-regularization-content">
          <div className="reg-info-card">
            <h3>Attendance Regularization</h3>
            <p>
              Missed a check-in or had biometric synchronization issues? Submit a regularization request for HR/Manager approval.
            </p>
            <button
              className="mobile-submit-btn"
              onClick={() => navigate("/attendance/requests")}
            >
              Open Regularization Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
