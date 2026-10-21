import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle, ArrowLeftRight, Tag } from "lucide-react";
import type { Offer } from "../types";

interface OfferReviewModalProps {
  offer: Offer;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onCounter: (id: string, counterAmount: string, notes: string) => void;
}

export const OfferReviewModal: React.FC<OfferReviewModalProps> = ({
  offer,
  onClose,
  onAccept,
  onReject,
  onCounter,
}) => {
  const [mode, setMode] = useState<"view" | "reject" | "counter">("view");
  const [rejectionReason, setRejectionReason] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNotes, setCounterNotes] = useState("");

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
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("A reason is required to reject an offer.");
      return;
    }
    onReject(offer.id, rejectionReason.trim());
    onClose();
  };

  const handleCounter = () => {
    if (!counterAmount.trim() || isNaN(parseFloat(counterAmount))) {
      alert("Please enter a valid numeric counteroffer amount in INR.");
      return;
    }
    onCounter(offer.id, counterAmount.trim(), counterNotes.trim());
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-light)" }}>
              <Tag size={18} />
            </div>
            <div>
              <h3>Offer Review & Negotiation</h3>
              <p className="modal-subtitle">Evaluate buyer purchase bid, issue counterterms or accept</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <div className="info-item">
              <span>Target Property</span>
              <p>{offer.property_title}</p>
            </div>
            <div className="info-item">
              <span>Referring Partner</span>
              <p>{offer.partner_name}</p>
            </div>
            <div className="info-item">
              <span>Prospective Buyer</span>
              <p>{offer.customer_name || "Direct Customer"}</p>
            </div>
            <div className="info-item">
              <span>Offer Amount</span>
              <p style={{ color: "var(--accent-emerald-text)", fontSize: "16px", fontWeight: 700 }}>
                {formatPrice(offer.offer_amount)}
              </p>
            </div>
          </div>

          {offer.notes && (
            <div style={{ marginBottom: 16, padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Buyer Notes / Conditions:</span>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: 4 }}>{offer.notes}</p>
            </div>
          )}

          {mode === "reject" && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Rejection Reason</label>
              <textarea
                className="form-control"
                placeholder="State why the offer was rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                autoFocus
              />
            </div>
          )}

          {mode === "counter" && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label>Counteroffer Price (INR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 7200000"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Counter Terms / Inclusions</label>
                <textarea
                  className="form-control"
                  placeholder="e.g. Price includes modular kitchen fittings and 1 covered parking..."
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {mode !== "view" ? (
            <>
              <button className="btn btn-secondary" onClick={() => setMode("view")}>
                Back
              </button>
              {mode === "reject" ? (
                <button className="btn btn-danger" onClick={handleReject}>
                  Confirm Rejection
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCounter}>
                  Issue Counteroffer
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setMode("counter")}>
                <ArrowLeftRight size={16} /> Counter
              </button>
              <button className="btn btn-danger-outline" onClick={() => setMode("reject")}>
                <XCircle size={16} /> Reject
              </button>
              <button
                className="btn btn-success"
                onClick={() => {
                  onAccept(offer.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={16} /> Accept Offer
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
