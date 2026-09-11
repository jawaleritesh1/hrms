import { memo, useEffect, useMemo, useState } from "react";
import "./TimeCard.css";

type TimeCardProps = {
  timezone: string;
  now?: Date;
  isPrimary?: boolean;
  children?: React.ReactNode;
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type AnalogClockProps = {
  timezone: string;
  now: Date;
};

const displayFormatterCache = new Map<string, Intl.DateTimeFormat>();
const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getDisplayFormatter(timezone: string) {
  const cacheKey = `display:${timezone}`;
  if (!displayFormatterCache.has(cacheKey)) {
    displayFormatterCache.set(
      cacheKey,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    );
  }
  return displayFormatterCache.get(cacheKey)!;
}

function getDateFormatter(timezone: string) {
  const cacheKey = `date:${timezone}`;
  if (!dateFormatterCache.has(cacheKey)) {
    dateFormatterCache.set(
      cacheKey,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
  }
  return dateFormatterCache.get(cacheKey)!;
}

function getPartsFormatter(timezone: string) {
  const cacheKey = `parts:${timezone}`;
  if (!partsFormatterCache.has(cacheKey)) {
    partsFormatterCache.set(
      cacheKey,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    );
  }
  return partsFormatterCache.get(cacheKey)!;
}

function getZonedParts(date: Date, timezone: string): ZonedParts {
  const parts = getPartsFormatter(timezone).formatToParts(date);
  const readPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: readPart("year"),
    month: readPart("month"),
    day: readPart("day"),
    hour: readPart("hour"),
    minute: readPart("minute"),
    second: readPart("second"),
  };
}

const CITY_COUNTRY_MAP: Record<string, { city: string; country: string }> = {
  "Asia/Kolkata": { city: "Kolkata", country: "India" },
  "America/Los_Angeles": { city: "Los Angeles", country: "USA" },
  "America/New_York": { city: "New York", country: "USA" },
  "Europe/London": { city: "London", country: "UK" },
  "Asia/Dubai": { city: "Dubai", country: "UAE" },
  "Asia/Singapore": { city: "Singapore", country: "Singapore" },
  "Australia/Sydney": { city: "Sydney", country: "Australia" },
};

function getReadableLocationLabel(timezone: string) {
  if (CITY_COUNTRY_MAP[timezone]) {
    return CITY_COUNTRY_MAP[timezone];
  }
  const segments = timezone.split("/");
  const city = segments[segments.length - 1]?.replace(/_/g, " ") ?? timezone;
  const country = segments.length > 1 ? segments[0].replace(/_/g, " ") : "";
  return { city, country };
}

function AnalogClock({ timezone, now }: AnalogClockProps) {
  const parts = useMemo(() => getZonedParts(now, timezone), [now, timezone]);
  const secondRotation = parts.second * 6;
  const minuteRotation = parts.minute * 6 + parts.second * 0.1;
  const hourRotation = (parts.hour % 12) * 30 + parts.minute * 0.5;

  return (
    <div className="time-card__analog" aria-hidden="true">
      <div className="time-card__dial">
        {/* Cardinal Markers: 12, 3, 6, 9 */}
        <span className="time-card__num-mark time-card__num-mark--12">12</span>
        <span className="time-card__num-mark time-card__num-mark--3">3</span>
        <span className="time-card__num-mark time-card__num-mark--6">6</span>
        <span className="time-card__num-mark time-card__num-mark--9">9</span>

        {/* 12 dial ticks */}
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="time-card__tick"
            style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
          />
        ))}

        {/* Hands */}
        <span
          className="time-card__hand time-card__hand--hour"
          style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
        />
        <span
          className="time-card__hand time-card__hand--minute"
          style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
        />
        <span
          className="time-card__hand time-card__hand--second"
          style={{ transform: `translateX(-50%) rotate(${secondRotation}deg)` }}
        />
        <span className="time-card__center-dot" />
      </div>
    </div>
  );
}

const MemoizedAnalogClock = memo(AnalogClock);

export default function TimeCard({
  timezone,
  now: externalNow,
  isPrimary = false,
  children,
}: TimeCardProps) {
  const [internalNow, setInternalNow] = useState(() => new Date());

  useEffect(() => {
    if (externalNow) return;
    const intervalId = window.setInterval(() => {
      setInternalNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [externalNow]);

  const now = externalNow || internalNow;

  const location = useMemo(() => getReadableLocationLabel(timezone), [timezone]);
  const timeLabel = useMemo(() => getDisplayFormatter(timezone).format(now), [now, timezone]);
  const dateLabel = useMemo(() => getDateFormatter(timezone).format(now), [now, timezone]);

  return (
    <article className={`time-card ${isPrimary ? "time-card--primary" : ""}`}>
      {/* Top Header Row: Primary badge or menu */}
      <div className="time-card__header-bar">
        {isPrimary ? (
          <span className="time-card__primary-badge">Your Time</span>
        ) : (
          <div className="time-card__empty-badge" />
        )}
        {children}
      </div>

      {/* Clock Face */}
      <div className="time-card__clock-container">
        <MemoizedAnalogClock timezone={timezone} now={now} />
      </div>

      {/* Time & Location Information */}
      <div className="time-card__info">
        <strong className="time-card__time">{timeLabel}</strong>
        <span className="time-card__location">
          {location.city}, {location.country}
        </span>
        <span className="time-card__date">{dateLabel}</span>
      </div>
    </article>
  );
}
