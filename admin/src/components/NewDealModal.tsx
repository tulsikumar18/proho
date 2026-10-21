import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, Handshake } from "lucide-react";
import type { Property } from "../types";

interface NewDealModalProps {
  properties: Property[];
  onClose: () => void;
  onSubmit: (propertyId: string, partnerName: string, amount: string) => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  properties,
  onClose,
  onSubmit,
}) => {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || "");
  const [partnerName, setPartnerName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const agreementNum = parseFloat(amount) || 0;
  const grossComm = agreementNum * 0.02; // 2%
  const tds = grossComm * 0.05; // 5%
  const net = grossComm - tds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !amount) {
      alert("Please select a property and enter an agreement value.");
      return;
    }
    onSubmit(propertyId, partnerName, amount);
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-light)" }}>
              <Handshake size={18} />
            </div>
            <div>
              <h3>Record & Close Property Deal</h3>
              <p className="modal-subtitle">Generate regulatory brokerage invoice with Sec. 194H TDS</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Sold / Registered Property</label>
              <select
                className="form-control"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.society_name} — {p.tower || "Tower"} {p.unit_number || "Unit"} ({p.bhk_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Referring Channel Partner</label>
              <input
                type="text"
                className="form-control"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Partner full name or agency"
              />
            </div>

            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Final Agreement Value (INR)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 7500000"
              />
            </div>

            <div className="info-box" style={{ marginTop: 16 }}>
              <div className="info-item">
                <span>Standard Brokerage (2%)</span>
                <p>₹{grossComm.toLocaleString("en-IN")}</p>
              </div>
              <div className="info-item">
                <span>Sec. 194H TDS (5%)</span>
                <p style={{ color: "var(--accent-amber-text)" }}>- ₹{tds.toLocaleString("en-IN")}</p>
              </div>
              <div className="info-item" style={{ gridColumn: "span 2" }}>
                <span>Net Payable Credit to Partner Ledger</span>
                <p style={{ color: "var(--accent-emerald-text)", fontSize: "16px", fontWeight: 700 }}>
                  ₹{net.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <CheckCircle2 size={16} /> Register Deal & Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
