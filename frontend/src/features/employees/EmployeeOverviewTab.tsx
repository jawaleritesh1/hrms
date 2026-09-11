import "./EmployeeOverviewTab.css";
import { Building2, User, Users, Wallet, Pencil } from "lucide-react";
import type { Employee } from "../../types";
import { formatDateLabel } from "../../utils/format";

type EmployeeOverviewTabProps = {
  employee: Employee;
  token?: string | null;
  onEdit?: () => void;
};

type DetailRow = {
  label: string;
  value: React.ReactNode;
};

export default function EmployeeOverviewTab({ employee, onEdit }: EmployeeOverviewTabProps) {
  const numberFormatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const employmentItems: DetailRow[] = [
    { label: "Department", value: employee.department?.name ?? "-" },
    { label: "Role", value: employee.user?.role.name ?? "-" },
    { label: "Joining Date", value: formatDateLabel(employee.joiningDate) },
    {
      label: "Employment Status",
      value: (
        <span className={`overview-status-val ${employee.isActive ? "active" : "inactive"}`}>
          <span className="overview-status-dot" />
          {employee.isActive ? "ACTIVE" : "INACTIVE"}
        </span>
      ),
    },
    { label: "Workspace Access", value: employee.isActive ? "Active" : "Inactive" },
  ];

  const personalItems: DetailRow[] = [
    { label: "Date of Birth", value: employee.dateOfBirth ? formatDateLabel(employee.dateOfBirth) : "-" },
    { label: "PAN Card No.", value: employee.panCardNumber ?? "-" },
    { label: "Blood Group", value: "-" },
    { label: "Emergency Contact", value: "-" },
    { label: "Address", value: "-" },
  ];

  const reportingItems: DetailRow[] = [
    { label: "Manager", value: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "-" },
    { label: "Department Code", value: employee.department?.code ?? "-" },
    { label: "Employment Type", value: employee.employmentStatus === "ACTIVE" ? "Current employee" : "Restricted access" },
    { label: "Reporting Location", value: "-" },
  ];

  const compensationItems: DetailRow[] = [
    { label: "Annual Package", value: employee.annualPackageLpa != null ? "₹ " + numberFormatter.format(employee.annualPackageLpa) : "-" },
    { label: "Gross Monthly", value: employee.grossMonthlySalary != null ? "₹ " + numberFormatter.format(employee.grossMonthlySalary) : "-" },
    { label: "Basic Monthly", value: employee.basicMonthlySalary != null ? "₹ " + numberFormatter.format(employee.basicMonthlySalary) : "-" },
    { label: "Probation", value: employee.isOnProbation ? "On probation" : "Not on probation" },
    { label: "Probation End", value: employee.probationEndDate ? formatDateLabel(employee.probationEndDate) : "-" },
  ];

  return (
    <div className="overview-tab">
      <div className="overview-tab__grid">
        {/* Card 1: Employment Details */}
        <section className="overview-section-card">
          <div className="overview-section-card__header">
            <div className="overview-section-card__title-wrap">
              <div className="overview-section-card__icon">
                <Building2 size={18} />
              </div>
              <h4>
                <span>Employment</span> Details
              </h4>
            </div>
            {onEdit && (
              <button type="button" className="overview-card__edit-btn" onClick={onEdit}>
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="overview-detail-list">
            {employmentItems.map((item) => (
              <div key={item.label} className="overview-detail-row">
                <span className="overview-detail-row__label">{item.label}</span>
                <span className="overview-detail-row__value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card 2: Personal Details */}
        <section className="overview-section-card">
          <div className="overview-section-card__header">
            <div className="overview-section-card__title-wrap">
              <div className="overview-section-card__icon">
                <User size={18} />
              </div>
              <h4>Personal Details</h4>
            </div>
            {onEdit && (
              <button type="button" className="overview-card__edit-btn" onClick={onEdit}>
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="overview-detail-list">
            {personalItems.map((item) => (
              <div key={item.label} className="overview-detail-row">
                <span className="overview-detail-row__label">{item.label}</span>
                <span className="overview-detail-row__value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card 3: Reporting Details */}
        <section className="overview-section-card">
          <div className="overview-section-card__header">
            <div className="overview-section-card__title-wrap">
              <div className="overview-section-card__icon">
                <Users size={18} />
              </div>
              <h4>Reporting Details</h4>
            </div>
            {onEdit && (
              <button type="button" className="overview-card__edit-btn" onClick={onEdit}>
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="overview-detail-list">
            {reportingItems.map((item) => (
              <div key={item.label} className="overview-detail-row">
                <span className="overview-detail-row__label">{item.label}</span>
                <span className="overview-detail-row__value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card 4: Compensation */}
        <section className="overview-section-card">
          <div className="overview-section-card__header">
            <div className="overview-section-card__title-wrap">
              <div className="overview-section-card__icon">
                <Wallet size={18} />
              </div>
              <h4>Compensation</h4>
            </div>
            {onEdit && (
              <button type="button" className="overview-card__edit-btn" onClick={onEdit}>
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="overview-detail-list">
            {compensationItems.map((item) => (
              <div key={item.label} className="overview-detail-row">
                <span className="overview-detail-row__label">{item.label}</span>
                <span className="overview-detail-row__value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
