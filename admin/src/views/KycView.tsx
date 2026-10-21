import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import type { KycSubmission } from "../types";
import { KycModal } from "../components/KycModal";

interface KycViewProps {
  submissions: KycSubmission[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const KycView: React.FC<KycViewProps> = ({ submissions, onApprove, onReject }) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);

  const filtered = submissions.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div>
          <h3>Partner KYC Verification Queue</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
            Verify broker identity documents, PAN, Aadhaar, and RERA credentials.
          </p>
        </div>

        <div className="filter-tabs">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              className={`filter-btn ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Partner Name</th>
              <th>Agency / Firm</th>
              <th>PAN Number</th>
              <th>Aadhaar (Last 4)</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="highlight-text">{item.partner_name}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.partner_phone}</div>
                </td>
                <td>{item.agency_name || "Individual Broker"}</td>
                <td>
                  <code style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.pan_number}</code>
                </td>
                <td>**** {item.aadhaar_last_four}</td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "PENDING"
                        ? "badge-pending"
                        : item.status === "APPROVED"
                        ? "badge-approved"
                        : "badge-rejected"
                    }`}
                  >
                    {item.status === "PENDING" ? (
                      <Clock size={12} />
                    ) : item.status === "APPROVED" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.created_at).toLocaleDateString("en-IN")}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedSubmission(item)}
                  >
                    <Eye size={14} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSubmission ? (
        <KycModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={(id) => {
            onApprove(id);
            setSelectedSubmission(null);
          }}
          onReject={(id, reason) => {
            onReject(id, reason);
            setSelectedSubmission(null);
          }}
        />
      ) : null}
    </div>
  );
};
