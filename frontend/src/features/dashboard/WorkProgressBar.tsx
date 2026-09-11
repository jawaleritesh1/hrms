import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronDown, Target } from "lucide-react";
import type { Attendance, BreakSession } from "../../types";
import { useApp } from "../../context/AppContext";
import AttendanceQuickAction from "../../components/common/AttendanceQuickAction";
import BreakQuickAction from "../../components/common/BreakQuickAction";
import { apiRequest } from "../../services/api";
import { formatAttendanceTime } from "../../utils/format";
import "./WorkProgressBar.css";

type WorkProgressBarProps = {
  attendanceToday?: Attendance | null;
  workedMinutes?: number | null;
  requiredMinutes?: number;
};

export default function WorkProgressBar({
  attendanceToday,
  workedMinutes,
  requiredMinutes
}: WorkProgressBarProps) {
  const { summary, token, serverTimeOffset } = useApp();
  const [now, setNow] = useState(() => Date.now());
  const [isExpanded, setIsExpanded] = useState(false);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);

  // Real-time dynamic clock tick every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const activeAttendance = attendanceToday !== undefined ? attendanceToday : (summary?.attendanceToday ?? null);

  // Fetch breaks for today to display in dropdown
  const loadBreaks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest<{ breakSessions: BreakSession[] }>("/attendance/break/today", { token });
      setBreakSessions(res.data?.breakSessions || []);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    void loadBreaks();
    const handleBreakEvent = () => void loadBreaks();
    window.addEventListener("break-updated", handleBreakEvent);
    return () => window.removeEventListener("break-updated", handleBreakEvent);
  }, [loadBreaks]);

  const isCheckedIn = Boolean(activeAttendance?.checkInTime);
  const isCheckedOut = Boolean(activeAttendance?.checkOutTime);

  const { worked, remaining, percentage } = useMemo(() => {
    const penalty = activeAttendance?.penaltyMinutes || 0;
    const req = (requiredMinutes && requiredMinutes > 0) ? requiredMinutes : (540 + penalty);

    // 1. If actively checked in and not checked out: compute dynamic elapsed minutes in real-time
    if (activeAttendance?.checkInTime && !activeAttendance.checkOutTime) {
      const checkInMs = new Date(activeAttendance.checkInTime).getTime();
      const currentCalibratedNow = now + (serverTimeOffset || 0);
      const elapsedMinutes = Math.max(0, Math.floor((currentCalibratedNow - checkInMs) / 60000));

      // Subtract breaks if any
      let breakMins = 0;
      const allBreaks = activeAttendance.breakSessions || breakSessions;
      if (Array.isArray(allBreaks)) {
        for (const session of allBreaks) {
          if (session.durationMinutes) {
            breakMins += session.durationMinutes;
          } else if (session.startTime) {
            const startMs = new Date(session.startTime).getTime();
            const endMs = session.endTime ? new Date(session.endTime).getTime() : currentCalibratedNow;
            breakMins += Math.max(0, Math.floor((endMs - startMs) / 60000));
          }
        }
      }

      const netWorked = Math.max(0, elapsedMinutes - breakMins);
      const rem = Math.max(0, req - netWorked);
      const pct = Math.min(100, Math.round((netWorked / req) * 100));

      return { worked: netWorked, required: req, remaining: rem, percentage: pct };
    }

    // 2. If checked out with finalized workedMinutes
    if (activeAttendance?.checkOutTime) {
      const netWorked = Math.max(0, activeAttendance.workedMinutes || 0);
      const rem = Math.max(0, req - netWorked);
      const pct = Math.min(100, Math.round((netWorked / req) * 100));
      return { worked: netWorked, required: req, remaining: rem, percentage: pct };
    }

    // 3. Explicit workedMinutes passed as prop
    if (typeof workedMinutes === "number" && workedMinutes >= 0) {
      const netWorked = workedMinutes;
      const rem = Math.max(0, req - netWorked);
      const pct = Math.min(100, Math.round((netWorked / req) * 100));
      return { worked: netWorked, required: req, remaining: rem, percentage: pct };
    }

    // 4. Default when not checked in
    return { worked: 0, required: req, remaining: req, percentage: 0 };
  }, [activeAttendance, breakSessions, workedMinutes, requiredMinutes, now, serverTimeOffset]);

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const workedLabel = useMemo(() => formatHoursMins(worked), [worked]);
  const remainingLabel = useMemo(() => formatHoursMins(remaining), [remaining]);

  // Total break duration in minutes
  const totalBreakMins = useMemo(() => {
    let mins = 0;
    const allBreaks = activeAttendance?.breakSessions || breakSessions;
    if (Array.isArray(allBreaks)) {
      allBreaks.forEach((b) => {
        if (b.durationMinutes) {
          mins += b.durationMinutes;
        } else if (b.startTime) {
          const startMs = new Date(b.startTime).getTime();
          const endMs = b.endTime ? new Date(b.endTime).getTime() : (now + (serverTimeOffset || 0));
          mins += Math.max(0, Math.floor((endMs - startMs) / 60000));
        }
      });
    }
    return mins;
  }, [activeAttendance?.breakSessions, breakSessions, now, serverTimeOffset]);

  // Continuous uptime (since check-in or since last completed break)
  const uptimeStr = useMemo(() => {
    if (!activeAttendance?.checkInTime) return "--";

    const currentCalibratedNow = now + (serverTimeOffset || 0);
    const activeEnd = activeAttendance.checkOutTime ? new Date(activeAttendance.checkOutTime).getTime() : currentCalibratedNow;

    const allBreaks = activeAttendance.breakSessions || breakSessions;
    const hasActive = allBreaks.some(s => !s.endTime);
    if (hasActive) return "On Break";

    const completed = allBreaks
      .filter(s => s.endTime)
      .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());

    let uptimeMs = 0;
    if (completed.length > 0 && completed[0].endTime) {
      uptimeMs = activeEnd - new Date(completed[0].endTime).getTime();
    } else {
      uptimeMs = activeEnd - new Date(activeAttendance.checkInTime).getTime();
    }

    const uptimeMins = Math.max(0, Math.floor(uptimeMs / 60000));
    const h = Math.floor(uptimeMins / 60);
    const m = uptimeMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [activeAttendance, breakSessions, now, serverTimeOffset]);

  // Event Log Items
  const eventLogItems = useMemo(() => {
    const list: Array<{ time: string; icon: string; text: string; sortMs: number }> = [];

    if (activeAttendance?.checkInTime) {
      list.push({
        time: formatAttendanceTime(activeAttendance.checkInTime),
        icon: "🟢",
        text: `Checked in${activeAttendance.isLate ? ` (Late by ${activeAttendance.lateByMinutes || 0}m)` : ""}`,
        sortMs: new Date(activeAttendance.checkInTime).getTime()
      });
    }

    const allBreaks = activeAttendance?.breakSessions || breakSessions;
    allBreaks.forEach((b) => {
      if (b.startTime) {
        list.push({
          time: formatAttendanceTime(b.startTime),
          icon: "☕",
          text: b.endTime ? `Break completed (${b.durationMinutes || 0}m)` : "Started break (in progress)",
          sortMs: new Date(b.startTime).getTime()
        });
      }
    });

    if (activeAttendance?.checkOutTime) {
      list.push({
        time: formatAttendanceTime(activeAttendance.checkOutTime),
        icon: "🔴",
        text: "Checked out",
        sortMs: new Date(activeAttendance.checkOutTime).getTime()
      });
    }

    return list.sort((a, b) => a.sortMs - b.sortMs);
  }, [activeAttendance, breakSessions]);

  return (
    <div className="work-progress-row">
      {/* Progress Metric Card */}
      <article className={`work-progress-card ${isExpanded ? "is-expanded" : ""}`}>
        <div className="work-progress-top-row">
          <div className="work-progress-icon-box">
            <BarChart3 size={22} className="work-progress-icon" strokeWidth={2.4} />
          </div>

          <div className="work-progress-info">
            <div className="work-progress-header-line">
              <div className="work-progress-titles">
                <h3 className="work-progress-title">Today's Work Progress</h3>
                <span className="work-progress-stats">
                  {workedLabel} worked &bull; {remainingLabel} remaining
                </span>
              </div>

              <div className="work-progress-action-box">
                {summary?.currentEmployee?.id ? (
                  <AttendanceQuickAction
                    token={token}
                    currentEmployeeId={summary.currentEmployee.id}
                    size="compact"
                    showMeta={false}
                  />
                ) : null}

                <button
                  type="button"
                  className={`work-progress-toggle-btn ${isExpanded ? "open" : ""}`}
                  onClick={() => setIsExpanded(prev => !prev)}
                  aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  title={isExpanded ? "Hide breakdown" : "View day summary & breakdown"}
                >
                  <ChevronDown size={17} />
                </button>
              </div>
            </div>

            <div className="work-progress-bar-wrap">
              <div className="work-progress-track">
                <div
                  className="work-progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="work-progress-percentage">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Expandable Dropdown Tray */}
        {isExpanded && (
          <div className="work-progress-expanded-panel">
            <div className="work-progress-dropdown-grid">
              {/* Day Summary Metrics */}
              <div className="work-progress-panel-section">
                <h4 className="work-progress-section-title">Day Summary</h4>
                <div className="work-progress-metrics-grid">
                  <div className="work-progress-stat-chip">
                    <span className="stat-chip-label">Productive Time</span>
                    <strong className="stat-chip-val">{workedLabel}</strong>
                  </div>
                  <div className="work-progress-stat-chip">
                    <span className="stat-chip-label">Break Time</span>
                    <strong className="stat-chip-val">
                      {totalBreakMins > 0 ? `${Math.floor(totalBreakMins / 60) > 0 ? `${Math.floor(totalBreakMins / 60)}h ` : ''}${totalBreakMins % 60}m` : '--'}
                    </strong>
                  </div>
                  <div className="work-progress-stat-chip">
                    <span className="stat-chip-label">Continuous Uptime</span>
                    <strong className="stat-chip-val">{uptimeStr}</strong>
                  </div>
                  <div className="work-progress-stat-chip">
                    <span className="stat-chip-label">Active Penalties</span>
                    <strong className="stat-chip-val">{activeAttendance?.penaltyMinutes ? `${activeAttendance.penaltyMinutes}m` : '--'}</strong>
                  </div>
                </div>
              </div>

              {/* Break Management & Schedule */}
              <div className="work-progress-panel-section">
                <div className="work-progress-section-header">
                  <h4 className="work-progress-section-title">Break Management</h4>
                  {isCheckedIn && !isCheckedOut && (
                    <BreakQuickAction
                      token={token}
                      isCheckedIn={isCheckedIn}
                      isCheckedOut={isCheckedOut}
                    />
                  )}
                </div>
                <div className="work-progress-schedule-list">
                  <div className="work-progress-schedule-item">
                    <span>Morning Tea</span>
                    <strong>11:30 AM - 11:45 AM</strong>
                  </div>
                  <div className="work-progress-schedule-item">
                    <span>Lunch Break</span>
                    <strong>01:30 PM - 02:15 PM</strong>
                  </div>
                  <div className="work-progress-schedule-item">
                    <span>Evening Tea</span>
                    <strong>04:30 PM - 04:45 PM</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            {eventLogItems.length > 0 && (
              <div className="work-progress-event-log-section">
                <h4 className="work-progress-section-title">Today's Activity Log</h4>
                <div className="work-progress-event-log-list">
                  {eventLogItems.map((item, idx) => (
                    <div key={idx} className="work-progress-log-item">
                      <span className="log-item-time">{item.time}</span>
                      <span className="log-item-badge">{item.icon}</span>
                      <span className="log-item-desc">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Motivational Target Card */}
      <article className="work-motivational-card">
        <div className="work-motivational-icon-box">
          <Target size={24} className="work-motivational-icon" strokeWidth={2.2} />
        </div>
        <p className="work-motivational-text">
          Small steps every day create big results.
        </p>
      </article>
    </div>
  );
}
