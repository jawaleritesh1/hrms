import { useState } from "react";
import type { Role } from "../../types";
import DashboardHeroBanner from "./DashboardHeroBanner";
import DashboardHeroClocks from "./DashboardHeroClocks";
import WorkProgressBar from "./WorkProgressBar";
import DashboardStatCards from "./DashboardStatCards";
import TeamOnLeaveWidget from "./TeamOnLeaveWidget";
import TodoWidget from "./TodoWidget";
import Modal from "../../components/common/Modal";
import AnnouncementForm from "./AnnouncementForm";
import { useApp, type DashboardSummary } from "../../context/AppContext";
import "./DashboardPage.css";

export default function ManagementDashboard({ token, role: _role }: { token: string | null; role: Role }) {
  const { summary, loading } = useApp();
  const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);

  const data = summary || ({} as DashboardSummary);

  if (loading) {
    return (
      <div className="page-loading">
        <article className="card skeleton-card skeleton-card--hero">
          <span className="skeleton-line skeleton-line--short" />
          <span className="skeleton-line skeleton-line--title" />
          <span className="skeleton-line skeleton-line--long" />
        </article>
      </div>
    );
  }

  const teamCount = Number(data.teamCount ?? data.employees ?? 0);
  const leaveRequestsCount = Number(data.pendingLeaves ?? 0);
  const correctionRequestsCount = Number(data.pendingApprovals ?? 0);
  const presenceTodayCount = Number((data as any)?.teamPresentToday ?? 0);

  return (
    <div className="executive-dashboard-container">
      {/* 1. Welcome Hero Banner */}
      <DashboardHeroBanner
        firstName={data.currentEmployee?.firstName || "Ritesh"}
        lastName={data.currentEmployee?.lastName || "Jawale"}
        jobTitle={data.currentEmployee?.jobTitle || "Technical Manager"}
      />

      {/* 2. World Clocks (5 clocks) */}
      <DashboardHeroClocks />

      {/* 3. Work Progress & Motivational Bar */}
      <WorkProgressBar
        attendanceToday={data.attendanceToday}
      />

      {/* 4. Four Stat Metric Cards */}
      <DashboardStatCards
        teamCount={teamCount}
        leaveRequestsCount={leaveRequestsCount}
        correctionRequestsCount={correctionRequestsCount}
        presenceTodayCount={presenceTodayCount}
      />

      {/* 5. Lower Row: Today's Attendance & My To-Do List */}
      <div className="dashboard-lower-grid">
        <TeamOnLeaveWidget />
        <TodoWidget token={token} />
      </div>

      <Modal
        open={isAnnouncementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        className="broadcast-studio-modal"
      >
        <AnnouncementForm
          token={token}
          onCreated={() => {
            setAnnouncementModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
