import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle, Archive, Building2, MapPin } from "lucide-react";
import type { Property } from "../types";

interface PropertyReviewModalProps {
  property: Property;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onArchive: (id: string) => void;
}

export const PropertyReviewModal: React.FC<PropertyReviewModalProps> = ({
  property,
  onClose,
  onApprove,
  onReject,
  onArchive,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("A justification reason is required when rejecting a listing.");
      return;
    }
    onReject(property.id, rejectionReason.trim());
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-icon" style={{ background: "var(--accent-blue-bg)", color: "var(--accent-blue-text)" }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3>Property Listing Evaluation</h3>
              <p className="modal-subtitle">Verify unit specs, ownership NOC & market valuation</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <div className="info-item">
              <span>Society / Project</span>
              <p style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} color="var(--primary-light)" />
                {property.society_name}
              </p>
            </div>
            <div className="info-item">
              <span>Tower & Unit</span>
              <p>{property.tower || "Main"} — Unit {property.unit_number || "N/A"}</p>
            </div>
            <div className="info-item">
              <span>BHK & Area</span>
              <p>{property.bhk_type} ({property.super_area_sqft || "N/A"} sq.ft)</p>
            </div>
            <div className="info-item">
              <span>Asking Price</span>
              <p style={{ color: "var(--accent-emerald-text)", fontWeight: 700 }}>{formatPrice(property.price)}</p>
            </div>
            <div className="info-item">
              <span>Rate per Sq.Ft</span>
              <p>₹{property.rate_per_sqft || "N/A"}</p>
            </div>
            <div className="info-item">
              <span>Tenancy Status</span>
              <p>{property.tenancy_status}</p>
            </div>
            <div className="info-item">
              <span>Sourcing Partner</span>
              <p>{property.owner_name} ({property.owner_phone})</p>
            </div>
            <div className="info-item">
              <span>Current Status</span>
              <p className={`badge badge-${property.status.toLowerCase()}`}>{property.status}</p>
            </div>
          </div>

          {showRejectForm ? (
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Rejection Justification</label>
              <textarea
                className="form-control"
                placeholder="State reason for rejecting listing (e.g. Price too high compared to market comps, missing seller NOC)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                autoFocus
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
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onArchive(property.id);
                  onClose();
                }}
              >
                <Archive size={16} /> Archive
              </button>
              <button className="btn btn-danger-outline" onClick={() => setShowRejectForm(true)}>
                <XCircle size={16} /> Reject
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  onApprove(property.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={16} /> Approve & Publish
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
