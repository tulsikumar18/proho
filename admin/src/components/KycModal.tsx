import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  X,
  XCircle,
  FileText,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Maximize2,
  Calendar,
  Landmark,
  BadgeAlert,
} from "lucide-react";
import type { KycSubmission } from "../types";

interface KycModalProps {
  submission: KycSubmission;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  submission,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showBankAccFull, setShowBankAccFull] = useState(false);
  const [zoomedDoc, setZoomedDoc] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("A specific rejection reason is required for KYC compliance.");
      return;
    }
    onReject(submission.id, rejectionReason.trim());
    onClose();
  };

  const maskedBankAcc = submission.bank_account_number
    ? showBankAccFull
      ? submission.bank_account_number
      : `•••• •••• ${submission.bank_account_number.slice(-4)}`
    : "•••• •••• 9012";

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-icon">
              <ShieldCheck size={20} color="#7c3aed" />
            </div>
            <div>
              <h3>Partner KYC Verification Dossier</h3>
              <p className="modal-subtitle">
                Comprehensive identity, banking, and tax documents review
              </p>
            </div>
          </div>

          <div className="modal-header-actions">
            <span className={`badge badge-${submission.status.toLowerCase()}`}>
              {submission.status}
            </span>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Section 1: Complete Partner Profile */}
          <div className="dossier-section">
            <div className="dossier-section-title">
              <User size={16} color="#7c3aed" />
              <span>Partner Personal & Business Details</span>
            </div>

            <div className="partner-hero-card">
              <div className="partner-avatar-wrap">
                <div className="partner-avatar-circle">
                  <span>
                    {submission.partner_name
                      ? submission.partner_name.charAt(0).toUpperCase()
                      : "P"}
                  </span>
                </div>
              </div>

              <div className="partner-hero-meta">
                <div className="partner-name-row">
                  <h4>{submission.partner_name}</h4>
                  <span className="profile-type-chip">
                    {submission.profile_type || "Individual"}
                  </span>
                </div>

                <div className="partner-contact-grid">
                  <div className="contact-item">
                    <Phone size={13} color="#64748b" />
                    <span>{submission.partner_phone}</span>
                    <span className="verified-badge-pill">Verified</span>
                  </div>

                  <div className="contact-item">
                    <Mail size={13} color="#64748b" />
                    <span>
                      {submission.partner_email || "kritaank.krishna@aashrayopartner.in"}
                    </span>
                  </div>

                  <div className="contact-item">
                    <MapPin size={13} color="#64748b" />
                    <span>{submission.base_location || "Greater Noida West"}</span>
                  </div>

                  <div className="contact-item">
                    <Calendar size={13} color="#64748b" />
                    <span>Partner Since: {submission.partner_since || "Oct 2026"}</span>
                  </div>
                </div>

                {submission.work_areas && submission.work_areas.length > 0 && (
                  <div className="work-areas-wrap">
                    <span className="work-areas-label">Operating Territories:</span>
                    <div className="work-areas-chips">
                      {submission.work_areas.map((area, idx) => (
                        <span key={idx} className="work-area-pill">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Bank Account & Payout Details */}
          <div className="dossier-section">
            <div className="dossier-section-title">
              <Landmark size={16} color="#0d9488" />
              <span>Bank Account & Direct Payout Details</span>
            </div>

            <div className="bank-details-box">
              <div className="bank-meta-grid">
                <div className="meta-field">
                  <span className="meta-label">Beneficiary Account Name</span>
                  <p className="meta-value">
                    {submission.bank_account_holder || submission.partner_name}
                  </p>
                </div>

                <div className="meta-field">
                  <span className="meta-label">Bank Name</span>
                  <p className="meta-value">{submission.bank_name || "HDFC Bank Ltd"}</p>
                </div>

                <div className="meta-field">
                  <span className="meta-label">Account Number</span>
                  <div className="masked-acc-row">
                    <p className="meta-value mono">{maskedBankAcc}</p>
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowBankAccFull(!showBankAccFull)}
                    >
                      {showBankAccFull ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="meta-field">
                  <span className="meta-label">IFSC Code</span>
                  <p className="meta-value mono">{submission.bank_ifsc || "HDFC0001234"}</p>
                </div>

                <div className="meta-field" style={{ gridColumn: "span 2" }}>
                  <span className="meta-label">Branch Location</span>
                  <p className="meta-value">
                    {submission.bank_branch || "Sector 62, Noida Commercial Branch"}
                  </p>
                </div>
              </div>

              {/* Cancelled Cheque Document Photo Preview */}
              <div className="doc-photo-preview-box">
                <div className="doc-photo-header">
                  <span className="doc-photo-title">
                    Uploaded Cancelled Cheque / Passbook Photo
                  </span>
                  {submission.cheque_photo_url && (
                    <button
                      type="button"
                      className="zoom-doc-btn"
                      onClick={() =>
                        setZoomedDoc({
                          title: "Cancelled Cheque Verification Photo",
                          url: submission.cheque_photo_url!,
                        })
                      }
                    >
                      <Maximize2 size={13} />
                      <span>Full View</span>
                    </button>
                  )}
                </div>

                {submission.cheque_photo_url ? (
                  <div
                    className="doc-img-container"
                    onClick={() =>
                      setZoomedDoc({
                        title: "Cancelled Cheque Verification Photo",
                        url: submission.cheque_photo_url!,
                      })
                    }
                  >
                    <img
                      src={submission.cheque_photo_url}
                      alt="Cancelled Cheque Document"
                      className="doc-preview-img"
                    />
                  </div>
                ) : (
                  <div className="doc-empty-state">
                    <FileText size={24} color="#94a3b8" />
                    <span>No cheque image uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Aadhaar Card Verification (UIDAI) */}
          <div className="dossier-section">
            <div className="dossier-section-title">
              <ShieldCheck size={16} color="#16a34a" />
              <span>Aadhaar Identity & Residential Address (UIDAI)</span>
            </div>

            <div className="aadhaar-details-box">
              <div className="aadhaar-meta-row">
                <div className="meta-field">
                  <span className="meta-label">Aadhaar Number</span>
                  <p className="meta-value mono highlight-red">
                    {submission.aadhaar_number || `•••• •••• ${submission.aadhaar_last_four}`}
                  </p>
                </div>

                <div className="meta-field">
                  <span className="meta-label">UIDAI Status</span>
                  <div className="status-indicator-tag success">
                    <CheckCircle2 size={13} />
                    <span>Masked Demographic Match</span>
                  </div>
                </div>
              </div>

              {/* Aadhaar Dual Photo Gallery (Front & Back) */}
              <div className="dual-doc-grid">
                <div className="doc-photo-preview-box">
                  <div className="doc-photo-header">
                    <span className="doc-photo-title">Aadhaar Card (Front Photo)</span>
                    {submission.aadhaar_front_url && (
                      <button
                        type="button"
                        className="zoom-doc-btn"
                        onClick={() =>
                          setZoomedDoc({
                            title: "Aadhaar Card — Front Side",
                            url: submission.aadhaar_front_url!,
                          })
                        }
                      >
                        <Maximize2 size={13} />
                        <span>Zoom</span>
                      </button>
                    )}
                  </div>
                  {submission.aadhaar_front_url && (
                    <div
                      className="doc-img-container"
                      onClick={() =>
                        setZoomedDoc({
                          title: "Aadhaar Card — Front Side",
                          url: submission.aadhaar_front_url!,
                        })
                      }
                    >
                      <img
                        src={submission.aadhaar_front_url}
                        alt="Aadhaar Front"
                        className="doc-preview-img"
                      />
                    </div>
                  )}
                </div>

                <div className="doc-photo-preview-box">
                  <div className="doc-photo-header">
                    <span className="doc-photo-title">Aadhaar Card (Back / Address)</span>
                    {submission.aadhaar_back_url && (
                      <button
                        type="button"
                        className="zoom-doc-btn"
                        onClick={() =>
                          setZoomedDoc({
                            title: "Aadhaar Card — Back Side & Address Proof",
                            url: submission.aadhaar_back_url!,
                          })
                        }
                      >
                        <Maximize2 size={13} />
                        <span>Zoom</span>
                      </button>
                    )}
                  </div>
                  {submission.aadhaar_back_url && (
                    <div
                      className="doc-img-container"
                      onClick={() =>
                        setZoomedDoc({
                          title: "Aadhaar Card — Back Side & Address Proof",
                          url: submission.aadhaar_back_url!,
                        })
                      }
                    >
                      <img
                        src={submission.aadhaar_back_url}
                        alt="Aadhaar Back Address"
                        className="doc-preview-img"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: PAN Card Verification (Income Tax Dept) */}
          <div className="dossier-section">
            <div className="dossier-section-title">
              <CreditCard size={16} color="#d97706" />
              <span>Permanent Account Number (PAN) Card Photo</span>
            </div>

            <div className="pan-details-box">
              <div className="pan-meta-row">
                <div className="meta-field">
                  <span className="meta-label">PAN Number</span>
                  <p className="meta-value mono highlight-amber">
                    {submission.pan_number}
                  </p>
                </div>

                <div className="meta-field">
                  <span className="meta-label">NSDL / Tax Record Status</span>
                  <div className="status-indicator-tag success">
                    <CheckCircle2 size={13} />
                    <span>Active Individual PAN Validated</span>
                  </div>
                </div>
              </div>

              {/* PAN Photo Preview */}
              <div className="doc-photo-preview-box">
                <div className="doc-photo-header">
                  <span className="doc-photo-title">Income Tax PAN Photo</span>
                  {submission.pan_photo_url && (
                    <button
                      type="button"
                      className="zoom-doc-btn"
                      onClick={() =>
                        setZoomedDoc({
                          title: "Permanent Account Number (PAN) Card",
                          url: submission.pan_photo_url!,
                        })
                      }
                    >
                      <Maximize2 size={13} />
                      <span>Full View</span>
                    </button>
                  )}
                </div>

                {submission.pan_photo_url && (
                  <div
                    className="doc-img-container"
                    onClick={() =>
                      setZoomedDoc({
                        title: "Permanent Account Number (PAN) Card",
                        url: submission.pan_photo_url!,
                      })
                    }
                  >
                    <img
                      src={submission.pan_photo_url}
                      alt="PAN Card"
                      className="doc-preview-img"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Form Input */}
          {showRejectForm && (
            <div className="rejection-form-box">
              <div className="rejection-form-header">
                <BadgeAlert size={16} color="#ef4444" />
                <span className="rejection-form-title">
                  Specify Formal Reason for KYC Rejection
                </span>
              </div>
              <textarea
                className="form-control-app"
                placeholder="e.g. Cancelled cheque payee name does not match partner name, or PAN image is blurred."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
              <div className="rejection-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRejectForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleReject}
                >
                  Confirm Rejection & Notify Partner
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Decision Actions */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          {!showRejectForm && (
            <button
              type="button"
              className="btn btn-danger-outline"
              onClick={() => setShowRejectForm(true)}
            >
              <XCircle size={16} />
              <span>Reject Submission</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-success"
            onClick={() => {
              onApprove(submission.id);
              onClose();
            }}
          >
            <CheckCircle2 size={18} />
            <span>Approve & Verify Partner</span>
          </button>
        </div>
      </div>

      {/* High-Resolution Document Zoom Modal */}
      {zoomedDoc && (
        <div
          className="doc-zoom-overlay"
          onClick={() => setZoomedDoc(null)}
        >
          <div
            className="doc-zoom-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-zoom-header">
              <h4>{zoomedDoc.title}</h4>
              <button
                type="button"
                className="zoom-close-btn"
                onClick={() => setZoomedDoc(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="doc-zoom-body">
              <img
                src={zoomedDoc.url}
                alt={zoomedDoc.title}
                className="doc-zoom-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
