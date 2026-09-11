import { useNavigate } from "react-router-dom";
import { Users, FileText, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";
import "./DashboardStatCards.css";

type DashboardStatCardsProps = {
  teamCount?: number;
  leaveRequestsCount?: number;
  correctionRequestsCount?: number;
  presenceTodayCount?: number;
};

export default function DashboardStatCards({
  teamCount = 0,
  leaveRequestsCount = 0,
  correctionRequestsCount = 0,
  presenceTodayCount = 0,
}: DashboardStatCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      id: "team-members",
      title: "Team Members",
      count: teamCount,
      subtitle: "Active team members",
      icon: Users,
      iconVariant: "green-card",
      bgClass: "stat-card--team-green",
      path: "/team",
      arrowVariant: "arrow-white",
    },
    {
      id: "leave-requests",
      title: "Leave Requests",
      count: leaveRequestsCount,
      subtitle: "Awaiting your decision",
      icon: FileText,
      iconVariant: "cream-card",
      bgClass: "stat-card--leaves-cream",
      path: "/leaves",
      arrowVariant: "arrow-gold",
    },
    {
      id: "correction-requests",
      title: "Correction Requests",
      count: correctionRequestsCount,
      subtitle: "Need your review",
      icon: ShieldCheck,
      iconVariant: "sage-card",
      bgClass: "stat-card--correction-sage",
      path: "/attendance/requests",
      arrowVariant: "arrow-sage",
    },
    {
      id: "team-presence",
      title: "Team Presence Today",
      count: presenceTodayCount,
      subtitle: "Checked-in members",
      icon: UserCheck,
      iconVariant: "warm-card",
      bgClass: "stat-card--presence-warm",
      path: "/attendance",
      arrowVariant: "arrow-gold",
    },
  ];

  return (
    <div className="dashboard-stat-cards-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <article
            key={card.id}
            className={`dashboard-stat-card ${card.bgClass}`}
            onClick={() => navigate(card.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(card.path);
              }
            }}
          >
            {/* Top Row: Icon and Title */}
            <div className="stat-card-header">
              <div className={`stat-card-icon-wrap stat-card-icon-wrap--${card.iconVariant}`}>
                <IconComponent size={22} strokeWidth={2.2} />
              </div>
              <span className="stat-card-title">{card.title}</span>
            </div>

            {/* Middle: Big Metric Value */}
            <div className="stat-card-metric-wrap">
              <span className="stat-card-count">{card.count}</span>
            </div>

            {/* Bottom Row: Subtitle and Action Arrow Button */}
            <div className="stat-card-footer">
              <span className="stat-card-subtitle">{card.subtitle}</span>
              <button
                type="button"
                className={`stat-card-arrow-btn stat-card-arrow-btn--${card.arrowVariant}`}
                aria-label={`View ${card.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.path);
                }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
