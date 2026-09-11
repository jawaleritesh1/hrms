import "./EmployeeProfileHeader.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiRequest, getFileUrl } from "../../services/api";
import { Pencil, Mail, Phone, CalendarDays, UserCheck, Trash2, Upload } from "lucide-react";
import type { Employee, Role } from "../../types";
import { formatDateLabel } from "../../utils/format";
import AvatarUploadModal from "./AvatarUploadModal";

type EmployeeProfileHeaderProps = {
  employee: Employee;
  role: Role;
  currentEmployeeId: number | null;
  token: string | null;
  onEdit: () => void;
  onToggleStatus: () => void | Promise<void>;
  onAvatarChange: () => void;
};

function getYearsWithUs(joiningDate?: string | null): string {
  if (!joiningDate) return "0.0";
  const start = new Date(joiningDate);
  if (isNaN(start.getTime())) return "0.0";
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs <= 0) return "0.1";
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return years.toFixed(1);
}

function formatRole(role?: string) {
  if (!role) return "-";
  if (role === "ADMIN") return "Administrator";
  if (role === "MANAGER") return "Manager";
  if (role === "HR") return "HR Manager";
  if (role === "EMPLOYEE") return "Employee";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export default function EmployeeProfileHeader({
  employee,
  role,
  currentEmployeeId,
  token,
  onAvatarChange,
}: EmployeeProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [employee.profilePictureUrl, employee.id]);

  const initials = `${employee.firstName?.charAt(0) || ""}${employee.lastName?.charAt(0) || ""}`.toUpperCase();
  const canEditAvatar = role === "ADMIN" || role === "HR" || currentEmployeeId === employee.id;

  async function handleAvatarSave(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      await apiRequest(`/employees/${employee.id}/avatar`, {
        method: "POST",
        token,
        body: formData,
      });
      toast.success("Profile picture updated successfully!");
      setAvatarModalOpen(false);
      onAvatarChange();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarDelete() {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setUploading(true);
    try {
      await apiRequest(`/employees/${employee.id}/avatar`, {
        method: "DELETE",
        token,
      });
      toast.success("Profile picture removed successfully.");
      onAvatarChange();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove profile picture.");
    } finally {
      setUploading(false);
    }
  }

  const yearsWithUs = getYearsWithUs(employee.joiningDate);

  return (
    <article className="card profile-hero">
      {/* Hero Body: Left Avatar & Identity, Right Stats */}
      <div className="profile-hero__body">
        <div className="profile-hero__left">
          {/* Avatar Box */}
          <div className="profile-hero__avatar-wrap">
            <div className="profile-hero__avatar" aria-hidden="true">
              {employee.profilePictureUrl && !avatarError ? (
                <img
                  src={getFileUrl(employee.profilePictureUrl) || ""}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="profile-hero__avatar-image"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                initials
              )}
            </div>
            {canEditAvatar && (
              <div className="profile-hero__avatar-btn-row">
                <button
                  type="button"
                  className="profile-hero__avatar-btn"
                  onClick={() => setAvatarModalOpen(true)}
                  title={employee.profilePictureUrl ? "Update photo" : "Upload photo"}
                  disabled={uploading}
                >
                  {employee.profilePictureUrl ? <Pencil size={13} /> : <Upload size={13} />}
                </button>
                {employee.profilePictureUrl && (
                  <button
                    type="button"
                    className="profile-hero__avatar-btn profile-hero__avatar-btn--delete"
                    onClick={handleAvatarDelete}
                    title="Remove photo"
                    disabled={uploading}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Identity details */}
          <div className="profile-hero__identity">
            <div className="profile-hero__name-group">
              <span className="profile-hero__code-badge">{employee.employeeCode || "EMP"}</span>
              <div className="profile-hero__title-row">
                <h2 className="profile-hero__name">{`${employee.firstName} ${employee.lastName}`}</h2>
                <span className={`profile-hero__status-pill ${employee.isActive ? "active" : "inactive"}`}>
                  <span className="profile-hero__status-text">{employee.isActive ? "ACTIVE" : "INACTIVE"}</span>
                  <span className="profile-hero__status-dot" />
                </span>
              </div>
            </div>

            <p className="profile-hero__subtitle">
              <span>{employee.department?.name || "Software Development"}</span>
              <span className="profile-hero__subtitle-sep">|</span>
              <span>{employee.jobTitle || formatRole(employee.user?.role.name)}</span>
            </p>

            <p className="profile-hero__quote">
              “Building better workplaces, together.”
            </p>
          </div>
        </div>

        {/* Right Metric Columns */}
        <div className="profile-hero__metrics">
          <div className="profile-hero__metric-col">
            <span className="profile-hero__metric-val">{yearsWithUs}</span>
            <span className="profile-hero__metric-lbl">
              Years<br />With Us
            </span>
          </div>
          <div className="profile-hero__metric-divider" />
          <div className="profile-hero__metric-col">
            <span className="profile-hero__metric-val profile-hero__metric-val--text">
              {employee.department?.name || "-"}
            </span>
            <span className="profile-hero__metric-lbl">Department</span>
          </div>
          <div className="profile-hero__metric-divider" />
          <div className="profile-hero__metric-col">
            <span className="profile-hero__metric-val profile-hero__metric-val--text">
              {formatRole(employee.user?.role.name)}
            </span>
            <span className="profile-hero__metric-lbl">Role</span>
          </div>
        </div>
      </div>

      {/* Bottom Contact Strip */}
      <div className="profile-hero__contact-strip">
        <div className="profile-hero__contact-card">
          <div className="profile-hero__contact-icon">
            <Mail size={16} />
          </div>
          <div className="profile-hero__contact-info">
            <span className="profile-hero__contact-label">EMAIL</span>
            <span className="profile-hero__contact-value" title={employee.user?.email || "-"}>
              {employee.user?.email || "-"}
            </span>
          </div>
        </div>

        <div className="profile-hero__contact-card">
          <div className="profile-hero__contact-icon">
            <Phone size={16} />
          </div>
          <div className="profile-hero__contact-info">
            <span className="profile-hero__contact-label">PHONE</span>
            <span className="profile-hero__contact-value">
              {employee.phone || "-"}
            </span>
          </div>
        </div>

        <div className="profile-hero__contact-card">
          <div className="profile-hero__contact-icon">
            <CalendarDays size={16} />
          </div>
          <div className="profile-hero__contact-info">
            <span className="profile-hero__contact-label">JOINED</span>
            <span className="profile-hero__contact-value">
              {formatDateLabel(employee.joiningDate)}
            </span>
          </div>
        </div>

        <div className="profile-hero__contact-card">
          <div className="profile-hero__contact-icon">
            <UserCheck size={16} />
          </div>
          <div className="profile-hero__contact-info">
            <span className="profile-hero__contact-label">MANAGER</span>
            <span className="profile-hero__contact-value">
              {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : "-"}
            </span>
          </div>
        </div>
      </div>

      <AvatarUploadModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onSave={handleAvatarSave}
        uploading={uploading}
      />
    </article>
  );
}
