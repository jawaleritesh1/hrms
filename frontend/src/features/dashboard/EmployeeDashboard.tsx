import { useApp } from "../../context/AppContext";
import DashboardHeroBanner from "./DashboardHeroBanner";
import DashboardHeroClocks from "./DashboardHeroClocks";
import WorkProgressBar from "./WorkProgressBar";
import DashboardStatCards from "./DashboardStatCards";
import TeamOnLeaveWidget from "./TeamOnLeaveWidget";
import TodoWidget from "./TodoWidget";
import "./DashboardPage.css";

export default function EmployeeDashboard({ token }: { token: string | null }) {
  const { summary } = useApp();

  const attendanceToday = summary?.attendanceToday ?? null;
  const currentEmployee = summary?.currentEmployee ?? null;

  return (
    <div className="executive-dashboard-container">
      {/* 1. Welcome Hero Banner */}
      <DashboardHeroBanner
        firstName={currentEmployee?.firstName || "Ritesh"}
        lastName={currentEmployee?.lastName || "Jawale"}
        jobTitle={currentEmployee?.jobTitle || "Technical Manager"}
      />

      {/* 2. World Clocks (5 clocks) */}
      <DashboardHeroClocks />

      {/* 3. Work Progress & Motivational Bar */}
      <WorkProgressBar
        attendanceToday={attendanceToday}
      />

      {/* 4. Four Stat Metric Cards */}
      <DashboardStatCards
        teamCount={Number(summary?.teamCount ?? 0)}
        leaveRequestsCount={Number(summary?.pendingLeaves ?? 0)}
        correctionRequestsCount={Number(summary?.pendingApprovals ?? 0)}
        presenceTodayCount={Number((summary as any)?.teamPresentToday ?? 0)}
      />

      {/* 5. Lower Row: Today's Attendance & My To-Do List */}
      <div className="dashboard-lower-grid">
        <TeamOnLeaveWidget />
        <TodoWidget token={token} />
      </div>
    </div>
  );
}
