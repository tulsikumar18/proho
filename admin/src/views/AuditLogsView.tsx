import React from "react";
import type { AuditLog } from "../types";

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div>
          <h3>System Audit Trail & Compliance Logs</h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
            Append-only audit events tracking administrative approvals, payouts, price adjustments, and KYC actions.
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target Model</th>
              <th>IP Address</th>
              <th>Sanitized Metadata Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(log.created_at).toLocaleString("en-IN")}
                  </span>
                </td>
                <td>
                  <span className="highlight-text">{log.actor_name}</span>
                </td>
                <td>
                  <span className="badge badge-blue">
                    {log.action}
                  </span>
                </td>
                <td>
                  <code>{log.target_model}</code>
                </td>
                <td>{log.ip_address || "127.0.0.1"}</td>
                <td>
                  <pre
                    style={{
                      fontSize: "11px",
                      fontFamily: "monospace",
                      background: "rgba(0,0,0,0.3)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      maxWidth: 320,
                      overflowX: "auto",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {JSON.stringify(log.metadata, null, 1)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
