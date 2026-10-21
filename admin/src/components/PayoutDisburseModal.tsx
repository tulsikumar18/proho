import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, Wallet, ShieldCheck, FileCheck2 } from "lucide-react";
import type { PayoutRequest } from "../types";

interface PayoutDisburseModalProps {
  payout: PayoutRequest;
  onClose: () => void;
  onDisburse: (id: string, utr: string) => void;
}

export const PayoutDisburseModal: React.FC<PayoutDisburseModalProps> = ({
  payout,
  onClose,
  onDisburse,
}) => {
  const [utrReference, setUtrReference] = useState("");

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

  const handleDisburse = () => {
    if (!utrReference.trim()) {
      alert("A valid Bank UTR / Transaction Reference is mandatory for regulatory audit compliance.");
      return;
    }
    onDisburse(payout.id, utrReference.trim());
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-icon" style={{ background: "var(--accent-emerald-bg)", color: "var(--accent-emerald-text)" }}>
              <Wallet size={18} />
            </div>
            <div>
              <h3>Confirm Payout Disbursement</h3>
              <p className="modal-subtitle">Record banking remittance and ledger journal entry</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="info-box">
            <div className="info-item">
              <span>Partner Name</span>
              <p>{payout.partner_name}</p>
            </div>
            <div className="info-item">
              <span>Contact Number</span>
              <p>{payout.partner_phone}</p>
            </div>
            <div className="info-item">
              <span>Beneficiary Bank</span>
              <p>{payout.bank_name}</p>
            </div>
            <div className="info-item">
              <span>Account Number</span>
              <p>{payout.account_number_masked}</p>
            </div>
            <div className="info-item">
              <span>Bank IFSC</span>
              <p>{payout.ifsc_code}</p>
            </div>
            <div className="info-item">
              <span>Payout Amount</span>
              <p style={{ color: "var(--accent-emerald-text)", fontSize: "16px", fontWeight: 700 }}>
                {formatPrice(payout.amount)}
              </p>
            </div>
          </div>

          {/* Structured UTR Disbursement Card */}
          <div className="utr-disbursement-card">
            <div className="utr-card-header">
              <div className="utr-icon-badge">
                <FileCheck2 size={16} />
              </div>
              <div>
                <label className="utr-label">
                  Bank Transaction Reference / UTR Number <span className="required-star">*</span>
                </label>
                <p className="utr-subtext">Remittance reference number from NEFT/RTGS/IMPS gateway</p>
              </div>
            </div>

            <div className="utr-input-wrapper">
              <input
                type="text"
                className="form-control utr-input-field"
                placeholder="e.g. HDFCN20261021998822"
                value={utrReference}
                onChange={(e) => setUtrReference(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>

            <div className="utr-compliance-note">
              <ShieldCheck size={14} color="var(--accent-emerald-text)" style={{ flexShrink: 0 }} />
              <span>Double-entry debit will be atomically booked to partner ledger upon confirmation.</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleDisburse}>
            <CheckCircle2 size={16} /> Confirm & Mark Disbursed
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
