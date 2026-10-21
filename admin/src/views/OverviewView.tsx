import React from "react";
import {
  UserCheck,
  Building2,
  Tag,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { NavTab } from "../components/Sidebar";

interface OverviewViewProps {
  stats: {
    pendingKyc: number;
    pendingProperties: number;
    activeOffers: number;
    pendingPayouts: number;
    totalProperties: number;
    verifiedVisits: number;
  };
  onNavigate: (tab: NavTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ stats, onNavigate }) => {
  return (
    <div>
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => onNavigate("kyc")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-wrap amber">
            <UserCheck size={24} />
          </div>
          <div className="kpi-details">
            <span>Pending KYC Submissions</span>
            <h3>{stats.pendingKyc}</h3>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate("properties")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-wrap blue">
            <Building2 size={24} />
          </div>
          <div className="kpi-details">
            <span>Properties Under Review</span>
            <h3>{stats.pendingProperties}</h3>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate("offers")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-wrap purple">
            <Tag size={24} />
          </div>
          <div className="kpi-details">
            <span>Active Offers / Negs</span>
            <h3>{stats.activeOffers}</h3>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate("finance")} style={{ cursor: "pointer" }}>
          <div className="kpi-icon-wrap emerald">
            <Wallet size={24} />
          </div>
          <div className="kpi-details">
            <span>Pending Payout Requests</span>
            <h3>{stats.pendingPayouts}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div className="panel-header">
          <h3>High-Priority Operational Actions</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="action-card-item">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="kpi-icon-wrap amber" style={{ width: 44, height: 44 }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                  Review Partner KYC Submissions
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
                  {stats.pendingKyc} channel partner profiles require PAN, Aadhaar, and RERA document verification.
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("kyc")}>
              Open Queue <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="action-card-item">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="kpi-icon-wrap emerald" style={{ width: 44, height: 44 }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                  Payout Requests Waiting for Disbursement
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 2 }}>
                  {stats.pendingPayouts} approved partner withdrawals require bank UTR transaction references.
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("finance")}>
              Review Payouts <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
