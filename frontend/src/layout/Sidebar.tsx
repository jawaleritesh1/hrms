import "./Sidebar.css";
import {
  Building2,
  Calendar,
  CalendarDays,
  Clock3,
  Gift,
  Home,
  Users,
  Wallet,
  ClipboardList,
  BarChart2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { SessionUser } from "../types";

type SidebarProps = {
  sessionUser: SessionUser;
  navOpen: boolean;
  onNavigate: () => void;
};

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

function getNavItems(sessionUser: SessionUser): NavItem[] {
  const role = sessionUser.role;
  const isTeamLead = Boolean(
    sessionUser.employee?.capabilities?.some(
      (capability) => capability.capability === "TEAM_LEAD"
    )
  );

  const items: NavItem[] = [
    { to: "/", label: "Dashboard", icon: Home, exact: true },
  ];

  if (role !== "EMPLOYEE") {
    items.push({ to: "/departments", label: "Departments", icon: Building2 });
    items.push({ to: "/employees", label: "Employees", icon: Users });
  }

  items.push({ to: "/calendar", label: "Calendar", icon: Calendar });
  items.push({ to: "/attendance", label: "Attendance", icon: Clock3 });
  items.push({ to: "/leaves", label: "Leaves", icon: CalendarDays });
  items.push({ to: "/payroll", label: "Payroll", icon: Wallet });
  items.push({ to: "/incentives", label: "Incentives", icon: Gift });
  items.push({ to: "/tasks/manage", label: "Tasks", icon: ClipboardList });
  items.push({ to: "/analytics", label: "Reports", icon: BarChart2 });

  const isManager = role === "MANAGER";
  if (isTeamLead || isManager || role === "ADMIN" || role === "HR") {
    items.push({ to: "/team", label: "Team", icon: Users, exact: true });
  }

  items.push({
    to: role === "ADMIN" ? "/shifts" : "/notifications",
    label: "Settings",
    icon: Settings,
  });

  return items;
}

export default function Sidebar({ sessionUser, navOpen, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navItems = getNavItems(sessionUser);

  function isActivePath(item: NavItem) {
    if (item.to === "/" || item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  }

  return (
    <aside className={`sidebar ${navOpen ? "open" : ""}`}>
      {/* Top: SGS Logo */}
      <div className="sidebar-brand">
        <Link to="/" onClick={onNavigate} className="sidebar-logo-link">
          <img
            src="/assets/images/Logo.png?v=2"
            alt="Sanskar Growth Solutions"
            className="sidebar-logo"
          />
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = isActivePath(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
            >
              <item.icon size={18} strokeWidth={active ? 2.3 : 1.9} />
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Botanical Leaves & Slogan */}
      <div className="sidebar-footer-wrap">
        <div className="sidebar-slogan-container">
          <div className="sidebar-slogan-content">
            <h4 className="sidebar-slogan-title">
              People<br />
              Process<br />
              Progress
            </h4>
            <p className="sidebar-slogan-sub">
              Together for<br />
              a better tomorrow.
            </p>
            <div className="sidebar-slogan-gold-bar" />
          </div>

          <img
            src="/assets/images/sidebar-leaves.png"
            alt=""
            className="sidebar-leaves-decor"
          />
        </div>

        <div className="sidebar-version-badge">v1.0.0</div>
      </div>
    </aside>
  );
}
