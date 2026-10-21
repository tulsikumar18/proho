import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
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
  const [partnerName, setPartnerName] = useState("Amit Verma");
  const [amount, setAmount] = useState("7500000");

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record & Close Property Deal</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
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

            <div className="form-group">
              <label>Referring Channel Partner</label>
              <input
                type="text"
                className="form-control"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Partner full name or agency"
              />
            </div>

            <div className="form-group">
              <label>Final Agreement Value (INR)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 7500000"
              />
            </div>

            <div className="info-box" style={{ marginTop: 20 }}>
              <div className="info-item">
                <span>Standard Brokerage (2%)</span>
                <p>₹{grossComm.toLocaleString("en-IN")}</p>
              </div>
              <div className="info-item">
                <span>Sec. 194H TDS (5%)</span>
                <p style={{ color: "var(--accent-amber)" }}>- ₹{tds.toLocaleString("en-IN")}</p>
              </div>
              <div className="info-item" style={{ gridColumn: "span 2" }}>
                <span>Net Payable Credit to Partner Ledger</span>
                <p style={{ color: "var(--accent-emerald)", fontSize: "16px" }}>
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
    </div>
  );
};
