import React, { useState } from "react";
import { CheckCircle2, X, XCircle, FileText, ExternalLink } from "lucide-react";
import type { KycSubmission } from "../types";

interface KycModalProps {
  submission: KycSubmission;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const KycModal: React.FC<KycModalProps> = ({ submission, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("A specific rejection reason is required for KYC compliance.");
      return;
    }
    onReject(submission.id, rejectionReason.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Partner KYC Verification</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <div className="info-item">
              <span>Partner Name</span>
              <p>{submission.partner_name}</p>
            </div>
            <div className="info-item">
              <span>Mobile Contact</span>
              <p>{submission.partner_phone}</p>
            </div>
            <div className="info-item">
              <span>Agency / Firm</span>
              <p>{submission.agency_name || "Individual Broker"}</p>
            </div>
            <div className="info-item">
              <span>Submission Status</span>
              <p className={`badge badge-${submission.status.toLowerCase()}`}>{submission.status}</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: "14px", marginBottom: 12, color: "var(--text-primary)" }}>
              Submitted Verification Documents
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--bg-primary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Permanent Account Number (PAN)
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{submission.pan_number}</p>
                  </div>
                </div>
                {submission.pan_document_url ? (
                  <a
                    href={submission.pan_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                ) : (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Self-verified</span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "var(--bg-primary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Aadhaar / Address Proof
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Masked UID: **** **** {submission.aadhaar_last_four}
                    </p>
                  </div>
                </div>
                {submission.address_document_url ? (
                  <a
                    href={submission.address_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <ExternalLink size={14} /> View
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {showRejectForm ? (
            <div className="form-group" style={{ animation: "fadeIn 0.2s" }}>
              <label>Mandatory Rejection Justification Note</label>
              <textarea
                className="form-control"
                placeholder="Specify why documents were rejected (e.g., PAN image unreadable, mismatch with legal name)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          {showRejectForm ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowRejectForm(false)}>
                Back
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                Confirm Rejection
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-danger" onClick={() => setShowRejectForm(true)}>
                <XCircle size={16} /> Reject Submission
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  onApprove(submission.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={16} /> Approve KYC
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
