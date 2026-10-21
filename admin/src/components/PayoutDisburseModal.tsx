import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Payout Disbursement</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
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
              <p style={{ color: "var(--accent-emerald)", fontSize: "16px" }}>{formatPrice(payout.amount)}</p>
            </div>
          </div>

          <div className="form-group">
            <label>
              Bank Transaction Reference / UTR Number <span style={{ color: "var(--accent-rose)" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. HDFCN20261021998822"
              value={utrReference}
              onChange={(e) => setUtrReference(e.target.value)}
            />
            <small style={{ color: "var(--text-muted)", fontSize: "11px", marginTop: 4, display: "block" }}>
              Double-entry debit will be atomically booked to partner ledger upon confirmation.
            </small>
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
    </div>
  );
};
