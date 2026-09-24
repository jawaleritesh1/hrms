import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "../../services/api";
import type { LeaveType } from "../../types";
import { countWords, LEAVE_REASON_MIN_WORDS, LEAVE_REASON_MAX_WORDS } from "../leaves/reasonValidation";
import "./MobileApplyLeaveModal.css";

type MobileApplyLeaveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: LeaveType[];
  token: string | null;
  onSuccess: () => void;
};

export default function MobileApplyLeaveModal({
  isOpen,
  onClose,
  leaveTypes,
  token,
  onSuccess,
}: MobileApplyLeaveModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [duration, setDuration] = useState<"FULL_DAY" | "FIRST_HALF" | "SECOND_HALF">("FULL_DAY");
  const [reason, setReason] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const words = countWords(reason);
  const isReasonValid = words >= LEAVE_REASON_MIN_WORDS && words <= LEAVE_REASON_MAX_WORDS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!leaveTypeId) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!isReasonValid) {
      toast.error(`Reason must be between ${LEAVE_REASON_MIN_WORDS} and ${LEAVE_REASON_MAX_WORDS} words (currently ${words} words).`);
      return;
    }

    try {
      setSubmitting(true);
      const effectiveEndDate = isMultiDay ? endDate : startDate;

      let attachmentUrl = "";
      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        const uploadRes = await apiRequest<{ url: string }>("/uploads", {
          method: "POST",
          token,
          body: formData,
        });
        attachmentUrl = uploadRes.data?.url || "";
      }

      await apiRequest("/leaves/request", {
        method: "POST",
        token,
        body: {
          leaveTypeId: Number(leaveTypeId),
          startDate,
          endDate: effectiveEndDate,
          startDayDuration: duration,
          endDayDuration: isMultiDay ? "FULL_DAY" : duration,
          reason,
          attachmentUrl: attachmentUrl || undefined,
        },
      });

      toast.success("Leave request submitted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title">Apply leave</h2>
          <button className="mobile-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form className="mobile-modal-body" onSubmit={handleSubmit}>
          {/* Information Tip Box */}
          <div className="leave-policy-tip-box">
            <ul className="policy-bullets">
              <li>Paid balance shortage converts seamlessly to unpaid leave.</li>
              <li>For multi-day requests, specify half-day start/end dates if needed.</li>
              <li>Sick leaves exceeding 2 days require a medical proof attachment.</li>
            </ul>
          </div>

          {/* Leave Type Select */}
          <div className="mobile-form-group">
            <label className="mobile-form-label">Leave type</label>
            <select
              className="mobile-form-select"
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              required
            >
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
          </div>

          {/* Single Day vs Multiple Days Toggle */}
          <div className="mobile-tab-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isMultiDay ? "active" : ""}`}
              onClick={() => setIsMultiDay(false)}
            >
              One Day Leave
            </button>
            <button
              type="button"
              className={`toggle-btn ${isMultiDay ? "active" : ""}`}
              onClick={() => setIsMultiDay(true)}
            >
              Multiple Days Leave
            </button>
          </div>

          {/* Date Picker */}
          {!isMultiDay ? (
            <div className="mobile-form-group">
              <label className="mobile-form-label">Leave date</label>
              <div className="date-input-wrap">
                <input
                  type="date"
                  className="mobile-form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Calendar className="date-icon" size={18} />
              </div>
            </div>
          ) : (
            <div className="multi-date-row">
              <div className="mobile-form-group">
                <label className="mobile-form-label">From date</label>
                <input
                  type="date"
                  className="mobile-form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="mobile-form-group">
                <label className="mobile-form-label">To date</label>
                <input
                  type="date"
                  className="mobile-form-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Duration Dropdown */}
          <div className="mobile-form-group">
            <label className="mobile-form-label">Duration</label>
            <select
              className="mobile-form-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
            >
              <option value="FULL_DAY">Full day</option>
              <option value="FIRST_HALF">First half</option>
              <option value="SECOND_HALF">Second half</option>
            </select>
          </div>

          {/* Reason Textarea */}
          <div className="mobile-form-group">
            <label className="mobile-form-label">Reason</label>
            <textarea
              className="mobile-form-textarea"
              rows={4}
              placeholder="Enter reason for leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <div className={`word-counter ${isReasonValid ? "valid" : ""}`}>
              {words} words. Keep it between {LEAVE_REASON_MIN_WORDS} and {LEAVE_REASON_MAX_WORDS} words.
            </div>
          </div>

          {/* Attachment (optional) */}
          <div className="mobile-form-group">
            <label className="mobile-form-label">Attachment (optional)</label>
            <input
              type="file"
              className="mobile-file-input"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mobile-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit leave request"}
          </button>
        </form>
      </div>
    </div>
  );
}
