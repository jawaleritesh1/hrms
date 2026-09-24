import { X, Calendar as CalendarIcon, Users } from "lucide-react";
import type { CalendarDay } from "../../types";
import "./MobileCalendarDayModal.css";

type MobileCalendarDayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  day: CalendarDay | null;
  selectedDate: Date;
  onViewTeam?: () => void;
};

export default function MobileCalendarDayModal({
  isOpen,
  onClose,
  day,
  selectedDate,
  onViewTeam,
}: MobileCalendarDayModalProps) {
  if (!isOpen) return null;

  const dateHeading = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fullDateSubtitle = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const isHoliday = day?.status === "HOLIDAY";
  const isWorkingSaturday = day?.status === "WORKING_SATURDAY";

  let statusTitle = "Working Day";
  if (isHoliday) statusTitle = "Holiday";
  else if (isWorkingSaturday) statusTitle = "Working Saturday";
  else if (isWeekend && day?.status !== "WORKING_SATURDAY") statusTitle = "Weekly Off";

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title">{dateHeading}</h2>
          <button className="mobile-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mobile-modal-body">
          {/* Day Status Card */}
          <div className="calendar-day-header-card">
            <div className={`calendar-day-icon-wrap ${isHoliday ? "holiday" : isWeekend ? "off" : "working"}`}>
              <CalendarIcon size={22} />
            </div>
            <div className="calendar-day-info">
              <h3 className="day-type-title">{statusTitle}</h3>
              <p className="day-full-date">{fullDateSubtitle}</p>
            </div>
          </div>

          {/* Your Schedule Section */}
          <div className="schedule-section">
            <h4 className="schedule-section-title">Your Schedule</h4>
            <div className="schedule-timeline">
              <div className="schedule-item">
                <span className="timeline-dot green"></span>
                <div className="schedule-details">
                  <div className="schedule-name">Office Hours</div>
                  <div className="schedule-time">10:00 AM – 07:00 PM</div>
                </div>
              </div>

              <div className="schedule-item">
                <span className="timeline-dot blue"></span>
                <div className="schedule-details">
                  <div className="schedule-name">Break Time</div>
                  <div className="schedule-time">01:00 PM – 02:00 PM</div>
                </div>
              </div>

              <div className="schedule-item">
                <span className="timeline-dot amber"></span>
                <div className="schedule-details">
                  <div className="schedule-name">Tea Break</div>
                  <div className="schedule-time">04:30 PM – 05:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Attendance Section */}
          <div className="team-attendance-section">
            <h4 className="schedule-section-title">Team Attendance</h4>
            <div className="team-attendance-card">
              <div className="team-users-icon">
                <Users size={20} />
              </div>
              <div className="team-attendance-text">
                <strong>11 / 11</strong>
                <span>Members Present</span>
              </div>
              {onViewTeam && (
                <button
                  type="button"
                  className="view-team-btn"
                  onClick={onViewTeam}
                >
                  View Team
                </button>
              )}
            </div>
          </div>

          {/* Events / Holidays Section */}
          <div className="events-holiday-section">
            <h4 className="schedule-section-title">Events / Holidays</h4>
            <div className="event-holiday-card">
              <div className="event-icon-wrap">
                <CalendarIcon size={18} />
              </div>
              <div className="event-text">
                {day?.exception?.name || day?.exception?.description ? (
                  <span className="event-name">{day?.exception?.name || day?.exception?.description}</span>
                ) : (
                  <span className="no-events-text">No events for this day.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
