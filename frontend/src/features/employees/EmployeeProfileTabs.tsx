import "./EmployeeProfileTabs.css";
import React from "react";
import { Sparkles, Calendar, FileText, CreditCard, Folder } from "lucide-react";

export type EmployeeProfileTabKey = "overview" | "attendance" | "leaves" | "payroll" | "documents";

type TabItem = {
  key: EmployeeProfileTabKey;
  label: string;
};

type EmployeeProfileTabsProps = {
  activeTab: EmployeeProfileTabKey;
  tabs?: TabItem[];
  onChange: (tab: EmployeeProfileTabKey) => void;
};

const defaultTabs: TabItem[] = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "leaves", label: "Leaves" },
  { key: "payroll", label: "Payroll" },
  { key: "documents", label: "Documents" },
];

const tabIcons: Record<EmployeeProfileTabKey, React.ReactNode> = {
  overview: <Sparkles size={15} />,
  attendance: <Calendar size={15} />,
  leaves: <FileText size={15} />,
  payroll: <CreditCard size={15} />,
  documents: <Folder size={15} />,
};

export default function EmployeeProfileTabs({ activeTab, tabs = defaultTabs, onChange }: EmployeeProfileTabsProps) {
  return (
    <nav className="employee-profile-tabs" role="tablist" aria-label="Employee profile sections">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`employee-profile-tab ${isActive ? "active" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            <span className="employee-profile-tab__icon">{tabIcons[tab.key]}</span>
            <span className="employee-profile-tab__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
