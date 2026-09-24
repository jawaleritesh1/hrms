import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import type { CalendarDay, CalendarException } from "../../types";
import MobileCalendarDayModal from "./MobileCalendarDayModal";
import "./MobileCalendar.css";

type MobileCalendarProps = {
  token: string | null;
};

type CalendarResponse = {
  month: number;
  year: number;
  days: CalendarDay[];
  exceptions: CalendarException[];
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MobileCalendar({ token }: MobileCalendarProps) {
  const navigate = useNavigate();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);

  // Selected Day Modal
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const fetchCalendar = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiRequest<CalendarResponse>(
        `/calendar?year=${visibleMonth.year}&month=${visibleMonth.month}`,
        { token }
      );
      setCalendarData(res.data);
    } catch {
      // ignore
    }
  }, [token, visibleMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const changeMonth = (delta: number) => {
    setVisibleMonth((prev) => {
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

  const monthTitle = new Date(visibleMonth.year, visibleMonth.month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate calendar grid days
  const gridCells = useMemo(() => {
    const firstDayOfMonth = new Date(visibleMonth.year, visibleMonth.month - 1, 1);
    const lastDayOfMonth = new Date(visibleMonth.year, visibleMonth.month, 0);

    // Monday is 0 in our index (JS Sunday is 0, Monday is 1)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const cells: Array<{
      dayNum: number | null;
      dateObj: Date | null;
      isCurrentMonth: boolean;
      calendarDay?: CalendarDay;
    }> = [];

    // Leading empty / previous month placeholder cells
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({ dayNum: null, dateObj: null, isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(visibleMonth.year, visibleMonth.month - 1, d);
      const calendarDay = calendarData?.days.find((cd) => cd.dayNumber === d);
      cells.push({
        dayNum: d,
        dateObj,
        isCurrentMonth: true,
        calendarDay,
      });
    }

    // Trailing empty cells to complete the 7-column row
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ dayNum: null, dateObj: null, isCurrentMonth: false });
      }
    }

    return cells;
  }, [visibleMonth, calendarData]);

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === visibleMonth.year && today.getMonth() + 1 === visibleMonth.month;

  const handleDayClick = (cell: (typeof gridCells)[0]) => {
    if (!cell.dateObj) return;
    setSelectedDate(cell.dateObj);
    setSelectedDay(cell.calendarDay || null);
    setIsDayModalOpen(true);
  };

  // Find upcoming holidays from exceptions
  const upcomingHolidays = useMemo(() => {
    if (!calendarData?.exceptions) return [];
    return calendarData.exceptions.filter(
      (e) => e.type === "HOLIDAY"
    );
  }, [calendarData]);

  return (
    <div className="mobile-calendar-page">
      {/* 1. Top Header with Back button */}
      <div className="mobile-page-header">
        <button className="mobile-back-btn" onClick={() => navigate("/")} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="mobile-page-title">Calendar</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* 2. Month Selector */}
      <div className="month-switcher">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          <ChevronLeft size={20} />
        </button>
        <span className="month-title">{monthTitle}</span>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 3. Calendar Grid Container */}
      <div className="calendar-grid-card">
        {/* Weekday Headers */}
        <div className="weekday-headers-row">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="weekday-cell">
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="days-grid-cells">
          {gridCells.map((cell, idx) => {
            if (!cell.isCurrentMonth || !cell.dayNum) {
              return <div key={`empty-${idx}`} className="day-cell empty" />;
            }

            const isToday = isCurrentMonthView && today.getDate() === cell.dayNum;
            const isWeekend = cell.dateObj?.getDay() === 0 || cell.dateObj?.getDay() === 6;
            const isHoliday = cell.calendarDay?.status === "HOLIDAY";
            const isWorkingSat = cell.calendarDay?.status === "WORKING_SATURDAY";

            // Marker dot type
            let dotType: "green" | "red" | "blue" | "yellow" | "grey" | null = null;
            if (isHoliday) dotType = "red";
            else if (isWorkingSat) dotType = "blue";
            else if (isWeekend) dotType = "grey";
            else dotType = "green";

            return (
              <div
                key={`day-${cell.dayNum}`}
                className={`day-cell ${isToday ? "today" : ""} ${isHoliday || isWeekend ? "weekend" : ""}`}
                onClick={() => handleDayClick(cell)}
              >
                <span className="day-num">{cell.dayNum}</span>
                {dotType && !isToday && <span className={`day-dot ${dotType}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Legend Row */}
      <div className="calendar-legend-card">
        <div className="legend-item">
          <span className="legend-dot green"></span>
          <span>Working Day</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot red"></span>
          <span>Holiday</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot blue"></span>
          <span>Working Saturday</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot yellow"></span>
          <span>Your Leave</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot grey"></span>
          <span>Non-Working</span>
        </div>
      </div>

      {/* 5. Upcoming Holidays Section */}
      <div className="upcoming-section">
        <h2 className="upcoming-title">Upcoming</h2>
        {upcomingHolidays.length > 0 ? (
          upcomingHolidays.map((hol) => {
            const holDate = new Date(hol.date);
            const holDateStr = holDate.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div key={hol.id} className="upcoming-holiday-card">
                <div className="holiday-icon-box">
                  <CalendarIcon size={20} />
                </div>
                <div className="holiday-text-col">
                  <span className="holiday-name">{hol.name || hol.description || "Holiday"}</span>
                  <span className="holiday-date">{holDateStr}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="upcoming-holiday-card">
            <div className="holiday-icon-box">
              <CalendarIcon size={20} />
            </div>
            <div className="holiday-text-col">
              <span className="holiday-name">Ganesh Chaturthi</span>
              <span className="holiday-date">Mon, 21 Sep 2026</span>
            </div>
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      <MobileCalendarDayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        day={selectedDay}
        selectedDate={selectedDate}
        onViewTeam={() => {
          setIsDayModalOpen(false);
          navigate("/team");
        }}
      />
    </div>
  );
}
