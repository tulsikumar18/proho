import React, { useState } from "react";
import { Eye } from "lucide-react";
import type { Offer } from "../types";
import { OfferReviewModal } from "../components/OfferReviewModal";

interface OffersViewProps {
  offers: Offer[];
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onCounter: (id: string, counterAmount: string, notes: string) => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  offers,
  onAccept,
  onReject,
  onCounter,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const filtered = offers.filter((o) => {
    if (filter === "ALL") return true;
    return o.status === filter;
  });

  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div>
          <h3>Offers & Counteroffers Queue</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
            Evaluate formal buyer purchase offers, issue counter terms, and approve deal terms.
          </p>
        </div>

        <div className="filter-tabs">
          {["ALL", "UNDER_REVIEW", "COUNTERED", "ACCEPTED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Referring Partner</th>
              <th>Prospective Buyer</th>
              <th>Offer Amount</th>
              <th>Counter Amount</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="highlight-text">{item.property_title}</span>
                </td>
                <td>{item.partner_name}</td>
                <td>{item.customer_name || "Direct Customer"}</td>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {formatPrice(item.offer_amount)}
                  </span>
                </td>
                <td>
                  {item.counter_amount ? (
                    <span style={{ color: "var(--accent-indigo)", fontWeight: 600 }}>
                      {formatPrice(item.counter_amount)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "ACCEPTED"
                        ? "badge-approved"
                        : item.status === "COUNTERED"
                        ? "badge-blue"
                        : item.status === "REJECTED"
                        ? "badge-rejected"
                        : "badge-pending"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedOffer(item)}
                  >
                    <Eye size={14} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOffer ? (
        <OfferReviewModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={(id) => {
            onAccept(id);
            setSelectedOffer(null);
          }}
          onReject={(id, reason) => {
            onReject(id, reason);
            setSelectedOffer(null);
          }}
          onCounter={(id, counterAmount, notes) => {
            onCounter(id, counterAmount, notes);
            setSelectedOffer(null);
          }}
        />
      ) : null}
    </div>
  );
};
