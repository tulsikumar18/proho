import React, { useState } from "react";
import { Eye } from "lucide-react";
import type { Property } from "../types";
import { PropertyReviewModal } from "../components/PropertyReviewModal";

interface PropertiesViewProps {
  properties: Property[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onArchive: (id: string) => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  onApprove,
  onReject,
  onArchive,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filtered = properties.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  const formatPrice = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div>
          <h3>Property Inventory & Submissions</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
            Manage sourced resale listings and curated Aashrayo verified selling inventory.
          </p>
        </div>

        <div className="filter-tabs">
          {["ALL", "PENDING_REVIEW", "APPROVED", "REJECTED", "ARCHIVED"].map((tab) => (
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
              <th>Society / Project</th>
              <th>Unit Specs</th>
              <th>BHK & Area</th>
              <th>Expected Price</th>
              <th>Rate / Sq.Ft</th>
              <th>Sourcing Partner</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="highlight-text">{item.society_name}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.category}</div>
                </td>
                <td>
                  {item.tower || "Tower"} - Unit {item.unit_number || "N/A"}
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Floor {item.floor_number || "N/A"}</div>
                </td>
                <td>
                  <span className="badge badge-blue">{item.bhk_type}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                    {item.super_area_sqft || "N/A"} sq.ft
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--accent-emerald)" }}>
                    {formatPrice(item.price)}
                  </span>
                </td>
                <td>₹{item.rate_per_sqft || "N/A"}</td>
                <td>
                  <span className="highlight-text">{item.owner_name}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.owner_phone}</div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "PENDING_REVIEW"
                        ? "badge-pending"
                        : item.status === "APPROVED"
                        ? "badge-approved"
                        : item.status === "REJECTED"
                        ? "badge-rejected"
                        : "badge-blue"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedProperty(item)}
                  >
                    <Eye size={14} /> Evaluate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProperty ? (
        <PropertyReviewModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onApprove={(id) => {
            onApprove(id);
            setSelectedProperty(null);
          }}
          onReject={(id, reason) => {
            onReject(id, reason);
            setSelectedProperty(null);
          }}
          onArchive={(id) => {
            onArchive(id);
            setSelectedProperty(null);
          }}
        />
      ) : null}
    </div>
  );
};
