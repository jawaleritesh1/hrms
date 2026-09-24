import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Wallet, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import type { LeaveBalance, LeaveRequest, LeaveType } from "../../types";
import MobileLeaveBalancesModal from "./MobileLeaveBalancesModal";
import MobileApplyLeaveModal from "./MobileApplyLeaveModal";
import "./MobileLeaves.css";

type MobileLeavesProps = {
  token: string | null;
  currentEmployeeId?: number | null;
};

export default function MobileLeaves({ token }: MobileLeavesProps) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"my-requests" | "leave-balance">("my-requests");
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBalancesOpen, setIsBalancesOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [balRes, typesRes, leavesRes] = await Promise.all([
        apiRequest<{ balances: LeaveBalance[] }>("/leaves/balances", { token }),
        apiRequest<{ leaveTypes: LeaveType[] }>("/leaves/types", { token }),
        apiRequest<{ leaves: LeaveRequest[] }>("/leaves/my", { token }),
      ]);

      setBalances(balRes.data?.balances || []);
      setLeaveTypes(typesRes.data?.leaveTypes || []);
      setLeaves(leavesRes.data?.leaves || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Total available days (sum of quotas)
  const totalAvailable = balances.reduce((sum, b) => {
    if (b.leaveType?.deductFullQuotaOnApproval) return sum;
    return sum + (b.remainingDays || 0);
  }, 0) || 12; // Fallback to 12 days as in reference design

  // When activeTab switches to "leave-balance", trigger modal and return to "my-requests"
  const handleTabClick = (tab: "my-requests" | "leave-balance") => {
    setActiveTab(tab);
    if (tab === "leave-balance") {
      setIsBalancesOpen(true);
    }
  };

  const displayedRequests = showAllRequests ? leaves : leaves.slice(0, 5);

  return (
    <div className="mobile-leaves-page">
      {/* 1. Header with back arrow */}
      <div className="mobile-page-header">
        <button className="mobile-back-btn" onClick={() => navigate("/")} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="mobile-page-title">Leave</h1>
        <div style={{ width: 24 }} />
      </div>

      {/* 2. Segmented Navigation Pills */}
      <div className="segmented-pills-bar">
        <button
          className={`seg-pill ${activeTab === "my-requests" ? "active" : ""}`}
          onClick={() => handleTabClick("my-requests")}
        >
          My Requests
        </button>
        <button
          className={`seg-pill ${activeTab === "leave-balance" ? "active" : ""}`}
          onClick={() => handleTabClick("leave-balance")}
        >
          Leave Balance
        </button>
      </div>

      {/* 3. Available Leave Card */}
      <div className="available-leave-card" onClick={() => setIsBalancesOpen(true)}>
        <div className="avail-icon-box">
          <Wallet size={24} />
        </div>
        <div className="avail-text-col">
          <span className="avail-sub">Available Leave</span>
          <strong className="avail-count">{totalAvailable} days</strong>
        </div>
        <div className="avail-chevron">
          <ChevronRight size={20} />
        </div>
      </div>

      {/* 4. Action Button: Caramel "+ Apply for Leave" */}
      <button className="apply-leave-caramel-btn" onClick={() => setIsApplyOpen(true)}>
        <Plus size={20} strokeWidth={2.5} />
        <span>Apply for Leave</span>
      </button>

      {/* 5. Recent Requests Section */}
      <div className="recent-requests-section">
        <div className="recent-requests-header">
          <h2 className="recent-title">Recent Requests</h2>
          {leaves.length > 3 && (
            <button
              className="view-all-link"
              onClick={() => setShowAllRequests(!showAllRequests)}
            >
              {showAllRequests ? "Show Less" : "View All"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="leaves-loading-msg">Loading requests...</div>
        ) : displayedRequests.length === 0 ? (
          <div className="no-requests-box">
            <p>No recent leave requests found.</p>
          </div>
        ) : (
          <div className="timeline-requests-list">
            {displayedRequests.map((req, idx) => {
              const dateStr = new Date(req.startDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              let statusClass = "pending";
              let statusLabel = "Pending";

              if (req.status === "APPROVED") {
                statusClass = "approved";
                statusLabel = "Approved";
              } else if (req.status === "REJECTED" || req.status === "CANCELLED") {
                statusClass = "rejected";
                statusLabel = "Rejected";
              }

              return (
                <div key={req.id} className="timeline-request-item">
                  <div className="timeline-indicator-col">
                    <div className={`timeline-node ${statusClass}`}></div>
                    {idx < displayedRequests.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-request-content">
                    <div className="request-info">
                      <span className="request-date">{dateStr}</span>
                      <span className="request-type">{req.leaveType?.name || "Leave"}</span>
                    </div>
                    <div className={`request-status-badge ${statusClass}`}>
                      {statusLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leave Balances Modal */}
      <MobileLeaveBalancesModal
        isOpen={isBalancesOpen}
        onClose={() => {
          setIsBalancesOpen(false);
          setActiveTab("my-requests");
        }}
        balances={balances}
      />

      {/* Apply Leave Modal */}
      <MobileApplyLeaveModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        leaveTypes={leaveTypes}
        token={token}
        onSuccess={fetchData}
      />
    </div>
  );
}
