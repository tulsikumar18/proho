import React, { useState } from "react";
import { CalendarCheck2, Clock, CheckCircle2, XCircle, KeyRound } from "lucide-react";
import type { Visit } from "../types";

interface VisitsViewProps {
  visits: Visit[];
  onCancelVisit: (id: string, reason: string) => void;
}

export const VisitsView: React.FC<VisitsViewProps> = ({ visits, onCancelVisit }) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Client requested rescheduling");

  const filtered = visits.filter((v) => {
    if (filter === "ALL") return true;
    return v.status === filter;
  });

  const handleConfirmCancel = () => {
    if (cancelModalId) {
      onCancelVisit(cancelModalId, cancelReason);
      setCancelModalId(null);
    }
  };

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div>
          <h3>Scheduled Site Visits & Door Access</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
            Supervise scheduled property walk-throughs, slot concurrency, and 6-digit OTP verification status.
          </p>
        </div>

        <div className="filter-tabs">
          {["ALL", "SCHEDULED", "VERIFIED_COMPLETED", "CANCELLED"].map((tab) => (
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
              <th>Property & Society</th>
              <th>Partner</th>
              <th>Buyer Lead</th>
              <th>Field Representative</th>
              <th>Slot Time</th>
              <th>Door OTP Status</th>
              <th>Visit Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="highlight-text">{item.society_name}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.property_title}</div>
                </td>
                <td>
                  <span className="highlight-text">{item.partner_name}</span>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.partner_phone}</div>
                </td>
                <td>{item.customer_name || "Direct Buyer"}</td>
                <td>{item.assigned_representative || "Proho Field Executive"}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span>
                      {new Date(item.scheduled_start).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(item.scheduled_end).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {new Date(item.scheduled_start).toLocaleDateString("en-IN")}
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      item.otp_status === "VERIFIED"
                        ? "badge-approved"
                        : item.otp_status === "PENDING"
                        ? "badge-pending"
                        : "badge-blue"
                    }`}
                  >
                    <KeyRound size={12} />
                    {item.otp_status || "PENDING"}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "VERIFIED_COMPLETED"
                        ? "badge-approved"
                        : item.status === "SCHEDULED"
                        ? "badge-blue"
                        : "badge-rejected"
                    }`}
                  >
                    {item.status === "VERIFIED_COMPLETED" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <CalendarCheck2 size={12} />
                    )}
                    {item.status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {item.status === "SCHEDULED" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: "var(--accent-rose)" }}
                      onClick={() => setCancelModalId(item.id)}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cancelModalId ? (
        <div className="modal-overlay" onClick={() => setCancelModalId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Scheduled Site Visit</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Standardized Cancellation Reason</label>
                <select
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Client unavailable / requested reschedule">Client unavailable / requested reschedule</option>
                  <option value="Unit keys / lock access issue">Unit keys / lock access issue</option>
                  <option value="Adverse weather / traffic delay">Adverse weather / traffic delay</option>
                  <option value="Duplicate booking slot arbitration">Duplicate booking slot arbitration</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModalId(null)}>
                Back
              </button>
              <button className="btn btn-danger" onClick={handleConfirmCancel}>
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
