import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { CalendarDays, Users } from "lucide-react";
import "./TeamOnLeaveWidget.css";

export default function TeamOnLeaveWidget() {
  const navigate = useNavigate();
  const { summary } = useApp();
  const teamOnLeave = (summary as any)?.teamOnLeaveToday ?? [];

  return (
    <article className="attendance-widget-card">
      {/* Header */}
      <div className="attendance-widget-header">
        <div className="attendance-widget-header-left">
          <div className="attendance-icon-badge">
            <CalendarDays size={20} strokeWidth={2.2} />
          </div>
          <div className="attendance-titles">
            <h3 className="attendance-title">Today's Attendance</h3>
            <span className="attendance-subtitle">Who's Out Today</span>
          </div>
        </div>

        <button
          type="button"
          className="attendance-view-all-btn"
          onClick={() => navigate("/attendance")}
        >
          View All
        </button>
      </div>

      {/* Body Container */}
      <div className="attendance-widget-body">
        {!teamOnLeave.length ? (
          <div className="attendance-empty-state">
            <div className="attendance-empty-icon-circle">
              <Users size={26} strokeWidth={2} />
            </div>
            <h4 className="attendance-empty-title">Everyone is in today!</h4>
            <p className="attendance-empty-desc">Great! All team members are present.</p>

            {/* Botanical leaf decoration in bottom-left corner */}
            <img
              src="/assets/images/sidebar-leaves.png"
              alt=""
              className="attendance-corner-leaves"
            />
          </div>
        ) : (
          <div className="attendance-leave-list">
            {teamOnLeave.map((request: any) => (
              <div key={request.id} className="attendance-leave-item">
                <div className="attendance-leave-user">
                  <div className="attendance-leave-avatar">
                    {request.employee?.firstName?.[0] ?? "U"}
                  </div>
                  <span className="attendance-leave-name">
                    {request.employee?.firstName} {request.employee?.lastName}
                  </span>
                </div>
                <span className="attendance-leave-badge">{request.leaveType?.name ?? "Leave"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
