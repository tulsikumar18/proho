import React from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import type { User as UserType } from "../types";

interface HeaderProps {
  user: UserType;
  activeTabTitle: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, activeTabTitle, onLogout }) => {
  return (
    <header className="admin-header">
      <div className="header-title-group">
        <h2>{activeTabTitle}</h2>
        <p>Aashrayo Real Estate Channel Partner Operations</p>
      </div>

      <div className="header-actions">
        <div className="status-pill" title="Connected to Django Backend API">
          <span className="status-dot"></span>
          <span>API Connected (v1)</span>
        </div>

        <div className="user-card" style={{ marginLeft: 8 }}>
          <div className="user-avatar">
            <ShieldCheck size={18} />
          </div>
          <div className="user-meta">
            <h4>{user.full_name}</h4>
            <span style={{ color: "var(--accent-emerald-text)", fontWeight: 700 }}>{user.role}</span>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 6, gap: 6 }}
            onClick={onLogout}
            title="Sign out of Admin Portal"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
