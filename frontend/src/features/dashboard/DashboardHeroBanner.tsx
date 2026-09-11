import { useMemo } from "react";
import "./DashboardHeroBanner.css";

type DashboardHeroBannerProps = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
};

export default function DashboardHeroBanner({
  firstName = "Ritesh",
  lastName = "Jawale",
}: DashboardHeroBannerProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  }, []);

  return (
    <article className="executive-hero-banner">
      {/* Background visual overlay */}
      <div className="executive-hero-bg-overlay" />

      <div className="executive-hero-content">
        {/* Left Side: Welcome & Daily Quote */}
        <div className="executive-hero-left">
          <span className="executive-hero-eyebrow">{greeting}</span>
          <h1 className="executive-hero-title">
            Welcome back,<br />
            <span className="executive-hero-name">{firstName} {lastName}</span>
          </h1>
          <p className="executive-hero-subtitle">
            Let's make today productive and meaningful.
          </p>

          <div className="executive-hero-quote-box">
            <span className="executive-hero-quote-mark">“</span>
            <p className="executive-hero-quote-text">
              Discipline today builds the freedom you want tomorrow.
            </p>
            <span className="executive-hero-quote-mark">”</span>
          </div>
        </div>

        {/* Right Side: Corporate Values Pillars */}
        <div className="executive-hero-right">
          <div className="executive-hero-pillars">
            <span className="executive-hero-pillar-item">PEOPLE</span>
            <span className="executive-hero-pillar-item">IDEAS</span>
            <span className="executive-hero-pillar-item">TECHNOLOGY</span>
            <span className="executive-hero-pillar-item">GROWTH</span>
            <div className="executive-hero-pillar-underline" />
          </div>
        </div>
      </div>
    </article>
  );
}
