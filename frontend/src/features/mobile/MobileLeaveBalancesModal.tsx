import { X } from "lucide-react";
import type { LeaveBalance } from "../../types";
import "./MobileLeaveBalancesModal.css";

type MobileLeaveBalancesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  balances: LeaveBalance[];
};

export default function MobileLeaveBalancesModal({
  isOpen,
  onClose,
  balances,
}: MobileLeaveBalancesModalProps) {
  if (!isOpen) return null;

  // Derive balances
  const clBalance = balances.find(b => b.leaveType?.code === "CL" || b.leaveType?.name?.toLowerCase().includes("casual"));
  const slBalance = balances.find(b => b.leaveType?.code === "SL" || b.leaveType?.name?.toLowerCase().includes("sick"));
  const plBalance = balances.find(b => b.leaveType?.code === "PL" || b.leaveType?.name?.toLowerCase().includes("privilege"));
  const lwpBalance = balances.find(b => b.leaveType?.code === "LWP" || b.leaveType?.name?.toLowerCase().includes("without pay"));

  // Default fallback quotas if not seeded yet
  const clDays = clBalance?.remainingDays ?? 3;
  const slDays = slBalance?.remainingDays ?? 2;
  const plDays = plBalance?.remainingDays ?? 5;
  const lwpDays = lwpBalance?.remainingDays ?? 0;

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title">Leave balances</h2>
          <button className="mobile-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mobile-modal-body">
          {/* Hero Leave Wallet Card */}
          <div className="leave-wallet-hero">
            <span className="wallet-tag">LEAVE WALLET</span>
            <h3 className="wallet-title">Your available time off</h3>
            <p className="wallet-desc">
              Live balance for the current financial year. Paid leave is shown here based on your latest approved requests.
            </p>

            <div className="quarterly-cards-grid">
              {/* Current Quarter Q2 */}
              <div className="quarter-card">
                <div className="quarter-header">
                  <span className="quarter-label">CURRENT QUARTER</span>
                  <span className="quarter-badge">Q2</span>
                </div>
                <div className="quarter-months">Jul to Sep</div>
                <div className="quarter-taken">0 days taken</div>
                <div className="quarter-status in-progress">
                  <span className="status-dot"></span> IN PROGRESS
                </div>
              </div>

              {/* Previous Quarter Q1 */}
              <div className="quarter-card">
                <div className="quarter-header">
                  <span className="quarter-label">PREVIOUS QUARTER</span>
                  <span className="quarter-badge">Q1</span>
                </div>
                <div className="quarter-months">Apr to Jun</div>
                <div className="quarter-taken">0 days taken</div>
                <div className="quarter-status within-quota">
                  <span className="status-dot"></span> WITHIN QUOTA
                </div>
              </div>
            </div>
          </div>

          {/* Leave Type List Items */}
          <div className="leave-balance-list">
            <div className="leave-balance-item">
              <div className="leave-code-badge cl">CL</div>
              <div className="leave-name">Casual Leave</div>
              <div className="leave-days-count">
                <strong>{clDays} days</strong>
                <span>Available</span>
              </div>
            </div>

            <div className="leave-balance-item">
              <div className="leave-code-badge sl">SL</div>
              <div className="leave-name">Sick Leave</div>
              <div className="leave-days-count">
                <strong>{slDays} days</strong>
                <span>Available</span>
              </div>
            </div>

            <div className="leave-balance-item">
              <div className="leave-code-badge pl">PL</div>
              <div className="leave-name">Privileged Leave</div>
              <div className="leave-days-count">
                <strong>{plDays} days</strong>
                <span>Available</span>
              </div>
            </div>

            <div className="leave-balance-item">
              <div className="leave-code-badge lwp">LWP</div>
              <div className="leave-name">Leave Without Pay</div>
              <div className="leave-days-count">
                <strong>{lwpDays} days</strong>
                <span>Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
