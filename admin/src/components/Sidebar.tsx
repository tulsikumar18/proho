import React from "react";
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Tag,
  CalendarCheck2,
  Wallet,
  ScrollText,
} from "lucide-react";

export type NavTab = "overview" | "kyc" | "properties" | "offers" | "visits" | "finance" | "audit";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingCounts: {
    kyc: number;
    properties: number;
    offers: number;
    payouts: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, pendingCounts }) => {
  const navItems = [
    { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
    { id: "kyc" as NavTab, label: "Partner KYC", icon: UserCheck, count: pendingCounts.kyc },
    { id: "properties" as NavTab, label: "Properties", icon: Building2, count: pendingCounts.properties },
    { id: "offers" as NavTab, label: "Offers & Terms", icon: Tag, count: pendingCounts.offers },
    { id: "visits" as NavTab, label: "Visits & Slots", icon: CalendarCheck2 },
    { id: "finance" as NavTab, label: "Finance & Payouts", icon: Wallet, count: pendingCounts.payouts },
    { id: "audit" as NavTab, label: "Audit Logs", icon: ScrollText },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">A</div>
        <div className="brand-info">
          <h1>AASHRAYO</h1>
          <p>Admin Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="nav-label-group">
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.count && item.count > 0 ? (
                <span className="nav-badge">{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
          Aashrayo Platform v1.0.0
        </div>
      </div>
    </aside>
  );
};
